/* JACKED v2 — vederile: Azi, Program, Exerciții, Progres, Unelte. */
"use strict";

const store = J2.store;
let settings = store.settings();
let draft = store.draft();
J2.ensureBlockStart(settings, J2.todayISO());

const saveDraft = () => { if (draft) store.saveDraft(draft); };
const todayISO = () => J2.todayISO();
const curPhase = () => J2.phase(J2.blockWeek(todayISO(), settings));

/* ===== Taburi ===== */
const views = { azi: renderAzi, program: renderProgram, exercitii: renderExercitii, progres: renderProgres, unelte: renderUnelte };
let activeTab = "azi";
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".view").forEach(v => (v.hidden = v.dataset.view !== tab));
  document.querySelectorAll(".tab").forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
  views[tab]();
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

function renderChip() {
  const chip = $("#block-chip");
  const w = J2.blockWeek(todayISO(), settings), ph = J2.phase(w);
  chip.innerHTML = `Săpt. ${w}/12<small>${ph.deload ? "deload" : "RPE " + ph.rpe}</small>`;
  chip.hidden = false;
}

/* ===== AZI ===== */
function dailyStrip(v) {
  const today = todayISO();
  const body = store.body();
  const d = body.daily[today] || {};
  const card = el("div", "card");
  const grid = el("div", "daily");
  grid.innerHTML = `
    <div class="f"><label for="d-kg">Greutate</label><input id="d-kg" type="text" inputmode="decimal" placeholder="kg" value="${d.kg ? fmtW(d.kg) : ""}"></div>
    <div class="f"><label for="d-pasi">Pași</label><input id="d-pasi" type="text" inputmode="numeric" placeholder="${settings.pasiTinta}" value="${d.pasi || ""}"></div>
    <div class="f ${d.proteina ? "on" : ""}" id="d-prot"><label>Proteină</label><div class="big">${d.proteina ? "✓ atinsă" : `~${settings.proteinaTinta} g?`}</div></div>`;
  card.appendChild(grid);
  grid.querySelector("#d-kg").addEventListener("change", e => { const kg = parseFloat(e.target.value.replace(",", ".")); J2.logDaily(today, { kg: kg || null }); });
  grid.querySelector("#d-pasi").addEventListener("change", e => { J2.logDaily(today, { pasi: parseInt(e.target.value) || null }); });
  const prot = grid.querySelector("#d-prot");
  prot.addEventListener("click", () => { const b = store.body(); const on = !(b.daily[today] && b.daily[today].proteina); J2.logDaily(today, { proteina: on }); prot.classList.toggle("on", on); prot.querySelector(".big").textContent = on ? "✓ atinsă" : `~${settings.proteinaTinta} g?`; });
  const td = J2.talieDue(body, settings, today);
  if (td.due) {
    const n = el("p", "note warn", `<b>Talia:</b> ${td.last ? `au trecut ${td.days} zile de la ultima măsurare (${fmtW(body.talie[body.talie.length - 1].cm)} cm).` : "încă nu ai nicio măsurare."} ${esc(TALIE_PROTOCOL)}`);
    n.style.marginTop = "10px";
    const row = el("div", "row"); row.style.marginTop = "8px";
    const inp = el("input"); inp.type = "text"; inp.inputMode = "decimal"; inp.placeholder = "cm"; inp.className = "grow"; inp.style.cssText = "border:1.5px solid var(--line2);border-radius:10px;padding:9px;font-family:var(--disp);font-size:20px;font-weight:600;text-align:center";
    const b = el("button", "btn ghost", "Salvează talia");
    b.addEventListener("click", () => { const cm = parseFloat(inp.value.replace(",", ".")); if (!cm) { toast("Scrie centimetrii"); return; } J2.logTalie(today, cm); toast("Talie salvată"); renderAzi(); });
    row.append(inp, b);
    n.appendChild(row);
    card.appendChild(n);
  }
  v.appendChild(card);
}

function weekStrip(v) {
  const today = todayISO();
  const monday = J2.mondayOf(today);
  const logs = store.logs();
  const sched = store.sched();
  const nextId = J2.nextDayId(sched);
  const card = el("div", "card"); card.style.padding = "12px 10px";
  const row = el("div", "week-row");
  for (let i = 0; i < 7; i++) {
    const d = J2.addDays(monday, i);
    const done = logs.filter(l => l.date === d && l.kind !== "odihna");
    const planned = J2.planDay(i, settings);
    const c = el("div", "wk" + (d === today ? " today" : "") + (done.length ? " done" : "") + (!done.length && d >= today && planned === nextId ? " plan" : ""));
    c.innerHTML = `<span class="wk-n">${ZILE_SCURT[i]}</span><span class="wk-d">${J2.dateOf(d).getDate()}</span><span class="wk-dot"${done.length ? ` style="background:${DAYS[done[0].dayId] ? DAYS[done[0].dayId].color : "var(--ok)"}"` : ""}></span><span class="wk-k">${done.length ? DAYS[done[0].dayId].name : DAYS[planned].name}</span>`;
    row.appendChild(c);
  }
  card.appendChild(row);
  v.appendChild(card);
}

function renderAzi() {
  const v = $("#view-azi");
  v.innerHTML = "";
  renderChip();
  dailyStrip(v);
  weekStrip(v);
  const today = todayISO();
  const sched = store.sched();
  const nextId = J2.nextDayId(sched);
  const ph = curPhase();

  if (!draft) {
    const d = DAYS[nextId];
    const planned = J2.planDay(J2.weekday(today), settings);
    const hero = el("div", "day-hero");
    hero.style.background = d.grad;
    hero.innerHTML = `<div style="position:relative;z-index:1">
        <p class="h-eyebrow">Urmează · ${fmtLong(today)}</p>
        <h2>${esc(d.name)}</h2>
        <p class="h-sub">${esc(d.sub)} · săpt. ${ph.week}, ${ph.deload ? "deload" : "RPE " + ph.rpe}</p>
        ${planned !== nextId ? `<p class="hero-note">Pe calendar azi ar fi <b>${esc(DAYS[planned].name)}</b>. Ședințele sărite se decalează, nu se pierd: de aceea urmează ${esc(d.name)}.</p>` : ""}
        <button class="btn-hero">Începe</button>
        <button class="btn-hero" style="background:rgba(255,255,255,.2);color:#fff;box-shadow:none;margin-left:6px">Altă zi</button>
      </div>`;
    const [bStart, bOther] = hero.querySelectorAll(".btn-hero");
    bStart.addEventListener("click", () => startDay(nextId));
    bOther.addEventListener("click", pickDaySheet);
    v.appendChild(hero);
    const last = store.logs().filter(l => l.kind !== "odihna").slice(-1)[0];
    if (last) v.appendChild(el("p", "small muted", `Ultima ședință: <b>${esc(DAYS[last.dayId] ? DAYS[last.dayId].name : last.dayId)}</b>, ${fmtDate(last.date)}${last.sets ? `, ${last.sets} ${last.sets === 1 ? "serie" : "serii"}` : ""}.`));
    return;
  }

  const day = DAYS[draft.dayId];
  document.documentElement.style.setProperty("--daycolor", day.color);
  document.documentElement.style.setProperty("--daygrad", day.grad);
  const hero = el("div", "day-hero");
  hero.style.background = day.grad;
  const R = 26, C = 2 * Math.PI * R;
  hero.innerHTML = `<div style="position:relative;z-index:1">
      <p class="h-eyebrow">Ședința de azi · ${fmtLong(draft.date)}</p>
      <h2>${esc(day.name)}</h2>
      <p class="h-sub">${esc(day.sub)} · săpt. ${draft.week}, ${draft.deload ? "DELOAD" : "RPE " + J2.phase(draft.week).rpe}</p>
    </div>
    <div class="h-ring" ${day.kind === "forta" || day.kind === "intervale" ? "" : "hidden"}><svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r="${R}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="7"/>
      <circle id="hero-prog" cx="38" cy="38" r="${R}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 38 38)"/>
      <text id="hero-count" class="ring-txt" x="38" y="37" text-anchor="middle" dominant-baseline="central">0/0</text>
      <text class="ring-lbl" x="38" y="52" text-anchor="middle">SERII</text></svg></div>`;
  v.appendChild(hero);
  window._heroRefresh = () => {
    let dn = 0, tt = 0;
    for (const sets of Object.values(draft.entries || {})) { tt += sets.length; dn += sets.filter(s => s.done).length; }
    const pc = hero.querySelector("#hero-prog"), ct = hero.querySelector("#hero-count");
    if (!pc) return;
    pc.setAttribute("stroke-dashoffset", tt ? C * (1 - dn / tt) : C);
    ct.textContent = `${dn}/${tt}`;
  };
  window._heroRefresh();

  if (day.kind === "forta") renderForta(v, day);
  else if (day.kind === "cardio") renderCardio(v, day);
  else if (day.kind === "intervale") renderIntervale(v, day);
  else renderOdihna(v, day);

  const fin = el("div", "finish-box");
  const btn = el("button", "btn finish", "Ședință încheiată ✓");
  btn.addEventListener("click", finishWorkout);
  const ab = el("button", "btn ghost", "Abandonează ședința");
  ab.style.cssText = "width:100%;margin-top:8px";
  ab.addEventListener("click", () => { if (confirm("Abandonezi ședința de azi? Nu se salvează nimic.")) { draft = null; store.clearDraft(); stopRest(); renderAzi(); } });
  fin.append(btn, ab);
  v.appendChild(fin);
}

function pickDaySheet() {
  sheetOpen("Alege ședința", body => {
    body.appendChild(el("p", "small muted", "Ședința aleasă devine cea curentă; programul continuă de la ea."));
    for (const id of WEEK) {
      const d = DAYS[id];
      const b = el("button", "btn ghost", `<b>${esc(d.name)}</b> · ${esc(d.sub)}`);
      b.style.cssText = "display:block;width:100%;margin-top:8px;text-align:left";
      b.addEventListener("click", () => { sheetClose(); startDay(id); });
      body.appendChild(b);
    }
  });
}

function startDay(dayId) {
  if (draft && J2.hasProgress(draft) && !confirm("Ai o ședință începută. O abandonezi?")) return;
  draft = J2.newDraft(dayId, todayISO(), settings, store.logs(), store.subs());
  saveDraft();
  renderAzi();
}

/* ---- Forță ---- */
function kinetoCard(stateObj) {
  const items = (settings.kineto || []).filter(Boolean).map((t, i) => ({ id: "k" + i, t }));
  const card = el("div", "card");
  if (!items.length) {
    card.innerHTML = `<div class="cl-head"><h3>Kineto</h3></div><p class="small muted" style="margin-top:6px">Niciun exercițiu de kinetoterapie introdus. Le adaugi din Unelte → Setări → Kineto și apar aici, în zilele de mobilitate și la finalul răcirii.</p>`;
    return card;
  }
  return checklistCard("Kineto", items, stateObj, saveDraft, { intro: "Exercițiile tale de kinetoterapie, cum le-ai introdus în Setări." });
}

function renderForta(v, day) {
  const ph = J2.phase(draft.week);
  const plan = J2.effectivePlan(day.id, {}).map(p => ({ ...p, ex: draft.subsUsed[p.ex] || p.ex }));
  // Încălzirea: generală + specifică + seriile de acomodare la primul compus
  const warmItems = WARMUP_GENERAL.concat(day.warm === "upper" ? WARMUP_UPPER : WARMUP_LOWER);
  const first = plan.find(p => EX[p.ex].compound);
  const wc = checklistCard("Încălzire · 8–10 min", warmItems, draft.warm, saveDraft, { collapsed: true });
  if (first) {
    const sug = J2.suggest(first.ex, first, store.logs(), ph);
    const w = parseFloat((draft.entries[first.ex] && draft.entries[first.ex][0] && draft.entries[first.ex][0].w) || sug.w) || 0;
    const a = el("div", "accom");
    const upd = () => {
      const ww = parseFloat((draft.entries[first.ex] && draft.entries[first.ex][0] && draft.entries[first.ex][0].w) || sug.w) || 0;
      a.innerHTML = `<b style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3)">Acomodare · ${esc(EX[first.ex].name)}</b>` +
        (ww ? J2.accom(ww, EX[first.ex].inc).map(s => `<span class="wu-set">${fmtW(s.w)} kg × ${s.r}</span>`).join("") + "<span>apoi pauză completă → seriile de lucru</span>" : "<span>scrie greutatea de lucru la primul exercițiu și îți calculez seriile de acomodare</span>");
    };
    upd(); window._accomRefresh = upd;
    const it = el("div", "cl-item"); it.style.display = "block"; it.appendChild(a);
    wc.lastChild.appendChild(it);
    void w;
  }
  v.appendChild(wc);
  plan.forEach((p, i) => v.appendChild(exerciseCard(p, i, day, ph)));
  v.appendChild(checklistCard("Răcire · 6–8 min", COOLDOWN, draft.cool, saveDraft, { collapsed: false, intro: "Întinderi statice 30–45 s, fără durere. Unde scrie „pe parte”, cronometrul pornește a doua parte singur." }));
  v.appendChild(kinetoCard(draft.kineto));
  v.appendChild(summaryCard());
}

function summaryCard() {
  const s = J2.summary(draft);
  const c = el("div", "card");
  c.innerHTML = `<p class="small muted">Rezumat până acum</p><div class="summary"><div><b>${s.sets}</b><span>serii</span></div><div><b>${s.tonnage.toLocaleString("ro-RO")}</b><span>kg tonaj</span></div><div><b>${hhmmss(s.durationSec)}</b><span>timp</span></div></div>`;
  return c;
}

function unitLabel(ex) { return (ex.unit || "rep") === "s" ? "s" : (ex.unit === "m" ? "m" : "rep"); }

function exerciseCard(p, idx, day, ph) {
  const ex = EX[p.ex];
  const card = el("div", "card ex-card");
  card.style.setProperty("--daycolor", day.color);
  const logs = store.logs();
  const sug = J2.suggest(p.ex, p, logs, ph);
  if (!draft.entries[p.ex]) { draft.entries[p.ex] = Array.from({ length: sug.sets }, () => ({ w: sug.w === "" ? "" : sug.w, r: "", rpe: "", pain: 0, done: false })); saveDraft(); }
  const sets = draft.entries[p.ex];
  const rest = J2.restFor(ex);
  const reps = p.repLow === p.repHigh ? `${p.repLow}` : `${p.repLow}–${p.repHigh}`;
  const head = el("div", "ex-head");
  head.innerHTML = `<span class="ex-num">${idx + 1}</span>
    <div class="ex-title"><h3>${esc(ex.name)}</h3>
      <p class="ex-target"><b>${sug.sets} ${sug.sets === 1 ? "serie" : "serii"}</b> × ${reps} ${unitLabel(ex)}${ex.perSide ? "/parte" : ""} · RPE ${ph.rpe} · pauză ${rest >= 120 ? "2–3 min" : rest + " s"}</p></div>`;
  const vb = el("button", "btn-video", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Demo`);
  vb.addEventListener("click", () => openVideo(ex.video, ex.name));
  head.appendChild(vb);
  card.appendChild(head);
  if (p.orig && p.orig !== p.ex) card.appendChild(el("p", "ex-sub", `Înlocuitor pentru <b>${esc(EX[p.orig].name)}</b> (preferință salvată; o schimbi din Exerciții).`));
  card.appendChild(el("p", "ex-safety", esc(ex.safety)));
  const cb = el("button", "ex-cues-btn", "Indicații tehnice ›");
  cb.addEventListener("click", () => openCues(p.ex));
  card.appendChild(cb);
  if (sug.lastDate) card.appendChild(el("p", "ex-last", `Ultima dată (${fmtDate(sug.lastDate)}): ${sug.lastSets.map(s => `${s.w ? fmtW(s.w) + "kg×" : ""}${s.r}${s.rpe ? "@" + s.rpe : ""}`).join(" · ")}`));
  card.appendChild(el("span", "ex-suggest " + sug.dir, (sug.dir === "up" ? "▲ " : sug.dir === "down" ? "▼ " : "") + esc(sug.text)));

  const setsBox = el("div", "sets");
  setsBox.appendChild(el("div", "set-hd", `<span>#</span><span>kg</span><span>${unitLabel(ex)}</span><span>RPE</span><span></span>`));
  sets.forEach((s, si) => setsBox.appendChild(setRow(p, si, sug)));
  card.appendChild(setsBox);

  const foot = el("div", "ex-foot");
  const add = el("button", "btn-addset", "+ serie");
  add.addEventListener("click", () => { const prev = sets[sets.length - 1]; sets.push({ w: prev ? prev.w : "", r: "", rpe: "", pain: 0, done: false }); saveDraft(); setsBox.appendChild(setRow(p, sets.length - 1, sug)); window._heroRefresh(); });
  foot.appendChild(painSelector(p));
  foot.appendChild(add);
  card.appendChild(foot);
  return card;
}

function setRow(p, si, sug) {
  const ex = EX[p.ex];
  const s = draft.entries[p.ex][si];
  const row = el("div", "set-row" + (s.done ? " done" : ""));
  row.innerHTML = `<span class="s-idx">${si + 1}</span>
    <div class="num-field"><input type="text" inputmode="decimal" placeholder="${sug.w !== "" ? fmtW(sug.w) : (ex.bodyweight ? "corp" : "kg")}" value="${s.w !== "" ? fmtW(s.w) : ""}" aria-label="Greutate seria ${si + 1}"><span class="unit">kg</span></div>
    <div class="num-field"><input type="text" inputmode="numeric" placeholder="${sug.r || ""}" value="${s.r || ""}" aria-label="${unitLabel(ex)} seria ${si + 1}"><span class="unit">${unitLabel(ex)}</span></div>
    <div class="num-field"><input type="text" inputmode="decimal" placeholder="${J2.phase(draft.week).rpe}" value="${s.rpe || ""}" aria-label="RPE seria ${si + 1}"><span class="unit">rpe</span></div>`;
  const [wIn, rIn, eIn] = row.querySelectorAll("input");
  wIn.addEventListener("input", () => { s.w = parseFloat(wIn.value.replace(",", ".")) || ""; saveDraft(); if (si === 0 && window._accomRefresh) window._accomRefresh(); });
  rIn.addEventListener("input", () => { s.r = parseInt(rIn.value) || ""; saveDraft(); });
  eIn.addEventListener("input", () => { const x = parseFloat(eIn.value.replace(",", ".")); s.rpe = x >= 6 && x <= 10 ? x : ""; saveDraft(); });
  const btn = el("button", "btn-set");
  btn.setAttribute("aria-label", "Bifează seria " + (si + 1));
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`;
  btn.addEventListener("click", () => {
    if (!s.done) {
      if (!s.r) { rIn.focus(); toast(`Scrie ${unitLabel(ex) === "rep" ? "repetările" : unitLabel(ex) === "s" ? "secundele" : "metrii"}`); return; }
      s.done = true; row.classList.add("done"); saveDraft();
      const n = draft.entries[p.ex].length;
      startRest(J2.restFor(ex), si + 1 < n ? `Urmează: ${ex.name}, seria ${si + 2}` : `${ex.name} gata ✓`);
    } else { s.done = false; row.classList.remove("done"); saveDraft(); }
    window._heroRefresh();
  });
  row.appendChild(btn);
  return row;
}

function painSelector(p) {
  const box = el("div", "pain");
  box.appendChild(el("span", "pl", "Durere"));
  const cur = draft.pain[p.ex] || 0;
  for (let i = 0; i <= 10; i += (i < 3 ? 1 : 1)) {
    if (i > 0 && i < 3) continue;
    const b = el("button", (cur === i ? "on" : "") + (i >= 4 ? " hi" : ""), String(i));
    b.addEventListener("click", () => {
      draft.pain[p.ex] = i; saveDraft();
      box.querySelectorAll("button").forEach(x => x.classList.toggle("on", x.textContent === String(i)));
      if (i >= 4) painSheet(p);
    });
    box.appendChild(b);
  }
  return box;
}

function painSheet(p) {
  const ex = EX[p.ex];
  const subs = (SUBS[p.ex] || []).filter(id => EX[id]);
  sheetOpen("Durere ≥ 4: înlocuitor", body => {
    body.appendChild(el("p", "small muted", `Peste 3 din 10 la <b>${esc(ex.name)}</b>: exercițiul se înlocuiește pentru azi, iar alegerea rămâne salvată ca preferință până o schimbi din tabul Exerciții.`));
    if (!subs.length) { body.appendChild(el("p", "note", "Nu există înlocuitor în tabel. Reduce greutatea sau sari peste exercițiu.")); return; }
    for (const id of subs) {
      const b = el("button", "btn ghost", `<b>${esc(EX[id].name)}</b><br><span class="small muted">${esc(EX[id].safety)}</span>`);
      b.style.cssText = "display:block;width:100%;margin-top:8px;text-align:left";
      b.addEventListener("click", () => {
        J2.swapInDraft(draft, p.ex, id, store.logs(), settings);
        const subs = store.subs(); subs[p.orig || p.ex] = id; store.saveSubs(subs);
        saveDraft(); sheetClose(); toast(`Înlocuit cu ${EX[id].name}`); renderAzi();
      });
      body.appendChild(b);
    }
    const keep = el("button", "btn ghost", "Păstrez exercițiul, doar notez durerea");
    keep.style.cssText = "display:block;width:100%;margin-top:12px";
    keep.addEventListener("click", sheetClose);
    body.appendChild(keep);
  });
}

function openCues(exId) {
  const ex = EX[exId];
  sheetOpen(ex.name, body => {
    body.appendChild(el("p", "note", `<b>Siguranță:</b> ${esc(ex.safety)}`));
    body.appendChild(el("ol", "cues", ex.cues.map(c => `<li>${esc(c)}</li>`).join("")));
    const subs = (SUBS[exId] || []).filter(id => EX[id]);
    if (subs.length) body.appendChild(el("p", "sub-list", `<b>Înlocuitori:</b> ${subs.map(id => esc(EX[id].name)).join(" · ")}`));
    const vb = el("button", "btn ghost", "▶ Demo video"); vb.style.marginTop = "12px";
    vb.addEventListener("click", () => openVideo(ex.video, ex.name));
    body.appendChild(vb);
  });
}

/* ---- Cardio zonă 2 ---- */
function hrCard(range, lbl, sub) {
  const c = el("div", "card hr-card");
  c.innerHTML = `<p class="hr-lbl">${esc(lbl)}</p><div class="hr-big">${range[0]}–${range[1]}<small>bpm</small></div><p class="hr-sub">${esc(sub)}</p>`;
  return c;
}
function cardioKindSeg(kinds) {
  const seg = el("div", "seg"); seg.style.gridTemplateColumns = `repeat(${kinds.length},1fr)`;
  for (const [k, l] of kinds) {
    const b = el("button", draft.cardio.kind === k ? "on" : "", l);
    b.addEventListener("click", () => { draft.cardio.kind = k; saveDraft(); seg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
    seg.appendChild(b);
  }
  return seg;
}
function cardioInputs(v, zoneLabel) {
  const c = el("div", "card grid2");
  c.innerHTML = `<div class="field"><label>Minute în total</label><input type="text" inputmode="numeric" placeholder="50" value="${draft.cardio.min || ""}"></div>
    <div class="field"><label>${esc(zoneLabel)}</label><input type="text" inputmode="numeric" placeholder="45" value="${draft.cardio.zoneMin || ""}"></div>`;
  const [a, b] = c.querySelectorAll("input");
  a.addEventListener("input", () => { draft.cardio.min = parseInt(a.value) || ""; saveDraft(); });
  b.addEventListener("input", () => { draft.cardio.zoneMin = parseInt(b.value) || ""; saveDraft(); });
  v.appendChild(c);
}
function renderCardio(v, day) {
  const z = J2.zones(settings);
  const ph = J2.phase(draft.week);
  v.appendChild(hrCard(z.z2, "Zonă 2 · puls țintă", `Karvonen: repaus ${settings.hrRest}, maxim ${settings.hrMax} · 60–70 % din rezerva de puls`));
  const kc = el("div", "card");
  kc.appendChild(el("p", "small muted", "45–60 min pe bicicletă staționară, eliptică sau bandă cu înclinație 5–8 %. Nu alergare."));
  kc.appendChild(cardioKindSeg([["bicicleta", "Bicicletă"], ["eliptica", "Eliptică"], ["banda", "Bandă înclinată"]]));
  v.appendChild(kc);
  draft.cardio.sw = draft.cardio.sw || { startedAt: null, elapsed: 0 };
  stopwatch(v, draft.cardio.sw, saveDraft, { label: "Cronometru · țintă 45–60 min", target: 45 * 60, targetMsg: "45 de minute. Poți continua până la 60." });
  cardioInputs(v, "Minute în zonă 2");
  v.appendChild(checklistCard("Mobilitate · 10–15 min", MOBILITY, draft.mob, saveDraft, { intro: ph.deload ? "Săptămână de deload: cardio doar zonă 2, mobilitatea rămâne." : "" }));
  v.appendChild(kinetoCard(draft.kineto));
}

/* ---- Intervale 4×4 ---- */
function renderIntervale(v, day) {
  const z = J2.zones(settings);
  const ph = J2.phase(draft.week);
  if (ph.deload) {
    v.appendChild(el("p", "note warn", "<b>Deload:</b> săptămâna asta cardio-ul e doar zonă 2. Intervalele se înlocuiesc cu 30–40 min ușor; trunchiul rămâne."));
    v.appendChild(hrCard(z.z2, "Zonă 2 · puls țintă", `repaus ${settings.hrRest}, maxim ${settings.hrMax}`));
    draft.cardio.sw = draft.cardio.sw || { startedAt: null, elapsed: 0 };
    stopwatch(v, draft.cardio.sw, saveDraft, { label: "Cronometru · 30–40 min ușor", target: 30 * 60 });
    cardioInputs(v, "Minute în zonă 2");
  } else {
    v.appendChild(hrCard(z.int, "Intervale · puls țintă", `85–92 % din pulsul maxim ${settings.hrMax} · între ele, ușor`));
    const kc = el("div", "card");
    kc.appendChild(el("p", "small muted", "8 min încălzire progresivă, 4 × 4 min la puls țintă cu 3 min ușor între ele, 5 min răcire. Semnal sonor și vibrație la fiecare tranziție."));
    kc.appendChild(cardioKindSeg([["bicicleta", "Bicicletă"], ["eliptica", "Eliptică"], ["vaslit", "Vâslit"]]));
    kc.appendChild(el("p", "small muted", "Bicicleta dacă genunchiul e liniștit; altfel eliptică sau vâslit, cu priză neutră."));
    v.appendChild(kc);
    draft.cardio.run = draft.cardio.run || { phase: 0, phaseStart: null, phaseElapsed: 0, rounds: 0, done: false };
    intervalRunner(v, INTERVAL_PLAN, draft.cardio.run, z, () => { draft.cardio.rounds = draft.cardio.run.rounds; saveDraft(); }, () => { draft.cardio.min = draft.cardio.min || Math.round(INTERVAL_PLAN.reduce((a, p) => a + p.t, 0) / 60); draft.cardio.zoneMin = draft.cardio.zoneMin || 16; saveDraft(); });
    cardioInputs(v, "Minute la puls țintă");
  }
  v.appendChild(el("h2", "section-title", "Trunchi · 10 min"));
  const plan = J2.effectivePlan(day.id, {}).map(p => ({ ...p, ex: draft.subsUsed[p.ex] || p.ex }));
  plan.forEach((p, i) => v.appendChild(exerciseCard(p, i, day, ph)));
  v.appendChild(summaryCard());
}

/* ---- Odihnă activă ---- */
function renderOdihna(v, day) {
  v.appendChild(el("p", "note", "Plimbare 45–60 min, ritm de conversație. Opțional, mobilitatea de mai jos. Pașii îi notezi sus."));
  draft.cardio.sw = draft.cardio.sw || { startedAt: null, elapsed: 0 };
  stopwatch(v, draft.cardio.sw, saveDraft, { label: "Plimbare · țintă 45–60 min", target: 45 * 60 });
  cardioInputs(v, "Minute de mers");
  v.appendChild(checklistCard("Mobilitate (opțional)", MOBILITY, draft.mob, saveDraft, { collapsed: true }));
  v.appendChild(kinetoCard(draft.kineto));
}

/* ---- Final ---- */
function finishWorkout() {
  if (!draft) return;
  const day = DAYS[draft.dayId];
  if (day.kind !== "odihna" && !J2.hasProgress(draft) && !confirm("Nu ai bifat nicio serie și niciun minut. Închei totuși ședința?")) return;
  const logs = store.logs();
  const { entry, prs } = J2.finish(draft, logs);
  store.saveLogs(logs);
  J2.advanceCursor(draft.dayId);
  const dayId = draft.dayId;
  draft = null; store.clearDraft(); stopRest();
  renderAzi();
  sheetOpen("Ședință salvată", body => {
    body.appendChild(el("p", "small muted", `${esc(DAYS[dayId].name)} · ${fmtLong(entry.date)}`));
    const s = el("div", "summary");
    s.innerHTML = `<div><b>${entry.sets}</b><span>serii</span></div><div><b>${(entry.tonnage || 0).toLocaleString("ro-RO")}</b><span>kg tonaj</span></div><div><b>${hhmmss(entry.durationSec)}</b><span>timp</span></div>`;
    body.appendChild(s);
    if (entry.cardio && Number(entry.cardio.min)) body.appendChild(el("p", "small", `Cardio: ${entry.cardio.min} min, din care ${entry.cardio.zoneMin || 0} în zona țintă.`));
    if (prs.length) body.appendChild(el("p", "note", `🏆 e1RM nou la: ${prs.map(id => esc(EX[id].name)).join(", ")}`));
    const painful = Object.entries(entry.pain || {}).filter(([, p]) => p >= 4);
    if (painful.length) body.appendChild(el("p", "note warn", `Durere ≥ 4 notată la: ${painful.map(([id, p]) => `${esc(EX[id] ? EX[id].name : id)} (${p})`).join(", ")}.`));
    const next = DAYS[J2.nextDayId(store.sched())];
    body.appendChild(el("p", "small muted", `Urmează: <b>${esc(next.name)}</b>, ${esc(next.sub)}.`));
  });
}

/* ===== PROGRAM ===== */
function renderProgram() {
  const v = $("#view-program");
  v.innerHTML = "";
  const today = todayISO();
  const w = J2.blockWeek(today, settings), ph = J2.phase(w), bn = J2.blockNumber(today, settings);
  const bc = el("div", "card");
  bc.innerHTML = `<p class="small muted">Blocul ${bn} · a început luni ${fmtDate(settings.blockStart)}</p>
    <h3 style="font-family:var(--disp);font-size:24px;margin-top:2px">Săptămâna ${w} din 12 · ${esc(ph.label)}</h3>
    <p class="small muted">${esc(ph.desc)}</p>
    <div class="phase-grid">
      <div class="ph ${w <= 4 ? "on" : ""}"><b>1–4</b>RPE 7<br>−1 serie la compuse</div>
      <div class="ph ${w >= 5 && w <= 8 ? "on" : ""}"><b>5–8</b>RPE 8<br>serii complete</div>
      <div class="ph ${w >= 9 && w <= 11 ? "on" : ""}"><b>9–11</b>RPE 8–9<br>serii complete</div>
      <div class="ph ${w === 12 ? "on" : ""}"><b>12</b>Deload<br>½ serii, −30 %</div>
    </div>`;
  const row = el("div", "btn-row");
  const bNew = el("button", "btn ghost", "Bloc nou din lunea asta");
  bNew.addEventListener("click", () => { if (!confirm("Pornești un bloc nou de 12 săptămâni începând cu lunea săptămânii curente?")) return; settings.blockStart = J2.mondayOf(today); store.saveSettings(settings); toast("Bloc nou pornit"); renderProgram(); renderChip(); });
  const bWeek = el("button", "btn ghost", "Setează săptămâna din bloc");
  bWeek.addEventListener("click", () => { const n = parseInt(prompt("În ce săptămână a blocului ești? (1–12)", String(w))); if (!(n >= 1 && n <= 12)) return; settings.blockStart = J2.addDays(J2.mondayOf(today), -7 * (n - 1)); store.saveSettings(settings); toast(`Săptămâna ${n}`); renderProgram(); renderChip(); });
  row.append(bNew, bWeek);
  bc.appendChild(row);
  v.appendChild(bc);

  // săptămâna: calendar vs cursor
  const sched = store.sched();
  const nextId = J2.nextDayId(sched);
  const logs = store.logs();
  const monday = J2.mondayOf(today);
  const wc = el("div", "card");
  wc.appendChild(el("p", "small muted", `Săptămâna începe ${ZILE[settings.startDay || 0].toLowerCase()}. Ședința sărită se decalează: următoarea e mereu cea de după ultima făcută.`));
  const grid = el("div", "wk-plan"); grid.style.marginTop = "8px";
  for (let i = 0; i < 7; i++) {
    const d = J2.addDays(monday, i);
    const pid = J2.planDay(i, settings);
    const done = logs.find(l => l.date === d && l.kind !== "odihna");
    const c = el("div", "d" + (done ? " done" : "") + (pid === nextId && !done && d >= today ? " next" : ""));
    c.innerHTML = `<b>${ZILE_SCURT[i]}</b><span class="k">${esc(done ? DAYS[done.dayId].name : DAYS[pid].name)}</span>`;
    grid.appendChild(c);
  }
  wc.appendChild(grid);
  const r2 = el("div", "btn-row");
  const selNext = el("select", "ex-select");
  for (const id of WEEK) { const o = el("option", "", `Următoarea: ${DAYS[id].name}`); o.value = id; if (id === nextId) o.selected = true; selNext.appendChild(o); }
  selNext.addEventListener("change", () => { J2.setCursor(selNext.value); toast(`Următoarea ședință: ${DAYS[selNext.value].name}`); renderProgram(); });
  const selStart = el("select", "ex-select");
  ZILE.forEach((z, i) => { const o = el("option", "", `Start săptămână: ${z}`); o.value = i; if (i === (settings.startDay || 0)) o.selected = true; selStart.appendChild(o); });
  selStart.addEventListener("change", () => { settings.startDay = parseInt(selStart.value); store.saveSettings(settings); renderProgram(); });
  r2.append(selNext, selStart);
  wc.appendChild(r2);
  v.appendChild(wc);

  for (const id of WEEK) {
    const d = DAYS[id];
    const card = el("div", "card");
    const head = el("div", "pday-head"); head.style.setProperty("--c", d.color);
    head.innerHTML = `<span class="dot"></span><h3>${esc(d.name)}</h3><span class="muted small">${esc(ZILE[(WEEK.indexOf(id) + (settings.startDay || 0)) % 7])}<br>${esc(d.sub)}</span>`;
    card.appendChild(head);
    const subs = store.subs();
    if (d.kind === "forta" || d.kind === "intervale") {
      if (d.kind === "intervale") card.appendChild(el("p", "small muted", "Încălzire 8 min · 4 × 4 min la 85–92 % din pulsul maxim, 3 min ușor între · răcire 5 min · apoi trunchiul:"));
      for (const p of J2.effectivePlan(id, subs)) {
        const ex = EX[p.ex];
        const ts = J2.targetSets(p, ex, ph);
        const r = el("div", "p-ex");
        r.innerHTML = `<div class="n"><b>${esc(ex.name)}${p.ex !== p.orig ? ` <span class="small muted">(în locul: ${esc(EX[p.orig].name)})</span>` : ""}</b><span>${ex.grp.map(g => GRUPE[g]).join(", ")} · ${esc(ex.safety)}</span></div>
          <span class="t">${ts}×${p.repLow === p.repHigh ? p.repLow : p.repLow + "–" + p.repHigh}${(ex.unit || "rep") !== "rep" ? " " + ex.unit : ""}</span>`;
        const play = el("button", "play", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`);
        play.setAttribute("aria-label", "Vezi execuția " + ex.name);
        play.addEventListener("click", () => openVideo(ex.video, ex.name));
        r.appendChild(play);
        card.appendChild(r);
      }
      if (d.kind === "forta") card.appendChild(el("p", "small muted", `Încălzire standard (generală + ${d.warm === "upper" ? "upper" : "lower"}) cu serii de acomodare la primul compus; răcire standard; kineto.`));
    } else if (d.kind === "cardio") {
      const z = J2.zones(settings);
      card.appendChild(el("p", "small", `45–60 min zonă 2 (<b>${z.z2[0]}–${z.z2[1]} bpm</b>) pe bicicletă, eliptică sau bandă înclinată 5–8 %. Apoi mobilitate 10–15 min și kineto.`));
    } else {
      card.appendChild(el("p", "small", "Plimbare 45–60 min; mobilitate opțional. Zilnic: 8.000–10.000 de pași."));
    }
    v.appendChild(card);
  }

  const mk = (title, items) => { v.appendChild(el("h2", "section-title", title)); const c = el("div", "card"); for (const it of items) c.appendChild(el("div", "rule-item", `<b>${esc(it.title)}</b><p>${esc(it.body)}</p>`)); v.appendChild(c); };
  mk("Parametrii de forță", [
    { title: "Serii și repetări", body: "Numărul din listă, la RPE-ul blocului. Niciodată la eșec pe compuse. Excentric controlat 2–3 s, fără smucituri." },
    { title: "Progresie dublă", body: "Când toate seriile ating capătul de sus al intervalului la RPE ≤ 9, aplicația propune +2,5 % (sau cel mai mic increment: 2,5 kg la bară și aparat, 1–2 kg la gantere). Dacă o serie nu atinge capătul de jos, propune −5 %." },
    { title: "Pauze", body: "2–3 min la compuse, 60–90 s la izolare, 45 s la trunchi. Cronometrul pornește singur la bifarea seriei." },
    { title: "Durere", body: "0–3 din 10 e în regulă. La 4 sau mai mult, aplicația propune înlocuitorul din tabel, îl notează și îl ține ca preferință." }
  ]);
  mk("Periodizarea (bloc de 12 săptămâni)", [
    { title: "Săpt. 1–4 · reacomodare", body: "RPE 7, o serie mai puțin la compuse." },
    { title: "Săpt. 5–8", body: "RPE 8, seriile complete." },
    { title: "Săpt. 9–11", body: "RPE 8–9, seriile complete." },
    { title: "Săpt. 12 · deload", body: "Jumătate din serii, −30 % greutate, cardio doar zonă 2. Apoi blocul se reia cu greutăți noi." },
    { title: "Repere", body: `Greutate corporală zilnic (opțional), talie la ${settings.taliaDays} zile cu protocol fix, proteină zilnic (bifă), pași (opțional). Țintă săptămânală: 10–20 de serii pe grupă, ≥150 min cardio în zonă.` }
  ]);
}

/* ===== EXERCIȚII ===== */
let exFilter = "all";
function renderExercitii() {
  const v = $("#view-exercitii");
  v.innerHTML = "";
  const seg = el("div", "seg"); seg.style.gridTemplateColumns = "repeat(5,1fr)";
  for (const [k, l] of [["all", "Toate"], ["upperA", "Upper A"], ["lowerA", "Lower A"], ["upperB", "Upper B"], ["lowerB", "Lower B"]]) {
    const b = el("button", exFilter === k ? "on" : "", l);
    b.addEventListener("click", () => { exFilter = k; renderExercitii(); });
    seg.appendChild(b);
  }
  v.appendChild(seg);
  const subs = store.subs();
  const listed = new Set();
  const dayIds = exFilter === "all" ? ["upperA", "lowerA", "upperB", "lowerB", "intervals"] : [exFilter];
  for (const id of dayIds) {
    const d = DAYS[id];
    v.appendChild(el("h2", "section-title", d.name + (d.kind === "intervale" ? " · trunchi" : "")));
    for (const p of (d.plan || d.core)) {
      if (listed.has(p.ex) && exFilter === "all") continue;
      listed.add(p.ex);
      v.appendChild(exerciseDetails(p.ex, p, subs));
    }
  }
  if (exFilter === "all") {
    v.appendChild(el("h2", "section-title", "Înlocuitori"));
    for (const id of Object.keys(EX)) if (EX[id].sub) v.appendChild(exerciseDetails(id, null, subs));
    const rc = el("div", "card"); rc.innerHTML = `<b>Reguli generale de înlocuire</b><ul class="cues">${SUBS_REGULI.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`;
    v.appendChild(rc);
    const lists = [["Încălzire · generală", WARMUP_GENERAL], ["Încălzire · upper", WARMUP_UPPER], ["Încălzire · lower", WARMUP_LOWER], ["Răcire", COOLDOWN], ["Mobilitate", MOBILITY]];
    for (const [t, items] of lists) {
      v.appendChild(el("h2", "section-title", t));
      const c = el("div", "card");
      for (const it of items) {
        const r = el("div", "p-ex");
        r.innerHTML = `<div class="n"><b>${esc(it.t)}${it.rep ? " · " + esc(it.rep) : it.sec ? ` · ${it.sec} s${it.side ? " pe parte" : ""}` : ""}</b><span>${esc(it.body || "")}</span></div>`;
        if (it.video && VIDEO[it.video]) {
          const play = el("button", "play", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`);
          play.setAttribute("aria-label", "Video " + it.t);
          play.addEventListener("click", () => openVideo(it.video, it.t));
          r.appendChild(play);
        }
        c.appendChild(r);
      }
      v.appendChild(c);
    }
  }
}
function exerciseDetails(id, p, subs) {
  const ex = EX[id];
  const d = el("details", "card");
  const vid = VIDEO[ex.video];
  d.innerHTML = `<summary><b>${esc(ex.name)}</b>${p ? `<span class="pill">${p.sets}×${p.repLow === p.repHigh ? p.repLow : p.repLow + "–" + p.repHigh}</span>` : ""}<span class="pill">${ex.grp.map(g => GRUPE[g]).join(" · ")}</span></summary>
    <p class="note" style="margin-top:10px"><b>Siguranță:</b> ${esc(ex.safety)}</p>
    <ol class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ol>`;
  const sl = (SUBS[id] || []).filter(x => EX[x]);
  if (sl.length) {
    const s = el("div", "sub-list");
    s.innerHTML = `<b>Înlocuitori:</b> `;
    sl.forEach((x, i) => {
      const b = el("button", "btn ghost", `${esc(EX[x].name)}${subs[id] === x ? " ✓ preferat" : ""}`);
      b.style.cssText = "margin:4px 4px 0 0;padding:6px 10px;font-size:13px";
      b.addEventListener("click", () => { const s2 = store.subs(); if (s2[id] === x) delete s2[id]; else s2[id] = x; store.saveSubs(s2); toast(s2[id] ? `Preferință: ${EX[x].name}` : "Preferință ștearsă"); renderExercitii(); });
      s.appendChild(b);
      void i;
    });
    d.appendChild(s);
  }
  const row = el("div", "btn-row");
  const vb = el("button", "btn ghost", `▶ Demo video${vid && vid.verificat === false ? " (timp neverificat)" : ""}`);
  vb.addEventListener("click", () => openVideo(ex.video, ex.name));
  row.appendChild(vb);
  if (!vid) vb.disabled = true;
  d.appendChild(row);
  return d;
}

/* ===== PROGRES ===== */
let progresEx = null;
function renderProgres() {
  const v = $("#view-progres");
  v.innerHTML = "";
  const logs = store.logs();
  const today = todayISO();
  const monday = J2.mondayOf(today);
  const thisWeek = logs.filter(l => l.date >= monday && l.kind !== "odihna").length;
  const stats = el("div", "stat-row");
  stats.innerHTML = `<div class="card stat-tile"><div class="v">${logs.filter(l => l.source !== "v1").length}</div><div class="l">ședințe v2</div></div>
    <div class="card stat-tile"><div class="v">${thisWeek}/6</div><div class="l">săptămâna asta</div></div>
    <div class="card stat-tile"><div class="v">${J2.weeklyCardio(logs, monday).zone}</div><div class="l">min cardio în zonă</div></div>`;
  v.appendChild(stats);
  if (!logs.length) { v.appendChild(el("div", "empty", "Încă nu ai ședințe salvate. Termină prima și progresul apare aici.")); return; }

  // pe exercițiu
  v.appendChild(el("h2", "section-title", "Pe exercițiu · greutate și e1RM (Epley)"));
  const trained = Object.keys(EX).filter(id => logs.some(l => (l.entries[id] || []).some(s => s.done && Number(s.w) > 0)));
  if (trained.length) {
    const sel = el("select", "ex-select");
    if (!progresEx || !trained.includes(progresEx)) progresEx = trained[0];
    for (const id of trained) { const o = el("option", "", EX[id].name); o.value = id; if (id === progresEx) o.selected = true; sel.appendChild(o); }
    sel.addEventListener("change", () => { progresEx = sel.value; renderProgres(); });
    v.appendChild(sel);
    const series = J2.seriesForEx(logs, progresEx).map(p => ({ date: p.date, v: p.maxW, v2: p.e, extra: `${fmtW(p.w)}×${p.r}` }));
    const cc = el("div", "card");
    cc.appendChild(el("p", "small muted", "Linie plină: greutatea maximă pe serie · linie punctată: e1RM estimat"));
    cc.appendChild(lineChart(series, "#2456A6", { unit: " kg", label2: "e1RM" }));
    v.appendChild(cc);
    const hist = el("div", "card");
    let best = 0; const rows = [];
    for (const l of logs) {
      const sets = (l.entries[progresEx] || []).filter(s => s.done && s.r);
      if (!sets.length) continue;
      const e = Math.max(...sets.map(s => J2.e1rm(s.w, s.r)));
      const pr = e > best + 0.01 && rows.length > 0; best = Math.max(best, e);
      rows.push(`<div class="hist-row"><span class="d">${fmtDate(l.date)}${l.source === "v1" ? " <span class='small muted'>v1</span>" : ""}</span><span class="s">${sets.map(s => `${s.w ? fmtW(s.w) + "kg×" : ""}${s.r}${s.rpe ? "@" + s.rpe : ""}`).join(" · ")}</span>${pr ? '<span class="pr-flag">PR</span>' : ""}</div>`);
    }
    hist.innerHTML = rows.reverse().slice(0, 30).join("");
    v.appendChild(hist);
  } else v.appendChild(el("p", "empty", "Nicio serie cu greutate încă."));

  // serii pe grupă
  v.appendChild(el("h2", "section-title", "Serii pe grupă · săptămâna asta (țintă 10–20)"));
  const ws = J2.weeklySets(logs, monday);
  const bc = el("div", "card bars");
  for (const [g, lbl] of Object.entries(GRUPE)) {
    const n = Math.round(ws[g] * 2) / 2, pct = Math.min(100, n / 25 * 100);
    bc.innerHTML += `<div class="bar"><span>${lbl}</span><div class="track"><div class="band" style="left:${10 / 25 * 100}%;width:${10 / 25 * 100}%"></div><div class="fill ${n >= 10 && n <= 20 ? "ok" : n > 20 ? "hi" : ""}" style="width:${pct}%"></div></div><span class="v">${fmtW(n)}</span></div>`;
  }
  bc.appendChild(el("p", "small muted", "O serie contează 1 la grupa principală și 0,5 la cea secundară. Banda verde = 10–20."));
  v.appendChild(bc);

  // cardio
  v.appendChild(el("h2", "section-title", "Cardio în zonă · țintă ≥150 min/săpt."));
  const cardC = el("div", "card bars");
  for (let i = 3; i >= 0; i--) {
    const m = J2.addDays(monday, -7 * i);
    const c = J2.weeklyCardio(logs, m);
    cardC.innerHTML += `<div class="bar"><span>${i === 0 ? "Săpt. asta" : fmtDate(m)}</span><div class="track"><div class="fill ${c.zone >= 150 ? "ok" : ""}" style="width:${Math.min(100, c.zone / 200 * 100)}%"></div></div><span class="v">${c.zone}</span></div>`;
  }
  v.appendChild(cardC);

  // talie și greutate
  const body = store.body();
  v.appendChild(el("h2", "section-title", "Talie (cm)"));
  const tc = el("div", "card");
  tc.appendChild(lineChart(body.talie.map(t => ({ date: t.date, v: t.cm })), "#B5651D", { unit: " cm", empty: "După două măsurători apare graficul taliei." }));
  const tr = el("div", "row"); tr.style.marginTop = "10px";
  const ti = el("input"); ti.type = "text"; ti.inputMode = "decimal"; ti.placeholder = "cm azi"; ti.style.cssText = "flex:1;border:1.5px solid var(--line2);border-radius:10px;padding:9px;font-family:var(--disp);font-size:20px;font-weight:600;text-align:center";
  const tb = el("button", "btn ghost", "Salvează");
  tb.addEventListener("click", () => { const cm = parseFloat(ti.value.replace(",", ".")); if (!cm) return; J2.logTalie(today, cm); toast("Talie salvată"); renderProgres(); });
  tr.append(ti, tb); tc.appendChild(tr);
  tc.appendChild(el("p", "small muted", TALIE_PROTOCOL));
  v.appendChild(tc);
  v.appendChild(el("h2", "section-title", "Greutate corporală (kg)"));
  const wcard = el("div", "card");
  wcard.appendChild(lineChart(J2.weightSeries(body), "#1E7A46", { unit: " kg", empty: "Notează greutatea pe tabul Azi; după două zile apare graficul." }));
  v.appendChild(wcard);

  // aderență
  v.appendChild(el("h2", "section-title", "Aderență · ședințe făcute din 6 planificate"));
  const ad = J2.adherence(logs, 8, today);
  const ac = el("div", "card");
  const grid = el("div", "adh");
  for (const w of ad) grid.innerHTML += `<div class="w"><div class="b"><div style="height:${Math.min(100, w.done / w.planned * 100)}%"></div></div>${w.done}/${w.planned}<br>${fmtDate(w.monday)}</div>`;
  ac.appendChild(grid);
  v.appendChild(ac);
}

/* ===== UNELTE ===== */
function renderUnelte() {
  const v = $("#view-unelte");
  v.innerHTML = "";

  v.appendChild(el("h2", "section-title", "Setări"));
  const sc = el("div", "card");
  const z = J2.zones(settings);
  sc.innerHTML = `<div class="grid2">
      <div class="field"><label>Puls de repaus</label><input id="s-rest" type="text" inputmode="numeric" value="${settings.hrRest}"></div>
      <div class="field"><label>Puls maxim</label><input id="s-max" type="text" inputmode="numeric" value="${settings.hrMax}"></div>
      <div class="field"><label>Talia la (zile)</label><input id="s-talie" type="text" inputmode="numeric" value="${settings.taliaDays}"></div>
      <div class="field"><label>Țintă proteină (g)</label><input id="s-prot" type="text" inputmode="numeric" value="${settings.proteinaTinta}"></div>
      <div class="field"><label>Țintă pași</label><input id="s-pasi" type="text" inputmode="numeric" value="${settings.pasiTinta}"></div>
      <div class="field"><label>Unități</label><select id="s-unit"><option value="kg" ${settings.unit === "kg" ? "selected" : ""}>kg</option><option value="lb" ${settings.unit === "lb" ? "selected" : ""}>lb (doar etichetă)</option></select></div>
    </div>
    <p class="small muted" id="s-zones" style="margin-top:10px">Zonă 2: <b>${z.z2[0]}–${z.z2[1]}</b> bpm · intervale: <b>${z.int[0]}–${z.int[1]}</b> bpm (Karvonen / % din maxim)</p>`;
  const upd = () => {
    settings.hrRest = parseInt(sc.querySelector("#s-rest").value) || settings.hrRest;
    settings.hrMax = parseInt(sc.querySelector("#s-max").value) || settings.hrMax;
    settings.taliaDays = parseInt(sc.querySelector("#s-talie").value) || 14;
    settings.proteinaTinta = parseInt(sc.querySelector("#s-prot").value) || 150;
    settings.pasiTinta = parseInt(sc.querySelector("#s-pasi").value) || 8000;
    settings.unit = sc.querySelector("#s-unit").value;
    store.saveSettings(settings);
    const z2 = J2.zones(settings);
    sc.querySelector("#s-zones").innerHTML = `Zonă 2: <b>${z2.z2[0]}–${z2.z2[1]}</b> bpm · intervale: <b>${z2.int[0]}–${z2.int[1]}</b> bpm (Karvonen / % din maxim)`;
  };
  sc.querySelectorAll("input,select").forEach(i => i.addEventListener("change", upd));
  v.appendChild(sc);

  // kineto
  const kc = el("div", "card");
  kc.innerHTML = `<b>Kineto</b><p class="small muted">Exercițiile de kinetoterapie, câte unul pe rând (nume și doză). Apar ca checklist în zilele de mobilitate și la finalul răcirii.</p>`;
  const list = el("div", "kineto-list");
  const items = (settings.kineto || []).slice();
  const draw = () => {
    list.innerHTML = "";
    items.forEach((t, i) => {
      const r = el("div", "k");
      const inp = el("input"); inp.type = "text"; inp.value = t; inp.placeholder = "ex.: exercițiu, 3 × 10";
      inp.addEventListener("change", () => { items[i] = inp.value.trim(); settings.kineto = items.filter(Boolean); store.saveSettings(settings); });
      const del = el("button", "btn ghost danger", "✕");
      del.addEventListener("click", () => { items.splice(i, 1); settings.kineto = items.filter(Boolean); store.saveSettings(settings); draw(); });
      r.append(inp, del); list.appendChild(r);
    });
  };
  draw();
  kc.appendChild(list);
  const add = el("button", "btn ghost", "+ adaugă"); add.style.marginTop = "8px";
  add.addEventListener("click", () => { items.push(""); draw(); list.lastChild.querySelector("input").focus(); });
  kc.appendChild(add);
  v.appendChild(kc);

  // date
  v.appendChild(el("h2", "section-title", "Datele tale"));
  const dc = el("div", "card");
  const logs = store.logs();
  dc.appendChild(el("p", "small muted", `${logs.length} ședințe salvate local, pe acest telefon (${logs.filter(l => l.source === "v1").length} importate din v1).`));
  const row = el("div", "btn-row");
  const exp = el("button", "btn ghost", "Exportă JSON");
  exp.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(J2.exportAll(), null, 1)], { type: "application/json" });
    const a = el("a"); a.href = URL.createObjectURL(blob); a.download = `jacked2-backup-${todayISO()}.json`; a.click(); URL.revokeObjectURL(a.href);
  });
  const impL = el("label", "btn ghost", "Importă JSON");
  const impIn = el("input"); impIn.type = "file"; impIn.accept = ".json"; impIn.hidden = true;
  impIn.addEventListener("change", () => {
    const f = impIn.files[0]; if (!f) return;
    f.text().then(t => {
      try {
        const d = JSON.parse(t);
        if (d.app === "jacked2") { if (!confirm("Înlocuiești toate datele v2 cu cele din fișier?")) return; const n = J2.importAll(d); settings = store.settings(); draft = store.draft(); toast(`Import reușit: ${n} ședințe`); }
        else if (Array.isArray(d.logs)) { const l = store.logs(); const r = J2.importV1(d.logs, l); store.saveLogs(l); toast(`Import v1: ${r.added} ședințe, ${r.mapped} exerciții`); }
        else throw 0;
        renderUnelte();
      } catch { toast("Fișier invalid"); }
      impIn.value = "";
    });
  });
  impL.appendChild(impIn);
  row.append(exp, impL);
  dc.appendChild(row);
  const v1row = el("div", "btn-row");
  const v1b = el("button", "btn ghost", "Importă istoricul din v1 (același telefon)");
  v1b.addEventListener("click", () => {
    let v1 = null;
    try { v1 = JSON.parse(localStorage.getItem("jacked.logs.v1")); } catch {}
    if (!Array.isArray(v1) || !v1.length) { toast("Nu există istoric v1 pe acest telefon. Folosește exportul din v1 și „Importă JSON”."); return; }
    const l = store.logs(); const r = J2.importV1(v1, l); store.saveLogs(l);
    toast(r.added ? `Import v1: ${r.added} ședințe, ${r.mapped} exerciții comune` : "Nimic nou de importat");
    renderUnelte();
  });
  v1row.appendChild(v1b);
  dc.appendChild(v1row);
  dc.appendChild(el("p", "small muted", "Exercițiile comune cu v1 (presa înclinată, ramatul T-bar, helcometrul, presa de picioare, RDL, flexiile de femurali, extensiile, gambele, fluturările posterioare, flexiile ciocan) primesc istoricul ca punct de plecare pentru greutăți."));
  const del = el("button", "btn ghost danger", "Șterge toate datele v2"); del.style.marginTop = "10px";
  del.addEventListener("click", () => { if (confirm("Sigur ștergi TOATE datele v2? Fă un export înainte.") && confirm("Ultima confirmare.")) { for (const k of Object.values(J2.K)) localStorage.removeItem(k); settings = store.settings(); draft = null; J2.ensureBlockStart(settings, todayISO()); toast("Date șterse"); renderUnelte(); } });
  dc.appendChild(del);
  v.appendChild(dc);

  // clipuri offline
  v.appendChild(el("h2", "section-title", "Clipuri demo offline"));
  const vc = el("div", "card");
  const status = el("p", "small muted", "…");
  vc.appendChild(status);
  const total = Object.keys(VIDEO).length;
  const refresh = () => demoKeys().then(k => { status.innerHTML = `<b>${k.length}/${total}</b> clipuri salvate pe telefon. ${k.length ? "Demonstrațiile merg instant, și offline." : "Încarcă fișiere .mp4 cu numele cheii video (de ex. <code>hip-thrust.mp4</code>). Clipurile nu sunt în aplicație: le imporți tu, local."}`; });
  refresh();
  const vrow = el("div", "btn-row");
  const impV = el("label", "btn ghost", "Încarcă clipuri");
  const impVIn = el("input"); impVIn.type = "file"; impVIn.accept = "video/mp4"; impVIn.multiple = true; impVIn.hidden = true;
  impVIn.addEventListener("change", async () => { if (!impVIn.files.length) return; toast("Salvez clipurile…"); const { ok, skip } = await importDemos(impVIn.files); toast(ok ? `${ok} clipuri salvate ✓` : "Niciun nume recunoscut"); if (skip.length) console.warn("Nume nerecunoscute:", skip); refresh(); impVIn.value = ""; });
  impV.appendChild(impVIn);
  const delV = el("button", "btn ghost", "Șterge clipurile");
  delV.addEventListener("click", async () => { if (!confirm("Ștergi clipurile demo salvate local?")) return; await caches.delete(DEMO_CACHE); toast("Clipuri șterse"); refresh(); });
  vrow.append(impV, delV);
  vc.appendChild(vrow);
  const keys = el("details"); keys.innerHTML = `<summary class="small muted" style="cursor:pointer;margin-top:8px">Cheile video (numele fișierelor)</summary><p class="small muted" style="margin-top:6px">${Object.keys(VIDEO).sort().join(" · ")}</p>`;
  vc.appendChild(keys);
  v.appendChild(vc);

  const about = el("div", "card");
  about.innerHTML = `<p class="small muted">Jacked v2, programul „Recomp 4+2”. Aplicație personală, fără server și fără analytics: datele rămân pe telefon (localStorage). Clipurile demo sunt embed-uri YouTube din clipuri publice, cu link la sursă. <a href="../">Deschide v1</a>.</p>`;
  v.appendChild(about);
}

/* ===== Service worker și start ===== */
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js");
renderAzi();
