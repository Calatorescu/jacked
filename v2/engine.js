/* JACKED v2 — motorul logic: stocare, bloc și periodizare, progresie dublă, zone de puls,
   ciorna ședinței, statistici, import din v1. Fără DOM: se testează în node (tests/engine.test.js).
   În browser folosește localStorage; în node primește un obiect de stocare prin J2.setStorage(). */
"use strict";

const J2 = (() => {
  const K = {
    logs: "jacked2.logs.v1", draft: "jacked2.draft.v1", settings: "jacked2.settings.v1",
    subs: "jacked2.subs.v1", body: "jacked2.body.v1", sched: "jacked2.sched.v1"
  };
  const mem = {};
  let LS = {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: k => { delete mem[k]; }
  };
  if (typeof localStorage !== "undefined") LS = localStorage;
  const setStorage = s => { LS = s; };

  const rd = (k, d) => { try { const v = JSON.parse(LS.getItem(k)); return v === null || v === undefined ? d : v; } catch { return d; } };
  const wr = (k, v) => LS.setItem(k, JSON.stringify(v));

  const DEFAULT_SETTINGS = {
    hrRest: 53, hrMax: 173, unit: "kg", startDay: 0, blockStart: null, taliaDays: 14,
    kineto: [], pasiTinta: 8000, proteinaTinta: 150
  };

  /* ===== Date ===== */
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dateOf = s => new Date(s + "T12:00:00");
  const addDays = (s, n) => { const d = dateOf(s); d.setDate(d.getDate() + n); return iso(d); };
  const todayISO = () => iso(new Date());
  const weekday = s => (dateOf(s).getDay() + 6) % 7; // 0 = luni
  const mondayOf = s => addDays(s, -weekday(s));
  const diffDays = (a, b) => Math.round((dateOf(b) - dateOf(a)) / 86400000);

  /* ===== Stocare ===== */
  const store = {
    logs: () => rd(K.logs, []),
    saveLogs: l => wr(K.logs, l),
    draft: () => rd(K.draft, null),
    saveDraft: d => wr(K.draft, d),
    clearDraft: () => LS.removeItem(K.draft),
    settings: () => Object.assign({}, DEFAULT_SETTINGS, rd(K.settings, {})),
    saveSettings: s => wr(K.settings, s),
    subs: () => rd(K.subs, {}),
    saveSubs: s => wr(K.subs, s),
    body: () => Object.assign({ daily: {}, talie: [] }, rd(K.body, {})),
    saveBody: b => wr(K.body, b),
    sched: () => Object.assign({ cursor: 0 }, rd(K.sched, {})),
    saveSched: s => wr(K.sched, s)
  };

  /* ===== Blocul de 12 săptămâni ===== */
  function ensureBlockStart(settings, today) {
    if (!settings.blockStart) { settings.blockStart = mondayOf(today || todayISO()); store.saveSettings(settings); }
    return settings.blockStart;
  }
  /* săptămâna din bloc, 1..12, calendaristică de la blockStart; după 12 se reia */
  function blockWeek(today, settings) {
    const start = settings.blockStart || mondayOf(today);
    const d = diffDays(start, today);
    if (d < 0) return 1;
    return (Math.floor(d / 7) % 12) + 1;
  }
  function blockNumber(today, settings) {
    const start = settings.blockStart || mondayOf(today);
    const d = Math.max(0, diffDays(start, today));
    return Math.floor(d / 84) + 1;
  }
  function phase(week) {
    if (week <= 4) return { week, rpe: "7", rpeMax: 7, compoundMinus: 1, half: false, loadMul: 1, deload: false, label: "Reacomodare", desc: "RPE 7, o serie mai puțin la compuse" };
    if (week <= 8) return { week, rpe: "8", rpeMax: 8, compoundMinus: 0, half: false, loadMul: 1, deload: false, label: "Acumulare", desc: "RPE 8, seriile complete" };
    if (week <= 11) return { week, rpe: "8–9", rpeMax: 9, compoundMinus: 0, half: false, loadMul: 1, deload: false, label: "Intensificare", desc: "RPE 8–9, seriile complete" };
    return { week, rpe: "deload", rpeMax: 6, compoundMinus: 0, half: true, loadMul: 0.7, deload: true, label: "Deload", desc: "jumătate din serii, −30 % greutate, cardio doar zonă 2" };
  }

  /* ===== Program ===== */
  const planDay = (weekdayIdx, settings) => WEEK[((weekdayIdx - (settings.startDay || 0)) % 7 + 7) % 7];
  /* ziua care urmează, după cursor (ședința sărită se decalează, nu se pierde) */
  function nextDayId(sched) { return WEEK[((sched.cursor || 0) % 7 + 7) % 7]; }
  function advanceCursor(dayId) {
    const s = store.sched();
    s.cursor = (WEEK.indexOf(dayId) + 1) % 7;
    s.lastDone = dayId;
    store.saveSched(s);
    return s;
  }
  function setCursor(dayId) { const s = store.sched(); s.cursor = WEEK.indexOf(dayId); store.saveSched(s); return s; }

  /* seriile-țintă ale unui exercițiu în faza curentă */
  function targetSets(planItem, ex, ph) {
    let sets = planItem.sets;
    if (ph.deload) return Math.max(1, Math.ceil(sets / 2));
    if (ph.compoundMinus && ex.compound) sets = Math.max(1, sets - ph.compoundMinus);
    return sets;
  }
  const restFor = ex => (ex.core ? REST.core : ex.compound ? REST.compound : REST.iso);

  /* ===== Istoric ===== */
  const doneSets = sets => (sets || []).filter(s => s.done && Number(s.r) > 0);
  function lastPerf(logs, exId, opts) {
    const skipDeload = opts && opts.skipDeload;
    for (let i = logs.length - 1; i >= 0; i--) {
      const l = logs[i];
      if (skipDeload && l.deload) continue;
      const sets = doneSets(l.entries && l.entries[exId]);
      if (sets.length) return { date: l.date, sets, deload: !!l.deload, source: l.source || "v2" };
    }
    return null;
  }
  const roundTo = (w, inc) => (inc ? Math.round(w / inc) * inc : Math.round(w * 2) / 2);
  const fmtW = w => (w === "" || w === null || w === undefined ? "" : (Number(w) % 1 === 0 ? String(Number(w)) : String(Number(w)).replace(".", ",")));

  /* Progresie dublă:
     - toate seriile la capătul de sus cu RPE ≤ 9 → +2,5 % (cel puțin un increment)
     - vreo serie sub capătul de jos → −5 % (cel puțin un increment)
     - altfel aceeași greutate; deload: −30 % din greutatea de lucru */
  function suggest(exId, planItem, logs, ph) {
    const ex = EX[exId];
    const inc = ex.inc || 2.5;
    const last = lastPerf(logs, exId, { skipDeload: true });
    const sets = targetSets(planItem, ex, ph);
    const unit = ex.unit || "rep";
    if (!last) {
      const txt = ex.bodyweight && !ex.inc
        ? `Corp propriu: ${planItem.repLow}${planItem.repHigh !== planItem.repLow ? "–" + planItem.repHigh : ""} ${unit === "s" ? "s" : unit === "m" ? "m" : "rep"}`
        : `Alege o greutate cu care faci ${planItem.repLow} curat la RPE ${ph.rpe}`;
      return { w: "", r: planItem.repLow, dir: "new", text: txt, sets, lastDate: null };
    }
    const w = Math.max(...last.sets.map(s => Number(s.w) || 0));
    const minR = Math.min(...last.sets.map(s => Number(s.r)));
    const maxRpe = Math.max(...last.sets.map(s => Number(s.rpe) || 0));
    let nw = w, dir = "same", text = "";
    if (ph.deload) {
      nw = roundTo(w * ph.loadMul, inc);
      return { w: nw, r: planItem.repLow, dir: "deload", text: `Deload: ${fmtW(nw)} kg (−30 %), ${sets} ${sets === 1 ? "serie" : "serii"}, departe de eșec`, sets, lastDate: last.date };
    }
    const fullSets = last.sets.length >= sets;
    if (fullSets && minR >= planItem.repHigh && maxRpe <= 9 && w > 0) {
      nw = Math.max(w + inc, roundTo(w * 1.025, inc));
      dir = "up";
      text = `Toate seriile la ${planItem.repHigh} → ${fmtW(nw)} kg, înapoi la ${planItem.repLow}`;
    } else if (minR < planItem.repLow && w > 0) {
      nw = Math.max(0, Math.min(w - inc, roundTo(w * 0.95, inc)));
      dir = "down";
      text = `Sub ${planItem.repLow} la o serie → ${fmtW(nw)} kg (−5 %)`;
    } else {
      text = w > 0 ? `${fmtW(w)} kg × ${Math.min(minR + 1, planItem.repHigh)} (data trecută ${minR}${maxRpe ? `, RPE ${maxRpe}` : ""})` : `Data trecută: ${minR} ${unit}`;
    }
    return { w: nw, r: Math.min(minR + 1, planItem.repHigh), dir, text, sets, lastDate: last.date, lastSets: last.sets };
  }

  const accom = (w, inc) => ACCOM.map(a => ({ w: Math.max(inc || 2.5, roundTo(w * a.p, inc || 2.5)), r: a.r, p: Math.round(a.p * 100) }));
  const e1rm = (w, r) => (!w || !r ? 0 : r === 1 ? Number(w) : Number(w) * (1 + Number(r) / 30));

  function bestForEx(logs, exId) {
    let best = null;
    for (const l of logs) for (const s of doneSets(l.entries && l.entries[exId])) {
      const e = e1rm(s.w, s.r);
      if (!best || e > best.e) best = { w: Number(s.w), r: Number(s.r), e, date: l.date };
    }
    return best;
  }

  /* ===== Puls (Karvonen) ===== */
  function zones(settings) {
    const hrr = settings.hrMax - settings.hrRest;
    return {
      z2: [Math.round(settings.hrRest + 0.6 * hrr), Math.round(settings.hrRest + 0.7 * hrr)],
      int: [Math.round(0.85 * settings.hrMax), Math.round(0.92 * settings.hrMax)],
      easy: [Math.round(settings.hrRest + 0.5 * hrr), Math.round(settings.hrRest + 0.6 * hrr)]
    };
  }

  /* ===== Ciorna ședinței ===== */
  function effectivePlan(dayId, subs) {
    const day = DAYS[dayId];
    const plan = day.plan || day.core || [];
    return plan.map(p => ({ ...p, orig: p.ex, ex: subs && subs[p.ex] && EX[subs[p.ex]] ? subs[p.ex] : p.ex }));
  }
  function newDraft(dayId, today, settings, logs, subs) {
    const week = blockWeek(today, settings);
    const ph = phase(week);
    const day = DAYS[dayId];
    const d = { dayId, date: today, week, deload: ph.deload, started: Date.now(), kind: day.kind, entries: {}, warm: {}, cool: {}, kineto: {}, mob: {}, subsUsed: {}, pain: {} };
    if (day.kind === "forta" || day.kind === "intervale") {
      for (const p of effectivePlan(dayId, subs)) {
        if (p.ex !== p.orig) d.subsUsed[p.orig] = p.ex;
        const sug = suggest(p.ex, p, logs, ph);
        d.entries[p.ex] = Array.from({ length: sug.sets }, () => ({ w: sug.w === "" ? "" : sug.w, r: "", rpe: "", pain: 0, done: false }));
      }
    }
    if (day.kind === "cardio" || day.kind === "odihna") d.cardio = { kind: "", min: "", zoneMin: "", note: "" };
    if (day.kind === "intervale") d.cardio = { kind: "", rounds: 0, min: "", zoneMin: "" };
    return d;
  }
  /* la înlocuirea unui exercițiu în ciorna curentă: entries noi, cu sugestia înlocuitorului */
  function swapInDraft(draft, fromEx, toEx, logs, settings) {
    const ph = phase(draft.week);
    const day = DAYS[draft.dayId];
    const plan = (day.plan || day.core || []).find(p => p.ex === fromEx || (draft.subsUsed && draft.subsUsed[p.ex] === fromEx));
    const orig = plan ? plan.ex : fromEx;
    const sug = suggest(toEx, plan || { sets: 2, repLow: 10, repHigh: 12 }, logs, ph);
    const old = draft.entries[fromEx] || [];
    draft.entries[toEx] = Array.from({ length: Math.max(1, sug.sets - old.filter(s => s.done).length) }, () => ({ w: sug.w === "" ? "" : sug.w, r: "", rpe: "", pain: 0, done: false }));
    draft.subsUsed[orig] = toEx;
    draft.pain[fromEx] = Math.max(draft.pain[fromEx] || 0, 4);
    return draft;
  }
  const hasProgress = d => !!d && (Object.values(d.entries || {}).some(sets => sets.some(s => s.done)) || !!(d.cardio && (Number(d.cardio.min) > 0 || d.cardio.rounds > 0)));

  function summary(draft) {
    let sets = 0, tonnage = 0;
    for (const [exId, ss] of Object.entries(draft.entries || {})) {
      const ex = EX[exId] || {};
      for (const s of ss) {
        if (!s.done) continue;
        sets++;
        if ((ex.unit || "rep") === "rep" && Number(s.w) > 0 && Number(s.r) > 0) tonnage += Number(s.w) * Number(s.r);
      }
    }
    const durationSec = draft.started ? Math.max(0, Math.round((Date.now() - draft.started) / 1000)) : 0;
    return { sets, tonnage: Math.round(tonnage), durationSec };
  }
  function finish(draft, logs) {
    const sum = summary(draft);
    const prs = [];
    for (const [exId, ss] of Object.entries(draft.entries || {})) {
      const prev = bestForEx(logs, exId);
      for (const s of ss) {
        if (!s.done || !Number(s.w) || !Number(s.r)) continue;
        if (!prev || e1rm(s.w, s.r) > prev.e + 0.01) { prs.push(exId); break; }
      }
    }
    const entry = {
      id: Date.now(), date: draft.date, dayId: draft.dayId, kind: draft.kind, week: draft.week, deload: !!draft.deload,
      entries: draft.entries || {}, subsUsed: draft.subsUsed || {}, pain: draft.pain || {}, cardio: draft.cardio || null,
      warmDone: Object.values(draft.warm || {}).filter(Boolean).length, coolDone: Object.values(draft.cool || {}).filter(Boolean).length,
      ...sum
    };
    logs.push(entry);
    return { entry, prs };
  }

  /* ===== Statistici ===== */
  function seriesForEx(logs, exId) {
    const out = [];
    for (const l of logs) {
      const sets = doneSets(l.entries && l.entries[exId]).filter(s => Number(s.w) > 0);
      if (!sets.length) continue;
      const best = sets.reduce((a, b) => (e1rm(b.w, b.r) > e1rm(a.w, a.r) ? b : a));
      out.push({ date: l.date, w: Number(best.w), r: Number(best.r), e: Math.round(e1rm(best.w, best.r) * 2) / 2, maxW: Math.max(...sets.map(s => Number(s.w))) });
    }
    return out;
  }
  function weeklySets(logs, weekMonday) {
    const end = addDays(weekMonday, 7);
    const out = {};
    for (const g of Object.keys(GRUPE)) out[g] = 0;
    for (const l of logs) {
      if (l.date < weekMonday || l.date >= end) continue;
      for (const [exId, ss] of Object.entries(l.entries || {})) {
        const ex = EX[exId]; if (!ex) continue;
        const n = doneSets(ss).length;
        ex.grp.forEach((g, i) => { out[g] = (out[g] || 0) + n * (i === 0 ? 1 : 0.5); });
      }
    }
    return out;
  }
  function weeklyCardio(logs, weekMonday) {
    const end = addDays(weekMonday, 7);
    let zone = 0, total = 0;
    for (const l of logs) {
      if (l.date < weekMonday || l.date >= end || !l.cardio) continue;
      zone += Number(l.cardio.zoneMin) || 0;
      total += Number(l.cardio.min) || 0;
    }
    return { zone, total };
  }
  function adherence(logs, weeks, today) {
    const out = [];
    const thisMonday = mondayOf(today);
    for (let i = weeks - 1; i >= 0; i--) {
      const m = addDays(thisMonday, -7 * i);
      const end = addDays(m, 7);
      const done = logs.filter(l => l.date >= m && l.date < end && l.kind && l.kind !== "odihna").length;
      out.push({ monday: m, done, planned: 6 });
    }
    return out;
  }

  /* ===== Corp ===== */
  function logDaily(date, patch) {
    const b = store.body();
    b.daily[date] = Object.assign({}, b.daily[date] || {}, patch);
    store.saveBody(b);
    return b;
  }
  function logTalie(date, cm) {
    const b = store.body();
    b.talie = b.talie.filter(t => t.date !== date);
    b.talie.push({ date, cm: Number(cm) });
    b.talie.sort((a, c) => (a.date < c.date ? -1 : 1));
    store.saveBody(b);
    return b;
  }
  function talieDue(body, settings, today) {
    const last = body.talie.length ? body.talie[body.talie.length - 1].date : null;
    if (!last) return { due: true, days: null, last: null };
    const d = diffDays(last, today);
    return { due: d >= (settings.taliaDays || 14), days: d, last };
  }
  const weightSeries = body => Object.entries(body.daily).filter(([, v]) => Number(v.kg) > 0).map(([date, v]) => ({ date, v: Number(v.kg) })).sort((a, b) => (a.date < b.date ? -1 : 1));

  /* ===== Export / import ===== */
  function exportAll() {
    return { app: "jacked2", version: 1, exportedAt: new Date().toISOString(), logs: store.logs(), settings: store.settings(), subs: store.subs(), body: store.body(), sched: store.sched(), draft: store.draft() };
  }
  function importAll(obj) {
    if (!obj || obj.app !== "jacked2" || !Array.isArray(obj.logs)) throw new Error("Fișier invalid");
    store.saveLogs(obj.logs);
    if (obj.settings) store.saveSettings(Object.assign({}, DEFAULT_SETTINGS, obj.settings));
    if (obj.subs) store.saveSubs(obj.subs);
    if (obj.body) store.saveBody(obj.body);
    if (obj.sched) store.saveSched(obj.sched);
    if (obj.draft) store.saveDraft(obj.draft); else store.clearDraft();
    return obj.logs.length;
  }

  /* ===== Import din v1 (cheia jacked.logs.v1) =====
     Exercițiile comune primesc istoricul ca punct de plecare pentru greutăți. */
  const V1_MAP = {
    "incline-db-press": "inc-db-press", "tbar-row": "cs-row-neutral", "cable-lateral-raise": "cable-lat-raise-1",
    "triceps-pushdown": "triceps-rope-pushdown", "leg-press": "leg-press-high", "db-rdl": "db-rdl",
    "leg-curl": "leg-curl-seated", "leg-extension": "leg-ext-partial", "seated-calf": "calf-seated",
    "lat-pulldown": "pulldown-wide", "seated-cable-row": "cable-row-1arm", "rear-delt-fly": "rear-delt-fly",
    "hammer-curl": "hammer-curl", "squat": "hack-squat", "machine-shoulder-press": "machine-shoulder-press-neutral"
  };
  function importV1(v1logs, logs) {
    if (!Array.isArray(v1logs)) throw new Error("Istoric v1 invalid");
    const existing = new Set(logs.filter(l => l.source === "v1").map(l => l.v1id));
    let added = 0, mapped = 0;
    for (const l of v1logs) {
      if (!l || !l.entries || existing.has(l.id)) continue;
      const entries = {};
      for (const [exId, sets] of Object.entries(l.entries)) {
        const to = V1_MAP[exId]; if (!to) continue;
        const ds = (sets || []).filter(s => s.done && Number(s.r) > 0).map(s => ({ w: Number(s.w) || "", r: Number(s.r), rpe: "", pain: 0, done: true }));
        if (ds.length) { entries[to] = ds; mapped++; }
      }
      if (!Object.keys(entries).length) continue;
      logs.push({ id: Date.now() + added, v1id: l.id, source: "v1", date: l.date, dayId: "v1", kind: "forta", week: 0, deload: false, entries, subsUsed: {}, pain: {}, cardio: null, sets: Object.values(entries).reduce((a, s) => a + s.length, 0), tonnage: 0, durationSec: 0 });
      added++;
    }
    logs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.id - b.id)));
    return { added, mapped };
  }

  return {
    K, DEFAULT_SETTINGS, setStorage, store,
    iso, dateOf, addDays, todayISO, weekday, mondayOf, diffDays,
    ensureBlockStart, blockWeek, blockNumber, phase, planDay, nextDayId, advanceCursor, setCursor,
    targetSets, restFor, lastPerf, suggest, accom, e1rm, bestForEx, roundTo, fmtW,
    zones, effectivePlan, newDraft, swapInDraft, hasProgress, summary, finish,
    seriesForEx, weeklySets, weeklyCardio, adherence,
    logDaily, logTalie, talieDue, weightSeries,
    exportAll, importAll, importV1, V1_MAP
  };
})();

if (typeof module !== "undefined") module.exports = J2;
