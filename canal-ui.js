/* Tabul Canal: ghidul pe teme și căutarea în clipurile canalului.
   Datele (canal.js) se încarcă la prima deschidere a tabului. */
const CANAL_TEME = {
  "principii-antrenament": "Principii",
  "program-si-split": "Program și split",
  "volum-si-frecventa": "Volum și frecvență",
  "failure-si-progresie": "Failure și progresie",
  "tehnica": "Tehnică",
  "piept": "Piept",
  "spate": "Spate",
  "umeri": "Umeri",
  "brate": "Brațe",
  "antebrate": "Antebrațe",
  "picioare": "Picioare",
  "abdomen": "Abdomen",
  "gat": "Gât",
  "incalzire": "Încălzire",
  "mobilitate": "Mobilitate",
  "cardio-si-pasi": "Cardio și pași",
  "recuperare-si-somn": "Recuperare și somn",
  "accidentari-si-articulatii": "Accidentări și articulații",
  "nutritie": "Nutriție",
  "slabit": "Slăbit",
  "masa-musculara": "Masă musculară",
  "suplimente": "Suplimente",
  "sala-acasa": "Sală acasă",
  "mentalitate": "Mentalitate",
  "mike-mentzer": "Mike Mentzer",
  "incepatori": "Începători",
  "varsta": "Vârstă",
  "altceva": "Altele"
};

const canalState = { sec: "ghid", q: "", tema: "", tip: "", arata: 30 };

const canalEsc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const canalNorm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const canalLink = id => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;

function canalLoad() {
  if (window.CANAL) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "canal.js";
    s.onload = res;
    s.onerror = rej;
    document.body.appendChild(s);
  });
}

function canalSurse(ids) {
  return `<span class="c-surse">${ids.map((id, i) =>
    `<a href="${canalLink(id)}" target="_blank" rel="noopener" aria-label="Clipul sursă ${i + 1}">▶</a>`).join("")}</span>`;
}

function renderCanal() {
  const v = $("#view-canal");
  if (!window.CANAL) {
    v.innerHTML = `<p class="muted c-load">Se încarcă…</p>`;
    canalLoad()
      .then(() => { if (activeTab === "canal") renderCanal(); })
      .catch(() => { v.innerHTML = `<p class="muted c-load">Nu s-a putut încărca. Deschide aplicația o dată cu internet.</p>`; });
    return;
  }
  v.innerHTML = "";
  const seg = el("div", "c-seg");
  for (const [id, label] of [["ghid", "Ghid pe teme"], ["clipuri", `Toate clipurile (${CANAL.clipuri.length})`]]) {
    const b = el("button", "c-seg-b" + (canalState.sec === id ? " on" : ""), label);
    b.addEventListener("click", () => { canalState.sec = id; renderCanal(); window.scrollTo(0, 0); });
    seg.appendChild(b);
  }
  v.appendChild(seg);
  if (canalState.sec === "ghid") canalGhid(v); else canalClipuri(v);
}

function canalGhid(v) {
  v.appendChild(el("p", "small muted c-intro",
    `Reformulat din clipurile canalului <a href="${CHANNEL.url}" target="_blank" rel="noopener">${CHANNEL.name}</a>, parcurse la ${CANAL.actualizat}. La o contradicție rămâne poziția cea mai nouă. Cifrele canalului sunt convertite din lb, inci și uncii în kg, cm și ml, rotunjite. ▶ deschide clipul sursă.`));
  for (const t of CANAL.ghid.teme) {
    const d = el("details", "card c-tema");
    d.innerHTML = `<summary><b>${canalEsc(t.titlu)}</b><span class="c-n">${t.reguli.length}</span></summary>
      <p class="small muted c-rez">${canalEsc(t.rezumat)}</p>
      <ul class="c-reg">${t.reguli.map(r => `<li>${canalEsc(r.text)} ${canalSurse(r.surse)}</li>`).join("")}</ul>`;
    v.appendChild(d);
  }
  if (CANAL.ghid.schimbari.length) {
    v.appendChild(el("h2", "section-title", "Ce s-a schimbat în timp"));
    for (const s of CANAL.ghid.schimbari) {
      const c = el("div", "card c-sch");
      c.innerHTML = `<b>${canalEsc(s.subiect)}</b>
        <p class="small"><span class="muted">Înainte:</span> ${canalEsc(s.inainte)} ${canalSurse(s.surse_inainte)}</p>
        <p class="small"><span class="muted">Acum:</span> ${canalEsc(s.acum)} ${canalSurse(s.surse_acum)}</p>`;
      v.appendChild(c);
    }
  }
}

function canalFiltrate() {
  const q = canalNorm(canalState.q.trim());
  const cuvinte = q ? q.split(/\s+/) : [];
  return CANAL.clipuri.filter(c => {
    if (canalState.tema && !c.th.includes(canalState.tema)) return false;
    if (canalState.tip && c.k !== canalState.tip) return false;
    if (!cuvinte.length) return true;
    c._n = c._n || canalNorm([c.t, ...c.i, ...c.e.map(e => e.join(" ")), ...c.c].join(" "));
    return cuvinte.every(w => c._n.includes(w));
  });
}

function canalClipuri(v) {
  const filtre = el("div", "card c-filtre");
  const inp = el("input", "c-q");
  inp.type = "search";
  inp.placeholder = "Caută: proteină, ramat, somn…";
  inp.value = canalState.q;
  inp.setAttribute("aria-label", "Caută în clipuri");
  const rand = el("div", "c-rand");
  const selT = el("select");
  selT.setAttribute("aria-label", "Temă");
  selT.innerHTML = `<option value="">Toate temele</option>` + Object.entries(CANAL_TEME).map(([k, l]) =>
    `<option value="${k}"${canalState.tema === k ? " selected" : ""}>${l}</option>`).join("");
  const selK = el("select");
  selK.setAttribute("aria-label", "Tip de clip");
  selK.innerHTML = [["", "Lungi și Shorts"], ["l", "Doar lungi"], ["s", "Doar Shorts"]].map(([k, l]) =>
    `<option value="${k}"${canalState.tip === k ? " selected" : ""}>${l}</option>`).join("");
  rand.append(selT, selK);
  filtre.append(inp, rand);
  v.appendChild(filtre);

  const wrap = el("div");
  v.appendChild(wrap);
  const list = () => {
    const a = canalFiltrate();
    wrap.innerHTML = "";
    wrap.appendChild(el("p", "small muted c-count", `${a.length} ${a.length === 1 ? "clip" : "clipuri"}, cele mai noi întâi`));
    for (const c of a.slice(0, canalState.arata)) wrap.appendChild(canalCard(c));
    if (a.length > canalState.arata) {
      const m = el("button", "btn ghost c-more", `Arată mai multe (${a.length - canalState.arata} rămase)`);
      m.addEventListener("click", () => { canalState.arata += 30; list(); });
      wrap.appendChild(m);
    }
  };
  let tmr;
  inp.addEventListener("input", () => {
    clearTimeout(tmr);
    tmr = setTimeout(() => { canalState.q = inp.value; canalState.arata = 30; list(); }, 180);
  });
  selT.addEventListener("change", () => { canalState.tema = selT.value; canalState.arata = 30; list(); });
  selK.addEventListener("change", () => { canalState.tip = selK.value; canalState.arata = 30; list(); });
  list();
}

function canalCard(c) {
  const d = el("article", "card c-clip");
  const meta = `${c.k === "s" ? "Short" : "Clip lung"} · ${canalEsc(c.d)}`;
  const body = c.i.length
    ? `<ul class="c-idei">${c.i.map(i => `<li>${canalEsc(i)}</li>`).join("")}</ul>`
    : `<p class="small muted">Fără transcriere disponibilă; vezi clipul.</p>`;
  const ex = c.e.length
    ? `<details class="c-ex"><summary>Exerciții (${c.e.length})</summary><ul>${c.e.map(([n, x]) =>
        `<li><b>${canalEsc(n)}</b>${x ? ": " + canalEsc(x) : ""}</li>`).join("")}</ul></details>`
    : "";
  d.innerHTML = `<a class="c-t" href="${canalLink(c.v)}" target="_blank" rel="noopener">${canalEsc(c.t)}</a>
    <p class="small muted">${meta}</p>${body}${ex}`;
  return d;
}
