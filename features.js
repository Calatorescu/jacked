/* Săptămâna pe Azi, stretching cu cronometru, „Ce spune canalul” pe card.
   Se încarcă înainte de app.js; funcțiile din app.js sunt folosite doar la rulare. */

/* ===== Foaie modală comună ===== */
function sheetOpen(title, buildBody) {
  let m = document.getElementById("sheet");
  if (!m) {
    m = el("div", "modal");
    m.id = "sheet";
    m.innerHTML = `<div class="modal-card sheet-card" role="dialog" aria-modal="true">
      <div class="modal-head"><h3 id="sheet-title"></h3><button class="btn-x" aria-label="Închide">✕</button></div>
      <div class="sheet-body"></div></div>`;
    document.body.appendChild(m);
    m.querySelector(".btn-x").addEventListener("click", sheetClose);
    m.addEventListener("click", e => { if (e.target === m) sheetClose(); });
  }
  sheetStopTimer();
  m.querySelector("#sheet-title").textContent = title;
  const body = m.querySelector(".sheet-body");
  body.innerHTML = "";
  body.scrollTop = 0;
  buildBody(body);
  m.hidden = false;
}
function sheetClose() {
  sheetStopTimer();
  const m = document.getElementById("sheet");
  if (m) m.hidden = true;
}

/* ===== Săptămâna ===== */
const ZI_SCURT = ["L", "Ma", "Mi", "J", "V", "S", "D"];
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateOf = iso => new Date(iso + "T12:00");
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/* Următoarea zi de antrenament: o zi liberă după Push și Legs, două după Pull (regula canalului). */
function nextTrainingDate() {
  const logs = store.logs();
  if (!logs.length) return null;
  const last = logs[logs.length - 1];
  return addDays(dateOf(last.date), last.dayId === "pull" ? 3 : 2);
}

function weekStrip() {
  const box = el("div", "card week");
  const logs = store.logs();
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const tIso = isoOf(today);
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  const next = nextTrainingDate();
  const nextIso = next && next > today ? isoOf(next) : null;
  const byDate = {};
  for (const l of logs) (byDate[l.date] ||= []).push(l.dayId);

  const row = el("div", "week-row");
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const iso = isoOf(d);
    const done = byDate[iso] || [];
    const c = el("div", "wk" + (iso === tIso ? " today" : "") + (iso === nextIso ? " plan" : "") + (done.length ? " done" : ""));
    c.innerHTML = `<span class="wk-n">${ZI_SCURT[i]}</span><span class="wk-d">${d.getDate()}</span>` +
      (done.length ? `<span class="wk-dot" style="background:${PROGRAM.days[done[done.length - 1]].color}"></span>` : `<span class="wk-dot"></span>`);
    if (done.length) c.title = done.map(x => PROGRAM.days[x].name).join(", ");
    row.appendChild(c);
  }
  box.appendChild(row);

  if (logs.length && !draft) {
    const last = logs[logs.length - 1];
    const lastName = PROGRAM.days[last.dayId].name;
    const nextName = PROGRAM.days[suggestedDay()].name;
    const ziua = next ? next.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }) : "";
    let msg = "";
    if (last.date === tIso) msg = `Ai terminat <b>${lastName}</b> azi. Următorul: <b>${nextName}</b>, ${ziua}.`;
    else if (next && today < next) msg = `<b>Azi e zi liberă.</b> După ${lastName} faci ${last.dayId === "pull" ? "două zile" : "o zi"} pauză. Următorul: <b>${nextName}</b>, ${ziua}. Te poți antrena și azi, din butoanele de sus.`;
    if (msg) box.appendChild(el("p", "small muted week-msg", msg));
  }
  return box;
}

/* ===== Stretching cu cronometru ===== */
let sheetTimer = null;
function sheetStopTimer() { clearInterval(sheetTimer); sheetTimer = null; }

function openStretch(dupaAntrenament) {
  const pasi = STRETCH.filter(s => /^\d+\./.test(s.title));
  sheetOpen("Stretching · ~5 minute", body => {
    if (dupaAntrenament) body.appendChild(el("p", "small muted", "Antrenament salvat. Acum rutina de stretching, dacă ai timp."));
    stretchPasi(body, pasi.map(p => ({ ...p, title: p.title.replace(/\s*\(.*\)$/, "") })));
    const src = STRETCH.find(s => s.title === "Sursa");
    if (src) body.appendChild(el("p", "small muted st-src", src.body));
  });
}

/* Rutina pe zi: faza „inainte” (mobilitate) sau „dupa” (întinderi). */
function openStretchZi(dayId, faza, dupaAntrenament) {
  const r = STRETCH_ZI[dayId];
  if (!r) return;
  const d = PROGRAM.days[dayId];
  const inainte = faza === "inainte";
  sheetOpen(`${inainte ? "Înainte" : "După"} ${d.name} · ~${inainte ? 3 : 5} minute`, body => {
    if (dupaAntrenament) body.appendChild(el("p", "small muted", "Antrenament salvat. Acum întinderile pentru mușchii lucrați azi."));
    body.appendChild(el("p", "small muted", inainte
      ? "După mersul pe bandă, înainte de seturile de încălzire. Mișcări controlate, nu ținute: nu trebuie să obosească."
      : "Ține fiecare întindere 30 s, fără arcuiri. Unde scrie „pe fiecare parte”, după prima parte butonul arată „Partea 2”."));
    stretchPasi(body, r[faza]);
    body.appendChild(el("p", "small muted st-src", STRETCH_ZI_SURSA));
  });
}

/* Card pe tabul Azi, cu cele două rutine ale zilei. */
function stretchZiCard(dayId, faza) {
  const r = STRETCH_ZI[dayId];
  if (!r) return null;
  const inainte = faza === "inainte";
  const c = el("div", "card st-zi");
  c.innerHTML = `<div class="st-zi-t"><b>${inainte ? "Înainte · mobilitate ~3 min" : "După · întinderi ~5 min"}</b>
    <span class="small muted">${r[faza].map(p => p.title).join(" · ")}</span></div>`;
  const b = el("button", "btn ghost", "Deschide");
  b.addEventListener("click", () => openStretchZi(dayId, faza, false));
  c.appendChild(b);
  return c;
}

function stretchPasi(body, pasi) {
  for (const p of pasi) {
      const it = el("div", "st-item");
      const extra = p.rep ? ` · ${p.rep}` : (p.side ? " · pe fiecare parte" : "");
      it.innerHTML = `<label class="st-check"><input type="checkbox"><span><b>${p.title}${extra}</b><span class="small muted">${p.body}</span></span></label>`;
      const vid = p.video || (p.vid && STRETCH_VIDEO[p.vid]);
      if (vid) {
        const vb = el("button", "btn-video st-vid", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Video`);
        vb.setAttribute("aria-label", "Vezi cum se face: " + p.title);
        vb.addEventListener("click", () => { sheetStopTimer(); openVideo({ id: "st-" + p.vid, name: p.title, video: vid }); });
        it.appendChild(vb);
      }
      if (p.sec) {
        const b = el("button", "btn ghost st-timer", `${p.sec} s`);
        b.addEventListener("click", () => {
          const running = b.classList.contains("on");
          sheetStopTimer();
          body.querySelectorAll(".st-timer.on").forEach(x => { x.classList.remove("on"); x.textContent = `${x.dataset.sec} s`; });
          if (running) return;
          let left = p.sec;
          b.classList.add("on");
          b.textContent = `${left} s`;
          sheetTimer = setInterval(() => {
            left--;
            b.textContent = `${left} s`;
            if (left <= 0) {
              sheetStopTimer();
              b.classList.remove("on");
              if (navigator.vibrate) navigator.vibrate(200);
              if (p.side && !b.dataset.parte) {
                // prima parte gata: butonul pornește a doua parte
                b.dataset.parte = "2";
                b.textContent = "Partea 2";
                return;
              }
              b.textContent = "Gata ✓";
              it.querySelector("input").checked = true;
            }
          }, 1000);
        });
        b.dataset.sec = p.sec;
        it.appendChild(b);
      }
      body.appendChild(it);
  }
}

/* ===== Ce spune canalul, pe card ===== */
const EX_TEME = {
  "incline-db-press": ["piept"], "machine-shoulder-press": ["umeri"], "chest-fly": ["piept"], "lowhigh-cable-fly": ["piept"],
  "cable-lateral-raise": ["umeri"], "triceps-pushdown": ["brate"],
  "leg-press": ["picioare"], "squat": ["picioare"], "db-rdl": ["picioare"], "leg-curl": ["picioare"], "leg-extension": ["picioare"],
  "seated-calf": ["picioare"], "cable-crunch": ["abdomen-gat"],
  "lat-pulldown": ["spate"], "tbar-row": ["spate"], "seated-cable-row": ["spate"], "rear-delt-fly": ["umeri"],
  "incline-db-curl": ["brate"], "cable-curl": ["brate"], "hammer-curl": ["brate", "antebrate"]
};

function canalPeCard(ex) {
  const teme = EX_TEME[ex.id];
  if (!teme) return null;
  const b = el("button", "ex-canal", "Ce spune canalul ›");
  b.addEventListener("click", () => {
    sheetOpen(ex.name, body => {
      body.appendChild(el("p", "small muted", "Se încarcă…"));
      canalLoad().then(() => {
        body.innerHTML = "";
        for (const id of teme) {
          const t = CANAL.ghid.teme.find(x => x.id === id);
          if (!t) continue;
          const s = el("div", "sh-tema");
          s.innerHTML = `<h4>${canalEsc(t.titlu)}</h4><ul class="c-reg">${t.reguli.map(r => `<li>${canalEsc(r.text)} ${canalSurse(r.surse)}</li>`).join("")}</ul>`;
          body.appendChild(s);
        }
        body.appendChild(el("p", "small muted", "Reformulat din clipurile canalului; ▶ deschide clipul sursă. Restul, în tabul Canal."));
      }).catch(() => { body.innerHTML = `<p class="small muted">Nu s-a putut încărca. Deschide aplicația o dată cu internet.</p>`; });
    });
  });
  return b;
}
