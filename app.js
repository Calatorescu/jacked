/* Jacked — jurnal de antrenament bazat pe programul Average to Jacked */
"use strict";

/* ===== Storage ===== */
const LS_LOGS = "jacked.logs.v1";
const LS_DRAFT = "jacked.draft.v1";
const LS_MODE = "jacked.mode.v1";

const store = {
  logs() { try { return JSON.parse(localStorage.getItem(LS_LOGS)) || []; } catch { return []; } },
  saveLogs(l) { localStorage.setItem(LS_LOGS, JSON.stringify(l)); },
  draft() { try { return JSON.parse(localStorage.getItem(LS_DRAFT)); } catch { return null; } },
  saveDraft(d) { localStorage.setItem(LS_DRAFT, JSON.stringify(d)); },
  clearDraft() { localStorage.removeItem(LS_DRAFT); }
};

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const fmtW = w => (w % 1 === 0 ? String(w) : String(w).replace(".", ","));
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = iso => {
  const d = new Date(iso + "T12:00");
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
};

/* ===== Helpers program ===== */
const allExercises = [];
for (const dayId of PROGRAM.cycle)
  for (const ex of PROGRAM.days[dayId].exercises)
    allExercises.push({ ...ex, dayId });

const exById = id => allExercises.find(e => e.id === id);

/* ===== Mod de antrenament (beginner / 1x4) ===== */
function getMode() {
  const m = localStorage.getItem(LS_MODE);
  return MODES[m] ? m : "1x4";
}
function setMode(m) { localStorage.setItem(LS_MODE, m); }

/* exercițiile zilei, filtrate după modul activ */
function modeExercises(day) {
  const m = getMode();
  return day.exercises.filter(ex => !ex.mode || ex.mode === m);
}

/* ținta de seturi/repetări/pauză a unui exercițiu în modul activ */
function targetFor(ex) {
  if (getMode() === "1x4") {
    return {
      sets: 1,
      repLow: ex.optional ? ex.repLow : MODES["1x4"].repLow,
      repHigh: ex.optional ? ex.repHigh : MODES["1x4"].repHigh,
      rest: ex.optional ? 90 : 120
    };
  }
  return { sets: ex.sets, repLow: ex.repLow, repHigh: ex.repHigh, rest: ex.rest };
}

/* Ziua sugerată: următoarea din ciclu după ultimul antrenament salvat */
function suggestedDay() {
  const logs = store.logs();
  if (!logs.length) return PROGRAM.cycle[0];
  const last = logs[logs.length - 1].dayId;
  const i = PROGRAM.cycle.indexOf(last);
  return PROGRAM.cycle[(i + 1) % PROGRAM.cycle.length];
}

/* Ultimele seturi înregistrate pentru un exercițiu */
function lastPerformance(exId) {
  const logs = store.logs();
  for (let i = logs.length - 1; i >= 0; i--) {
    const sets = (logs[i].entries[exId] || []).filter(s => s.done && s.r > 0);
    if (sets.length) return { date: logs[i].date, sets };
  }
  return null;
}

/* Sugestia de progresie — regula canalului (dublă progresie):
   beginner: 8→12 pe toate seturile, apoi +greutate
   1x4: bate repetările de data trecută cu una; la 10 → +greutate, înapoi la 6 */
function suggestion(ex) {
  const t = targetFor(ex);
  const last = lastPerformance(ex.id);
  if (!last) {
    const hint = getMode() === "1x4"
      ? `Alege o greutate la care ajungi la failure pe la ${t.repLow}–${t.repHigh} repetări`
      : `Alege o greutate cu care faci ${t.repLow} repetări curate (ai mai putea ~2)`;
    return { text: hint, w: "", r: t.repLow };
  }
  const w = Math.max(...last.sets.map(s => s.w));
  const minR = Math.min(...last.sets.map(s => s.r));
  if (last.sets.length >= t.sets && minR >= t.repHigh)
    return { text: `Ai atins ${t.repHigh} → crește greutatea, înapoi la ${t.repLow} rep.`, w: w + 2.5, r: t.repLow, up: true };
  return { text: `Ținta azi: ${fmtW(w)} kg × ${Math.min(minR + 1, t.repHigh)} rep. (data trecută ${minR})`, w, r: Math.min(minR + 1, t.repHigh) };
}

/* Record personal: cea mai mare greutate cu minim repLow repetări */
function bestForEx(exId, logs) {
  let best = null;
  for (const l of logs) {
    for (const s of (l.entries[exId] || [])) {
      if (!s.done || !s.w || !s.r) continue;
      if (!best || s.w > best.w || (s.w === best.w && s.r > best.r)) best = { w: s.w, r: s.r, date: l.date };
    }
  }
  return best;
}

/* ===== Draft (antrenamentul de azi) ===== */
let draft = store.draft();

function newDraft(dayId) {
  const entries = {};
  for (const ex of modeExercises(PROGRAM.days[dayId])) {
    const sug = suggestion(ex);
    entries[ex.id] = Array.from({ length: targetFor(ex).sets }, () => ({ w: sug.w || "", r: "", done: false }));
  }
  return { dayId, date: todayISO(), entries };
}

/* ===== Views ===== */
const views = { azi: renderAzi, program: renderProgram, progres: renderProgres, unelte: renderUnelte };
let activeTab = "azi";

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".view").forEach(v => v.hidden = v.dataset.view !== tab);
  document.querySelectorAll(".tab").forEach(b => {
    const on = b.dataset.tab === tab;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on);
  });
  views[tab]();
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

/* ===== AZI ===== */
function renderAzi() {
  const v = $("#view-azi");
  v.innerHTML = "";
  const sug = suggestedDay();
  const selected = draft ? draft.dayId : null;

  // selector de zi
  const picker = el("div", "day-picker");
  for (const dayId of PROGRAM.cycle) {
    const d = PROGRAM.days[dayId];
    const b = el("button", "day-btn" + (selected === dayId ? " selected" : ""));
    b.style.setProperty("--c", d.color);
    b.innerHTML = `${dayId === sug && !selected ? '<span class="next-chip">urmează</span>' : ""}
      <span class="dot"></span><span class="d-name">${d.name}</span><span class="d-sub">${d.subtitle}</span>`;
    b.addEventListener("click", () => {
      if (draft && draft.dayId !== dayId && hasProgress(draft)) {
        if (!confirm("Ai un antrenament început. Îl abandonezi?")) return;
      }
      draft = newDraft(dayId);
      store.saveDraft(draft);
      renderAzi();
    });
    picker.appendChild(b);
  }
  v.appendChild(picker);

  if (!draft) {
    const d = PROGRAM.days[sug];
    v.appendChild(el("div", "empty", `Alege ziua de sus ca să începi.<br>Urmează <b>${d.name}</b> — ${d.subtitle}.`));
    renderStreak();
    return;
  }

  const day = PROGRAM.days[draft.dayId];
  document.documentElement.style.setProperty("--daycolor", day.color);

  // eticheta modului activ
  v.appendChild(el("p", "small muted", `Mod: <b>${MODES[getMode()].label}</b> — se schimbă din tabul Program.`));

  // carduri exerciții
  modeExercises(day).forEach((ex, i) => v.appendChild(exerciseCard(ex, i, day)));

  // final antrenament
  const fin = el("div", "finish-box");
  const btn = el("button", "btn", "Termină antrenamentul ✓");
  btn.addEventListener("click", finishWorkout);
  fin.appendChild(btn);
  v.appendChild(fin);
  renderStreak();
}

function hasProgress(d) {
  return Object.values(d.entries).some(sets => sets.some(s => s.done));
}

function exerciseCard(ex, idx, day) {
  const card = el("div", "card ex-card");
  card.style.setProperty("--daycolor", day.color);
  if (!draft.entries[ex.id]) {
    const sug0 = suggestion(ex);
    draft.entries[ex.id] = Array.from({ length: targetFor(ex).sets }, () => ({ w: sug0.w || "", r: "", done: false }));
    store.saveDraft(draft);
  }
  const t = targetFor(ex);
  const sug = suggestion(ex);
  const last = lastPerformance(ex.id);
  const is1x4 = getMode() === "1x4";
  const targetLine = is1x4
    ? `<b>1 set la failure</b> × ${t.repLow}–${t.repHigh} rep · încălzire: ${idx === 0 ? "3 seturi progresive (40/60/80%)" : "1 set la ~50%"} · apoi pauză 2 min`
    : `<b>${t.sets} seturi</b> × ${t.repLow}–${t.repHigh} rep · pauză ${t.rest >= 120 ? (t.rest / 60) + " min" : t.rest + "s"}`;

  const head = el("div", "ex-head");
  head.innerHTML = `
    <span class="ex-num">${idx + 1}</span>
    <div class="ex-title">
      <h3>${ex.name}${ex.optional ? ' <span class="muted small">(opțional)</span>' : ""}</h3>
      <p class="ro">${ex.ro}</p>
      <p class="ex-target">${targetLine}</p>
    </div>`;
  const vbtn = el("button", "btn-video", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Execuție`);
  vbtn.addEventListener("click", () => openVideo(ex));
  head.appendChild(vbtn);
  card.appendChild(head);

  card.appendChild(el("p", "ex-cues", ex.cues));
  if (last) card.appendChild(el("p", "ex-last", `Ultima dată (${fmtDate(last.date)}): ${last.sets.map(s => `${fmtW(s.w)}kg×${s.r}`).join(" · ")}`));
  card.appendChild(el("span", "ex-suggest", (sug.up ? "▲ " : "") + sug.text));

  const sets = el("div", "sets");
  draft.entries[ex.id].forEach((s, si) => sets.appendChild(setRow(ex, si)));
  card.appendChild(sets);

  const foot = el("div", "ex-foot");
  const add = el("button", "btn-addset", "+ adaugă un set");
  add.addEventListener("click", () => {
    const prev = draft.entries[ex.id][draft.entries[ex.id].length - 1];
    draft.entries[ex.id].push({ w: prev ? prev.w : "", r: "", done: false });
    store.saveDraft(draft);
    sets.appendChild(setRow(ex, draft.entries[ex.id].length - 1));
  });
  foot.appendChild(add);
  card.appendChild(foot);
  return card;
}

function setRow(ex, si) {
  const s = draft.entries[ex.id][si];
  const row = el("div", "set-row" + (s.done ? " done" : ""));
  row.innerHTML = `
    <span class="s-idx">${si + 1}</span>
    <div class="num-field"><input type="text" inputmode="decimal" placeholder="—" value="${s.w !== "" ? fmtW(s.w) : ""}" aria-label="Greutate set ${si + 1}"><span class="unit">kg</span></div>
    <div class="num-field"><input type="text" inputmode="numeric" placeholder="—" value="${s.r || ""}" aria-label="Repetări set ${si + 1}"><span class="unit">rep</span></div>`;
  const [wIn, rIn] = row.querySelectorAll("input");
  wIn.addEventListener("input", () => { s.w = parseFloat(wIn.value.replace(",", ".")) || ""; store.saveDraft(draft); });
  rIn.addEventListener("input", () => { s.r = parseInt(rIn.value) || ""; store.saveDraft(draft); });

  const btn = el("button", "btn-set");
  btn.setAttribute("aria-label", "Bifează setul " + (si + 1));
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`;
  btn.addEventListener("click", () => {
    if (!s.done) {
      if (!s.r) { rIn.focus(); toast("Scrie câte repetări ai făcut"); return; }
      s.done = true;
      row.classList.add("done");
      store.saveDraft(draft);
      startRest(ex, si);
    } else {
      s.done = false;
      row.classList.remove("done");
      store.saveDraft(draft);
    }
  });
  row.appendChild(btn);
  return row;
}

function finishWorkout() {
  if (!draft || !hasProgress(draft)) { toast("Bifează măcar un set înainte"); return; }
  const logs = store.logs();

  // detectează PR-uri înainte de salvare
  const prs = [];
  for (const [exId, sets] of Object.entries(draft.entries)) {
    const prev = bestForEx(exId, logs);
    for (const s of sets) {
      if (!s.done || !s.w || !s.r) continue;
      if (!prev || s.w > prev.w || (s.w === prev.w && s.r > prev.r)) {
        prs.push(exById(exId).name);
        break;
      }
    }
  }

  logs.push({ id: Date.now(), date: draft.date, dayId: draft.dayId, entries: draft.entries });
  store.saveLogs(logs);
  draft = null;
  store.clearDraft();
  stopRest();
  if (prs.length) toast(`🏆 PR nou: ${prs.join(", ")}!`, true, 4200);
  else toast("Antrenament salvat. Bravo! 💪");
  renderAzi();
}

function renderStreak() {
  const logs = store.logs();
  const chip = $("#streak");
  if (!logs.length) { chip.hidden = true; return; }
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const week = logs.filter(l => new Date(l.date + "T12:00") >= monday).length;
  chip.textContent = `${week}/3 săptămâna asta`;
  chip.hidden = false;
}

/* ===== PROGRAM ===== */
function renderProgram() {
  const v = $("#view-program");
  v.innerHTML = "";
  const mode = getMode();

  // comutator mod de antrenament
  const modeCard = el("div", "card");
  modeCard.appendChild(el("p", "small muted", "Modul de antrenament"));
  const seg = el("div", "day-picker");
  seg.style.marginTop = "8px";
  for (const [mId, m] of Object.entries(MODES)) {
    const b = el("button", "btn ghost", m.label);
    b.style.width = "100%";
    if (mId === mode) { b.style.borderColor = "var(--ink)"; b.style.fontWeight = "700"; }
    b.addEventListener("click", () => {
      if (mId === mode) return;
      if (draft && hasProgress(draft) && !confirm("Ai un antrenament început. Îl abandonezi ca să schimbi modul?")) return;
      setMode(mId);
      draft = null;
      store.clearDraft();
      renderProgram();
      toast(`Mod activ: ${MODES[mId].label}`);
    });
    seg.appendChild(b);
  }
  seg.style.gridTemplateColumns = "1fr 1fr";
  modeCard.appendChild(seg);
  modeCard.appendChild(el("p", "small muted", mode === "1x4"
    ? "1×4 = metoda actuală a canalului: 4 exerciții, câte 1 set de încălzire + 1 set de lucru dus la failure, 6–10 rep. Notă: autorul o recomandă după ce stăpânești mișcările și știi ce înseamnă failure."
    : "3 seturi × 8–12 pe exercițiu — programul de bază al canalului, recomandat pentru primul an."));
  modeCard.lastChild.style.marginTop = "10px";
  v.appendChild(modeCard);

  for (const dayId of PROGRAM.cycle) {
    const d = PROGRAM.days[dayId];
    const card = el("div", "card");
    const head = el("div", "pday-head");
    head.style.setProperty("--c", d.color);
    head.innerHTML = `<span class="dot"></span><h3>${d.name}</h3><span class="muted small">${d.subtitle}</span>`;
    card.appendChild(head);
    for (const ex of modeExercises(d)) {
      const t = targetFor(ex);
      const r = el("div", "p-ex");
      r.innerHTML = `<div class="n"><b>${ex.name}${ex.optional ? " (opțional)" : ""}</b><span>${ex.ro}${ex.alts.length ? " · alternative: " + ex.alts.join(", ") : ""}</span></div>
        <span class="t">${t.sets}×${t.repLow}–${t.repHigh}</span>`;
      const play = el("button", "play", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`);
      play.setAttribute("aria-label", "Vezi execuția " + ex.name);
      play.addEventListener("click", () => openVideo({ ...ex, dayColor: d.color }));
      r.appendChild(play);
      card.appendChild(r);
    }
    v.appendChild(card);
  }

  const mkSection = (title, items) => {
    v.appendChild(el("h2", "section-title", title));
    const c = el("div", "card");
    for (const it of items) c.appendChild(el("div", "rule-item", `<b>${it.title}</b><p>${it.body}</p>`));
    v.appendChild(c);
  };

  if (mode === "1x4") {
    mkSection("Cum progresezi (metoda 1×4)", [
      { title: "1 set de încălzire + 1 set de lucru", body: "Încălzire la ~50% din greutatea de lucru, 5–8 repetări lente. La primul exercițiu al zilei: 3 seturi progresive (~40% × 8, ~60% × 5, ~80% × 3), pauză 1–2 min, apoi setul de lucru." },
      { title: "Setul de lucru = până la failure", body: "Alege o greutate la care ajungi la failure între 6 și 10 repetări. Failure = repetarea nu mai urcă întreagă, cu formă corectă. Ultima repetare, cea grea, e cea care contează — nu te opri la primul disconfort." },
      { title: "Bate-ți recordul cu O repetare", body: "Ai făcut 7 data trecută? Azi ținta e 8. Ai atins-o? Gata, ai progresat — nu forța a 9-a. Așa antrenamentul se autoreglează." },
      { title: "La 10 repetări → crește greutatea", body: "Adaugă cea mai mică treaptă (2,5 kg) și coboară înapoi la 6, chiar dacă simți că poți mai mult. Tot progresie e." },
      { title: "Pauze", body: "~2 minute între exerciții. Formă strictă mereu: repetări lente, controlate, pauză jos, fără avânt." }
    ]);
    const d4 = el("div", "card");
    d4.appendChild(el("div", "rule-item", `<b>${DAY4_1X4.title}</b><p>${DAY4_1X4.body}</p>`));
    v.appendChild(d4);
  } else {
    mkSection("Cum progresezi (regula de aur)", [
      { title: "Începe cu 3 seturi × 8 repetări", body: "Greutate la care faci 8 curat — dacă ar trebui, ai mai putea ~2. Nu porni prea greu: începe la ~80% din ce poți." },
      { title: "Adaugă repetări săptămână de săptămână", body: "Când faci 8 curat pe toate seturile, urcă spre 9, 10, 11… până ajungi la 12 pe toate." },
      { title: "12 peste tot → crește greutatea", body: "Adaugă cea mai mică treaptă (2,5 kg sau o placă) și coboară înapoi la 8. Repetă la nesfârșit. Asta e toată știința." },
      { title: "Pauze", body: "2–3 minute la exercițiile compuse (presses, genuflexiuni, ramat), ~1–1,5 min la izolări. Nu te grăbi între seturi." }
    ]);
  }
  mkSection("Încălzirea (înainte de fiecare antrenament)", WARMUP);
  mkSection("Principiile canalului", PRINCIPLES);
  mkSection("Nutriție pentru masă musculară", NUTRITION);

  const src = el("div", "card");
  src.innerHTML = `<p class="small muted">Program sintetizat din cele 131 de videoclipuri ale canalului
    <a href="${CHANNEL.url}" target="_blank" rel="noopener"><b>${CHANNEL.name}</b></a>.
    Istoricul și progresul se păstrează la schimbarea modului — exercițiile comune își continuă graficele.</p>`;
  v.appendChild(src);
}

/* ===== PROGRES ===== */
let progresEx = null;

function renderProgres() {
  const v = $("#view-progres");
  v.innerHTML = "";
  const logs = store.logs();

  // statistici generale
  const stats = el("div", "stat-row");
  const now = new Date();
  const m0 = new Date(now.getFullYear(), now.getMonth(), 1);
  const luna = logs.filter(l => new Date(l.date + "T12:00") >= m0).length;
  let prCount = 0;
  const seen = {};
  for (const l of logs)
    for (const [exId, sets] of Object.entries(l.entries))
      for (const s of sets) {
        if (!s.done || !s.w) continue;
        if (!seen[exId] || s.w > seen[exId]) { if (seen[exId]) prCount++; seen[exId] = s.w; }
      }
  stats.innerHTML = `
    <div class="card stat-tile"><div class="v">${logs.length}</div><div class="l">antrenamente</div></div>
    <div class="card stat-tile"><div class="v">${luna}</div><div class="l">luna asta</div></div>
    <div class="card stat-tile"><div class="v">${prCount}</div><div class="l">creșteri de greutate</div></div>`;
  v.appendChild(stats);

  if (!logs.length) {
    v.appendChild(el("div", "empty", "Încă nu ai antrenamente salvate.<br>Termină primul antrenament și progresul apare aici."));
    return;
  }

  // selector exercițiu
  const sel = el("select", "ex-select");
  const trained = allExercises.filter(ex => logs.some(l => (l.entries[ex.id] || []).some(s => s.done)));
  if (!progresEx || !trained.some(e => e.id === progresEx)) progresEx = trained[0] && trained[0].id;
  for (const ex of trained) {
    const o = el("option", "", `${PROGRAM.days[ex.dayId].name} — ${ex.name}`);
    o.value = ex.id;
    if (ex.id === progresEx) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener("change", () => { progresEx = sel.value; renderProgres(); });
  v.appendChild(sel);

  if (!progresEx) return;
  const ex = exById(progresEx);
  const color = PROGRAM.days[ex.dayId].color;

  // seria: greutatea maximă bifată per antrenament
  const series = [];
  for (const l of logs) {
    const sets = (l.entries[ex.id] || []).filter(s => s.done && s.w);
    if (!sets.length) continue;
    const best = sets.reduce((a, b) => (b.w > a.w || (b.w === a.w && b.r > a.r) ? b : a));
    series.push({ date: l.date, w: best.w, r: best.r });
  }

  const chartCard = el("div", "card");
  chartCard.appendChild(el("p", "small muted", `Greutatea maximă pe set · ${ex.name}`));
  chartCard.appendChild(lineChart(series, color));
  v.appendChild(chartCard);

  // istoric (vedere tabelară)
  v.appendChild(el("h2", "section-title", "Istoric"));
  const hist = el("div", "card");
  let best = 0;
  const rows = [];
  for (const l of logs) {
    const sets = (l.entries[ex.id] || []).filter(s => s.done && s.r);
    if (!sets.length) continue;
    const maxW = Math.max(...sets.map(s => s.w || 0));
    const isPr = maxW > best;
    best = Math.max(best, maxW);
    rows.push(`<div class="hist-row"><span class="d">${fmtDate(l.date)}</span>
      <span class="s">${sets.map(s => `${fmtW(s.w || 0)}kg×${s.r}`).join(" · ")}</span>
      ${isPr && rows.length ? '<span class="pr-flag">PR</span>' : ""}</div>`);
  }
  hist.innerHTML = rows.reverse().join("") || '<p class="muted">Nimic încă.</p>';
  v.appendChild(hist);
}

/* Grafic linie SVG simplu, cu tooltip la atingere */
function lineChart(series, color) {
  const wrap = el("div", "chart-wrap");
  if (series.length < 2) {
    wrap.appendChild(el("p", "empty", "După minim 2 antrenamente cu acest exercițiu apare graficul."));
    return wrap;
  }
  const W = 600, H = 260, P = { t: 18, r: 46, b: 26, l: 10 };
  const ws = series.map(p => p.w);
  let lo = Math.min(...ws), hi = Math.max(...ws);
  if (lo === hi) { lo -= 2.5; hi += 2.5; }
  const pad = (hi - lo) * 0.15;
  lo = Math.max(0, lo - pad); hi += pad;
  const x = i => P.l + (i / (series.length - 1)) * (W - P.l - P.r);
  const y = w => P.t + (1 - (w - lo) / (hi - lo)) * (H - P.t - P.b);

  const gridN = 3;
  let grid = "", glabels = "";
  for (let g = 0; g <= gridN; g++) {
    const val = lo + (g / gridN) * (hi - lo);
    const gy = y(val);
    grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${gy}" y2="${gy}" stroke="#E6E4DE" stroke-width="1"/>`;
    glabels += `<text x="${W - P.r + 6}" y="${gy + 4}" font-size="11" fill="#8A9098">${Math.round(val * 2) / 2}</text>`;
  }
  const path = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.w).toFixed(1)}`).join("");
  const dots = series.map((p, i) =>
    `<circle cx="${x(i).toFixed(1)}" cy="${y(p.w).toFixed(1)}" r="4.5" fill="${color}" stroke="#fff" stroke-width="2" data-i="${i}"/>`).join("");
  const lastP = series[series.length - 1];
  const lastLabel = `<text x="${x(series.length - 1).toFixed(1)}" y="${(y(lastP.w) - 10).toFixed(1)}" font-size="13" font-weight="700" fill="#17191C" text-anchor="middle">${fmtW(lastP.w)} kg</text>`;
  const xl = `<text x="${P.l}" y="${H - 6}" font-size="11" fill="#8A9098">${fmtDate(series[0].date)}</text>
    <text x="${W - P.r}" y="${H - 6}" font-size="11" fill="#8A9098" text-anchor="end">${fmtDate(lastP.date)}</text>`;

  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evoluția greutății">
    ${grid}${glabels}
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${lastLabel}${xl}</svg>`;
  const tip = el("div", "chart-tip");
  wrap.appendChild(tip);

  wrap.addEventListener("pointerdown", e => {
    const svg = wrap.querySelector("svg");
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width * W;
    let bi = 0, bd = 1e9;
    series.forEach((p, i) => { const d = Math.abs(x(i) - px); if (d < bd) { bd = d; bi = i; } });
    const p = series[bi];
    tip.textContent = `${fmtDate(p.date)}: ${fmtW(p.w)} kg × ${p.r}`;
    tip.style.left = (x(bi) / W * 100) + "%";
    tip.style.top = (y(p.w) / H * 100) + "%";
    tip.style.opacity = 1;
    clearTimeout(tip._t);
    tip._t = setTimeout(() => tip.style.opacity = 0, 2200);
  });
  return wrap;
}

/* ===== UNELTE ===== */
function renderUnelte() {
  const v = $("#view-unelte");
  v.innerHTML = "";

  // timer manual
  v.appendChild(el("h2", "section-title", "Timer pauză"));
  const tc = el("div", "card");
  const tg = el("div", "day-picker");
  [60, 90, 120, 180].forEach(sec => {
    const b = el("button", "btn ghost", sec >= 120 ? `${sec / 60} min` : `${sec}s`);
    b.style.width = "100%";
    b.addEventListener("click", () => startRest(null, null, sec));
    tg.appendChild(b);
  });
  tg.style.gridTemplateColumns = "repeat(4,1fr)";
  tc.appendChild(tg);
  v.appendChild(tc);

  // calculator 1RM
  v.appendChild(el("h2", "section-title", "Calculator 1RM"));
  const rm = el("div", "card");
  rm.innerHTML = `
    <div class="tool-grid">
      <div><label for="rm-w">Greutate (kg)</label><input id="rm-w" type="text" inputmode="decimal" placeholder="60"></div>
      <div><label for="rm-r">Repetări</label><input id="rm-r" type="text" inputmode="numeric" placeholder="8"></div>
    </div>
    <div class="rm-result" hidden><p class="small muted">Maxim estimat (1RM)</p><p class="v">—</p></div>
    <table class="rm-table" hidden></table>
    <p class="small muted" style="margin-top:10px">Formula Epley: greutate × (1 + rep/30). Orientativ — programul nu cere să testezi maximul.</p>`;
  const wIn = rm.querySelector("#rm-w"), rIn = rm.querySelector("#rm-r");
  const res = rm.querySelector(".rm-result"), tbl = rm.querySelector(".rm-table");
  const calc = () => {
    const w = parseFloat(wIn.value.replace(",", ".")), r = parseInt(rIn.value);
    if (!w || !r || r < 1 || r > 30) { res.hidden = true; tbl.hidden = true; return; }
    const rm1 = w * (1 + r / 30);
    res.hidden = false;
    res.querySelector(".v").textContent = fmtW(Math.round(rm1 * 2) / 2) + " kg";
    tbl.hidden = false;
    tbl.innerHTML = [95, 90, 85, 80, 75, 70, 65, 60].map(p => {
      const reps = { 95: "~2", 90: "~4", 85: "~6", 80: "~8", 75: "~10", 70: "~12", 65: "~15", 60: "~18" }[p];
      return `<tr><td>${p}% (${reps} rep)</td><td>${fmtW(Math.round(rm1 * p / 100 * 2) / 2)} kg</td></tr>`;
    }).join("");
  };
  wIn.addEventListener("input", calc);
  rIn.addEventListener("input", calc);
  v.appendChild(rm);

  // clipuri demo locale
  v.appendChild(el("h2", "section-title", "Clipuri demo offline"));
  const vc = el("div", "card");
  const status = el("p", "small muted", "…");
  vc.appendChild(status);
  const refreshStatus = () => demoIds().then(ids => {
    status.innerHTML = `<b>${ids.length}/${allExercises.length}</b> clipuri salvate pe telefon. ${ids.length ? "Demonstrațiile merg instant, și offline." : "Încarcă fișierele .mp4 primite (numele fișierului = exercițiul)."}`;
  });
  refreshStatus();
  const vrow = el("div", "rest-actions");
  vrow.style.marginTop = "10px";
  const impV = el("label", "btn ghost", "Încarcă clipuri");
  const impVIn = el("input");
  impVIn.type = "file"; impVIn.accept = "video/mp4"; impVIn.multiple = true; impVIn.hidden = true;
  impVIn.addEventListener("change", async () => {
    if (!impVIn.files.length) return;
    toast("Salvez clipurile…");
    const { ok, skip } = await importDemos(impVIn.files);
    toast(ok ? `${ok} clipuri salvate ✓` : "Niciun clip recunoscut");
    if (skip.length) console.warn("Nume nerecunoscute:", skip);
    refreshStatus();
    impVIn.value = "";
  });
  impV.appendChild(impVIn);
  const delV = el("button", "btn ghost", "Șterge clipurile");
  delV.addEventListener("click", async () => {
    if (!confirm("Ștergi clipurile demo salvate local?")) return;
    await caches.delete(DEMO_CACHE);
    toast("Clipuri șterse");
    refreshStatus();
  });
  vrow.append(impV, delV);
  vc.appendChild(vrow);
  v.appendChild(vc);

  // date
  v.appendChild(el("h2", "section-title", "Datele tale"));
  const dc = el("div", "card");
  const logs = store.logs();
  dc.appendChild(el("p", "small muted", `${logs.length} antrenamente salvate local, pe acest telefon.`));
  const row = el("div", "rest-actions");
  row.style.marginTop = "10px";
  const exp = el("button", "btn ghost", "Exportă (backup)");
  exp.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ logs: store.logs() }, null, 1)], { type: "application/json" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = `jacked-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  const impLabel = el("label", "btn ghost", "Importă");
  const impIn = el("input");
  impIn.type = "file"; impIn.accept = ".json"; impIn.hidden = true;
  impIn.addEventListener("change", () => {
    const f = impIn.files[0];
    if (!f) return;
    f.text().then(t => {
      try {
        const d = JSON.parse(t);
        if (!Array.isArray(d.logs)) throw 0;
        store.saveLogs(d.logs);
        toast(`Import reușit: ${d.logs.length} antrenamente`);
        renderUnelte();
      } catch { toast("Fișier invalid"); }
    });
  });
  impLabel.appendChild(impIn);
  const del = el("button", "btn ghost", "Șterge tot");
  del.style.color = "var(--push)";
  del.addEventListener("click", () => {
    if (confirm("Sigur ștergi TOATE antrenamentele? Fă un export înainte.") && confirm("Ultima confirmare — se șterg definitiv.")) {
      store.saveLogs([]); store.clearDraft(); draft = null;
      toast("Date șterse");
      renderUnelte();
    }
  });
  row.append(exp, impLabel, del);
  dc.appendChild(row);
  v.appendChild(dc);

  const about = el("div", "card");
  about.innerHTML = `<p class="small muted">Aplicație personală bazată pe metodologia canalului
    <a href="${CHANNEL.url}" target="_blank" rel="noopener"><b>${CHANNEL.name}</b></a>.
    Datele rămân doar pe telefonul tău (localStorage) — fă periodic un export de siguranță.</p>`;
  v.appendChild(about);
}

/* ===== Timer pauză ===== */
let restEnd = 0, restTotal = 0, restTick = null;

function startRest(ex, si, secOverride) {
  const sec = secOverride || (ex ? targetFor(ex).rest : 120);
  restTotal = sec;
  restEnd = Date.now() + sec * 1000;
  $("#rest-next").textContent = ex
    ? (si + 1 < draft.entries[ex.id].length ? `Urmează: ${ex.name} — set ${si + 2}` : `${ex.name} bifat complet ✓`)
    : "Timer manual";
  $("#rest-sheet").hidden = false;
  clearInterval(restTick);
  restTick = setInterval(tickRest, 200);
  tickRest();
}

function stopRest() {
  clearInterval(restTick);
  restTick = null;
  $("#rest-sheet").hidden = true;
}

function tickRest() {
  const left = Math.max(0, (restEnd - Date.now()) / 1000);
  const mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  $("#rest-digits").textContent = `${mm}:${String(ss).padStart(2, "0")}`;
  drawArc(1 - left / restTotal);
  if (left <= 0) {
    stopRest();
    beep();
    toast("Pauza s-a terminat — următorul set! 🔥");
  }
}

/* arc conic pe conturul plăcii (între raza 40 și 54) */
function drawArc(frac) {
  const p = $("#rest-arc");
  const f = Math.min(0.9999, Math.max(0, 1 - frac)); // se golește pe măsură ce trece timpul
  const a0 = -Math.PI / 2, a1 = a0 + f * 2 * Math.PI;
  const R = 54, r = 40, cx = 60, cy = 60;
  const large = f > 0.5 ? 1 : 0;
  const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
  const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
  const xi1 = cx + r * Math.cos(a1), yi1 = cy + r * Math.sin(a1);
  const xi0 = cx + r * Math.cos(a0), yi0 = cy + r * Math.sin(a0);
  p.setAttribute("d",
    `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${r},${r} 0 ${large} 0 ${xi0},${yi0} Z`);
}

$("#rest-plus").addEventListener("click", () => { restEnd += 30000; restTotal += 30; });
$("#rest-skip").addEventListener("click", stopRest);

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
  } catch {}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
}

/* ===== Clipuri demo locale (salvate pe telefon, redare offline) ===== */
const DEMO_CACHE = "jacked-demos";
let demoObjURL = null;

async function demoURL(exId) {
  try {
    const c = await caches.open(DEMO_CACHE);
    const r = await c.match("demo/" + exId + ".mp4");
    if (!r) return null;
    return URL.createObjectURL(await r.blob());
  } catch { return null; }
}

async function demoIds() {
  try {
    const c = await caches.open(DEMO_CACHE);
    return (await c.keys()).map(req => req.url.split("/").pop().replace(".mp4", ""));
  } catch { return []; }
}

async function importDemos(files) {
  const c = await caches.open(DEMO_CACHE);
  let ok = 0, skip = [];
  for (const f of files) {
    const id = f.name.replace(/\.mp4$/i, "");
    if (exById(id)) {
      await c.put("demo/" + id + ".mp4", new Response(f, { headers: { "Content-Type": "video/mp4" } }));
      ok++;
    } else skip.push(f.name);
  }
  return { ok, skip };
}

/* ===== Video execuție (embed YouTube în buclă pe segment) ===== */
let ytReady = false, ytPlayer = null, ytLoop = null, ytSeg = null;

function loadYT() {
  return new Promise(res => {
    if (ytReady) return res();
    window.onYouTubeIframeAPIReady = () => { ytReady = true; res(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => res("offline");
    document.head.appendChild(s);
  });
}

async function openVideo(ex) {
  const m = $("#video-modal");
  m.hidden = false;
  $("#video-title").textContent = ex.name;
  document.querySelector("#video-modal .video-note").innerHTML =
    `Secvență în buclă din canalul <a id="video-link" href="https://www.youtube.com/watch?v=${ex.video.id}&t=${ex.video.start}s" target="_blank" rel="noopener">Average to Jacked</a>.`;

  // 1) clip local salvat pe telefon — merge offline, pornește instant
  const local = await demoURL(ex.id);
  if (local) {
    demoObjURL = local;
    const vd = document.createElement("video");
    vd.src = local; vd.muted = true; vd.loop = true; vd.playsInline = true; vd.autoplay = true;
    $("#yt-player").innerHTML = "";
    $("#yt-player").appendChild(vd);
    vd.play().catch(() => { vd.controls = true; });
    document.querySelector("#video-modal .video-note").innerHTML =
      `Clip salvat local · sursă: <a href="https://www.youtube.com/watch?v=${ex.video.id}&t=${ex.video.start}s" target="_blank" rel="noopener">Average to Jacked</a>.`;
    return;
  }

  // 2) fallback: embed YouTube pe segment
  if (!navigator.onLine) {
    $("#yt-player").innerHTML = '<p style="color:#fff;padding:40px 16px;text-align:center">Ești offline — video-ul are nevoie de internet.<br>Citește indicațiile scrise de pe card.</p>';
    return;
  }
  const r = await loadYT();
  if (r === "offline") return;
  ytSeg = ex.video;
  if (ytPlayer) { try { ytPlayer.destroy(); } catch {} ytPlayer = null; }
  $("#yt-player").innerHTML = "";
  const holder = document.createElement("div");
  holder.id = "yt-player-inner";
  $("#yt-player").appendChild(holder);
  ytPlayer = new YT.Player("yt-player-inner", {
    videoId: ex.video.id,
    playerVars: { start: ex.video.start, end: ex.video.end, autoplay: 1, mute: 1, controls: 1, rel: 0, playsinline: 1, modestbranding: 1, iv_load_policy: 3, origin: location.origin, widget_referrer: location.href },
    events: {
      onReady: e => { e.target.mute(); e.target.playVideo(); },
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(ytSeg.start); e.target.playVideo(); }
      }
    }
  });
  clearInterval(ytLoop);
  ytLoop = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    try { if (ytPlayer.getCurrentTime() >= ytSeg.end - 0.2) ytPlayer.seekTo(ytSeg.start); } catch {}
  }, 400);

  // dacă playerul nu pornește singur (autoplay blocat), oferă și un link direct,
  // fără să ascundem playerul — un tap pe butonul Play din video rămâne valabil
  const seg = ex.video;
  setTimeout(() => {
    if ($("#video-modal").hidden || ytSeg !== seg) return;
    let st = -2;
    try { st = ytPlayer.getPlayerState(); } catch {}
    if (st === -1 || st === -2 || st === undefined) {
      const mm = Math.floor(seg.start / 60), ss = String(seg.start % 60).padStart(2, "0");
      const note = document.querySelector("#video-modal .video-note");
      note.innerHTML = `Nu pornește? Apasă Play pe video sau
        <a href="https://www.youtube.com/watch?v=${seg.id}&t=${seg.start}s" target="_blank" rel="noopener">▶ deschide pe YouTube la ${mm}:${ss}</a>.`;
    }
  }, 5000);
}

function closeVideo() {
  $("#video-modal").hidden = true;
  clearInterval(ytLoop);
  if (ytPlayer) { try { ytPlayer.destroy(); } catch {} ytPlayer = null; }
  if (demoObjURL) { URL.revokeObjectURL(demoObjURL); demoObjURL = null; }
  $("#yt-player").innerHTML = "";
}
$("#video-close").addEventListener("click", closeVideo);
$("#video-modal").addEventListener("click", e => { if (e.target === $("#video-modal")) closeVideo(); });

/* ===== Toast ===== */
let toastT = null;
function toast(msg, gold, ms) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (gold ? " gold" : "");
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => t.hidden = true, ms || 2600);
}

/* ===== Service worker ===== */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");

/* ===== Start ===== */
renderAzi();
