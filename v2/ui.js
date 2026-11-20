/* JACKED v2 — componente de interfață: foaie modală, toast, cronometre, secvențier de intervale,
   player video (YouTube în buclă pe segment, cu clipuri locale offline), checklist. */
"use strict";

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtW = J2.fmtW;
const fmtDate = s => J2.dateOf(s).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
const fmtLong = s => J2.dateOf(s).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
const mmss = sec => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; };
const hhmmss = sec => { sec = Math.max(0, Math.round(sec)); const h = Math.floor(sec / 3600); return (h ? h + ":" : "") + `${String(Math.floor((sec % 3600) / 60)).padStart(h ? 2 : 1, "0")}:${String(sec % 60).padStart(2, "0")}`; };

/* ===== Toast ===== */
let toastT = null;
function toast(msg, gold, ms) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (gold ? " gold" : "");
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.hidden = true), ms || 2600);
}

/* ===== Sunet și vibrație ===== */
function beep(n) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const times = n === "long" ? [0, 0.3, 0.6, 0.9] : [0, 0.25, 0.5];
    times.forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = n === "long" ? 660 : 880;
      g.gain.setValueAtTime(0.001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
  } catch {}
  if (navigator.vibrate) navigator.vibrate(n === "long" ? [300, 100, 300, 100, 300, 100, 600] : [200, 100, 200, 100, 400]);
}

/* ===== Foaie modală ===== */
function sheetOpen(title, build) {
  let m = $("#sheet");
  if (!m) {
    m = el("div", "modal"); m.id = "sheet";
    m.innerHTML = `<div class="modal-card sheet-card" role="dialog" aria-modal="true">
      <div class="modal-head"><h3 id="sheet-title"></h3><button class="btn-x" aria-label="Închide">✕</button></div>
      <div class="sheet-body"></div></div>`;
    document.body.appendChild(m);
    m.querySelector(".btn-x").addEventListener("click", sheetClose);
    m.addEventListener("click", e => { if (e.target === m) sheetClose(); });
  }
  m.querySelector("#sheet-title").textContent = title;
  const body = m.querySelector(".sheet-body");
  body.innerHTML = ""; body.scrollTop = 0;
  build(body);
  m.hidden = false;
}
function sheetClose() { const m = $("#sheet"); if (m) m.hidden = true; }

/* ===== Cronometrul de pauză ===== */
let restEnd = 0, restTotal = 0, restTick = null;
function startRest(sec, label) {
  restTotal = sec; restEnd = Date.now() + sec * 1000;
  $("#rest-next").textContent = label || "";
  $("#rest-sheet").hidden = false;
  document.body.classList.add("rest-on");
  clearInterval(restTick);
  restTick = setInterval(tickRest, 200);
  tickRest();
}
function stopRest() { clearInterval(restTick); restTick = null; $("#rest-sheet").hidden = true; document.body.classList.remove("rest-on"); }
function tickRest() {
  const left = Math.max(0, (restEnd - Date.now()) / 1000);
  $("#rest-digits").textContent = mmss(left);
  drawArc(1 - left / restTotal);
  if (left <= 0) { stopRest(); beep(); toast("Pauza s-a terminat: următoarea serie"); }
}
function drawArc(frac) {
  const p = $("#rest-arc");
  const f = Math.min(0.9999, Math.max(0, 1 - frac));
  const a0 = -Math.PI / 2, a1 = a0 + f * 2 * Math.PI, R = 54, r = 40, cx = 60, cy = 60, large = f > 0.5 ? 1 : 0;
  const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
  const xi1 = cx + r * Math.cos(a1), yi1 = cy + r * Math.sin(a1), xi0 = cx + r * Math.cos(a0), yi0 = cy + r * Math.sin(a0);
  p.setAttribute("d", `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${r},${r} 0 ${large} 0 ${xi0},${yi0} Z`);
}
$("#rest-plus").addEventListener("click", () => { restEnd += 30000; restTotal += 30; });
$("#rest-skip").addEventListener("click", stopRest);

/* ===== Cronometru de element (checklist: ținute de N secunde, pe o parte sau două) ===== */
let itemTimer = null;
function itemCountdown(btn, sec, side, onDone) {
  const running = btn.classList.contains("on");
  clearInterval(itemTimer); itemTimer = null;
  document.querySelectorAll(".btn-timer.on").forEach(x => { x.classList.remove("on"); x.textContent = `${x.dataset.sec} s`; delete x.dataset.parte; });
  if (running) return;
  let left = sec;
  btn.classList.add("on"); btn.textContent = `${left} s`;
  itemTimer = setInterval(() => {
    left--;
    btn.textContent = `${left} s`;
    if (left <= 0) {
      clearInterval(itemTimer); itemTimer = null;
      btn.classList.remove("on");
      if (navigator.vibrate) navigator.vibrate(200);
      if (side && !btn.dataset.parte) { btn.dataset.parte = "2"; btn.textContent = "Partea 2"; return; }
      btn.textContent = "Gata ✓";
      delete btn.dataset.parte;
      if (onDone) onDone();
    }
  }, 1000);
}

/* ===== Cronometru simplu (zonă 2, plimbare): rulează pe timestamp, supraviețuiește închiderii tabului ===== */
function stopwatch(container, state, onChange, opts) {
  /* state: { startedAt: ms|null, elapsed: s (acumulat când e pe pauză) } */
  opts = opts || {};
  const box = el("div", "card sw");
  const time = el("div", "sw-time", "0:00");
  const sub = el("p", "sw-phase", opts.label || "");
  const row = el("div", "btn-row");
  const bStart = el("button", "btn ghost", "Pornește");
  const bReset = el("button", "btn ghost", "Resetează");
  row.append(bStart, bReset);
  box.append(time, sub, row);
  container.appendChild(box);
  let t = null;
  const total = () => (state.elapsed || 0) + (state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0);
  const draw = () => {
    time.textContent = hhmmss(total());
    bStart.textContent = state.startedAt ? "Pauză" : (state.elapsed ? "Continuă" : "Pornește");
    bStart.classList.toggle("on", !!state.startedAt);
    if (opts.target && total() >= opts.target && !state.notified) { state.notified = true; beep("long"); toast(opts.targetMsg || "Ținta de timp atinsă"); onChange(); }
  };
  const loop = () => { clearInterval(t); if (state.startedAt) t = setInterval(draw, 500); };
  bStart.addEventListener("click", () => {
    if (state.startedAt) { state.elapsed = total(); state.startedAt = null; }
    else state.startedAt = Date.now();
    onChange(); draw(); loop();
  });
  bReset.addEventListener("click", () => { if (total() > 10 && !confirm("Resetezi cronometrul?")) return; state.startedAt = null; state.elapsed = 0; state.notified = false; onChange(); draw(); loop(); });
  draw(); loop();
  return { total, stop: () => clearInterval(t) };
}

/* ===== Secvențierul de intervale 4×4 =====
   state: { phase: idx, phaseStart: ms|null, phaseElapsed: s, done: bool } */
function intervalRunner(container, plan, state, zones, onChange, onFinish) {
  const box = el("div", "card sw");
  const phaseL = el("p", "sw-phase");
  const time = el("div", "sw-time", "0:00");
  const target = el("p", "hr-sub");
  const prog = el("div", "sw-prog", "<div></div>");
  const next = el("p", "sw-next");
  const row = el("div", "btn-row");
  const bStart = el("button", "btn ghost", "Pornește");
  const bSkip = el("button", "btn ghost", "Faza următoare");
  const bReset = el("button", "btn ghost", "Resetează");
  row.append(bStart, bSkip, bReset);
  box.append(phaseL, time, target, prog, next, row);
  container.appendChild(box);
  let t = null;
  const cur = () => plan[Math.min(state.phase || 0, plan.length - 1)];
  const elapsed = () => (state.phaseElapsed || 0) + (state.phaseStart ? (Date.now() - state.phaseStart) / 1000 : 0);
  const draw = () => {
    const p = cur();
    const left = Math.max(0, p.t - elapsed());
    phaseL.textContent = `${state.phase + 1}/${plan.length} · ${p.label}`;
    phaseL.className = "sw-phase " + p.f;
    time.textContent = mmss(left);
    target.innerHTML = p.f === "lucru" ? `Puls țintă <b>${zones.int[0]}–${zones.int[1]}</b> bpm`
      : p.f === "usor" ? `Ușor: sub <b>${zones.easy[1]}</b> bpm` : p.f === "incalzire" ? "Progresiv, de la lejer spre zona 2" : "Ușor, 5 min";
    prog.firstChild.style.width = `${Math.min(100, elapsed() / p.t * 100)}%`;
    const n = plan[state.phase + 1];
    next.textContent = n ? `Urmează: ${n.label}, ${mmss(n.t)}` : "Ultima fază";
    bStart.textContent = state.phaseStart ? "Pauză" : (elapsed() > 0 ? "Continuă" : "Pornește");
    bStart.classList.toggle("on", !!state.phaseStart);
    if (left <= 0 && state.phaseStart) advance();
  };
  const advance = () => {
    const p = cur();
    if (p.f === "lucru") state.rounds = (state.rounds || 0) + 1;
    if (state.phase + 1 >= plan.length) {
      state.phaseStart = null; state.phaseElapsed = p.t; state.done = true;
      beep("long"); toast("Intervalele s-au terminat. Acum trunchiul.", true, 4000);
      onChange(); clearInterval(t); draw(); if (onFinish) onFinish(); return;
    }
    state.phase++; state.phaseElapsed = 0; state.phaseStart = Date.now();
    beep(cur().f === "lucru" ? "long" : undefined);
    onChange(); draw();
  };
  const loop = () => { clearInterval(t); if (state.phaseStart) t = setInterval(draw, 250); };
  bStart.addEventListener("click", () => {
    if (state.done) return;
    if (state.phaseStart) { state.phaseElapsed = elapsed(); state.phaseStart = null; }
    else state.phaseStart = Date.now();
    onChange(); draw(); loop();
  });
  bSkip.addEventListener("click", () => { if (state.done) return; if (!state.phaseStart) state.phaseStart = Date.now(); advance(); loop(); });
  bReset.addEventListener("click", () => { if (!confirm("Resetezi intervalele?")) return; state.phase = 0; state.phaseStart = null; state.phaseElapsed = 0; state.done = false; state.rounds = 0; onChange(); draw(); loop(); });
  state.phase = state.phase || 0;
  draw(); loop();
  return { stop: () => clearInterval(t) };
}

/* ===== Checklist (încălzire, răcire, mobilitate, kineto) ===== */
function checklist(container, items, stateObj, onChange, opts) {
  opts = opts || {};
  for (const p of items) {
    const it = el("div", "cl-item" + (stateObj[p.id] ? " done" : ""));
    const extra = p.rep ? ` · ${p.rep}` : (p.sec ? ` · ${p.sec} s${p.side ? " pe parte" : ""}` : "");
    it.innerHTML = `<label class="cl-check"><input type="checkbox" ${stateObj[p.id] ? "checked" : ""}><span><b>${esc(p.t)}${extra}</b>${p.body ? `<span class="small muted">${esc(p.body)}</span>` : ""}</span></label>`;
    const cb = it.querySelector("input");
    cb.addEventListener("change", () => { stateObj[p.id] = cb.checked; it.classList.toggle("done", cb.checked); onChange(); });
    const tools = el("div", "cl-tools");
    if (p.video && VIDEO[p.video]) {
      const vb = el("button", "btn-video", `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Video`);
      vb.setAttribute("aria-label", "Vezi cum se face: " + p.t);
      vb.addEventListener("click", () => openVideo(p.video, p.t));
      tools.appendChild(vb);
    }
    if (p.sec) {
      const b = el("button", "btn ghost btn-timer", `${p.sec} s`);
      b.dataset.sec = p.sec;
      b.addEventListener("click", () => itemCountdown(b, p.sec, p.side, () => { cb.checked = true; stateObj[p.id] = true; it.classList.add("done"); onChange(); }));
      tools.appendChild(b);
    }
    if (tools.children.length) it.appendChild(tools);
    if (opts.extra) { const x = opts.extra(p); if (x) it.appendChild(x); }
    container.appendChild(it);
  }
}

/* Card pliabil cu checklist și contor */
function checklistCard(title, items, stateObj, onChange, opts) {
  const card = el("div", "card cl-card");
  const head = el("div", "cl-head");
  const n = () => items.filter(p => stateObj[p.id]).length;
  const count = el("span", "cl-count");
  head.innerHTML = `<h3>${esc(title)}</h3>`;
  head.appendChild(count);
  const body = el("div");
  body.hidden = !!(opts && opts.collapsed) && n() === items.length;
  const refresh = () => { count.textContent = `${n()}/${items.length}`; count.classList.toggle("ok", n() === items.length); };
  head.addEventListener("click", () => { body.hidden = !body.hidden; });
  card.append(head, body);
  if (opts && opts.intro) body.appendChild(el("p", "small muted", opts.intro));
  checklist(body, items, stateObj, () => { refresh(); onChange(); }, opts);
  refresh();
  return card;
}

/* ===== Clipuri demo locale (Cache API, offline) ===== */
const DEMO_CACHE = "jacked2-demos";
let demoObjURL = null;
async function demoURL(key) {
  try { const c = await caches.open(DEMO_CACHE); const r = await c.match("demo/" + key + ".mp4"); return r ? URL.createObjectURL(await r.blob()) : null; } catch { return null; }
}
async function demoKeys() {
  try { const c = await caches.open(DEMO_CACHE); return (await c.keys()).map(q => q.url.split("/").pop().replace(".mp4", "")); } catch { return []; }
}
async function importDemos(files) {
  const c = await caches.open(DEMO_CACHE);
  let ok = 0, skip = [];
  for (const f of files) {
    const key = f.name.replace(/\.mp4$/i, "");
    if (VIDEO[key]) { await c.put("demo/" + key + ".mp4", new Response(f, { headers: { "Content-Type": "video/mp4" } })); ok++; }
    else skip.push(f.name);
  }
  return { ok, skip };
}

/* ===== Video (YouTube în buclă pe segment) ===== */
let ytReady = false, ytPlayer = null, ytLoop = null, ytSeg = null;
function loadYT() {
  return new Promise(res => {
    if (ytReady || (window.YT && window.YT.Player)) { ytReady = true; return res(); }
    window.onYouTubeIframeAPIReady = () => { ytReady = true; res(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => res("offline");
    document.head.appendChild(s);
    setTimeout(() => res("offline"), 8000);
  });
}
const ytLink = v => `https://www.youtube.com/watch?v=${v.id}${v.start ? `&t=${v.start}s` : ""}`;
const ytAt = v => { const s = v.start || 0; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

async function openVideo(key, title) {
  const v = VIDEO[key];
  if (!v) { toast("Nu există clip pentru acest element"); return; }
  const m = $("#video-modal");
  m.hidden = false;
  $("#video-title").textContent = title || key;
  const note = m.querySelector(".video-note");
  const src = `<a href="${ytLink(v)}" target="_blank" rel="noopener">${esc(v.autor || "YouTube")}</a>`;
  note.innerHTML = `${v.end ? "Secvență în buclă" : "Clip demonstrativ"} de pe canalul ${src}${v.verificat === false ? ' <span class="vid-flag">timp neverificat</span>' : ""}.`;

  const local = await demoURL(key);
  if (local) {
    demoObjURL = local;
    const vd = document.createElement("video");
    vd.src = local; vd.muted = true; vd.loop = true; vd.playsInline = true; vd.autoplay = true;
    $("#yt-player").innerHTML = ""; $("#yt-player").appendChild(vd);
    vd.play().catch(() => { vd.controls = true; });
    note.innerHTML = `Clip salvat local · sursă: ${src}.`;
    return;
  }
  if (!navigator.onLine) {
    $("#yt-player").innerHTML = '<p style="color:#fff;padding:40px 16px;text-align:center">Ești offline. Clipul are nevoie de internet; citește indicațiile scrise.</p>';
    return;
  }
  const r = await loadYT();
  if (r === "offline") {
    $("#yt-player").innerHTML = `<p style="color:#fff;padding:40px 16px;text-align:center">Playerul nu s-a încărcat. <a style="color:#fff" href="${ytLink(v)}" target="_blank" rel="noopener">▶ Deschide pe YouTube la ${ytAt(v)}</a></p>`;
    return;
  }
  ytSeg = v;
  if (ytPlayer) { try { ytPlayer.destroy(); } catch {} ytPlayer = null; }
  $("#yt-player").innerHTML = "";
  const holder = document.createElement("div"); holder.id = "yt-player-inner";
  $("#yt-player").appendChild(holder);
  ytPlayer = new YT.Player("yt-player-inner", {
    videoId: v.id,
    playerVars: { start: v.start || 0, ...(v.end ? { end: v.end } : {}), autoplay: 1, mute: 1, controls: 1, rel: 0, playsinline: 1, modestbranding: 1, iv_load_policy: 3, origin: location.origin, widget_referrer: location.href },
    events: {
      onReady: e => { e.target.mute(); e.target.playVideo(); },
      onStateChange: e => { if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(ytSeg.start || 0); e.target.playVideo(); } }
    }
  });
  clearInterval(ytLoop);
  ytLoop = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    try { if (ytSeg.end && ytPlayer.getCurrentTime() >= ytSeg.end - 0.2) ytPlayer.seekTo(ytSeg.start || 0); } catch {}
  }, 400);
  const seg = v;
  setTimeout(() => {
    if ($("#video-modal").hidden || ytSeg !== seg) return;
    let st = -2;
    try { st = ytPlayer.getPlayerState(); } catch {}
    if (st === -1 || st === -2 || st === undefined) {
      note.innerHTML = `Nu pornește? Apasă Play pe video sau <a href="${ytLink(seg)}" target="_blank" rel="noopener">▶ deschide pe YouTube la ${ytAt(seg)}</a>.`;
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

/* ===== Grafic linie SVG (una sau două serii) ===== */
function lineChart(series, color, opts) {
  opts = opts || {};
  const wrap = el("div", "chart-wrap");
  if (series.length < 2) { wrap.appendChild(el("p", "empty", opts.empty || "După minim 2 înregistrări apare graficul.")); return wrap; }
  const W = 600, H = 240, P = { t: 18, r: 46, b: 26, l: 10 };
  const vals = series.flatMap(p => [p.v, p.v2].filter(x => typeof x === "number"));
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
  const x = i => P.l + (i / (series.length - 1)) * (W - P.l - P.r);
  const y = v => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
  let grid = "";
  for (let g = 0; g <= 3; g++) {
    const val = lo + (g / 3) * (hi - lo), gy = y(val);
    grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${gy}" y2="${gy}" stroke="#E6E4DE"/><text x="${W - P.r + 6}" y="${gy + 4}" font-size="11" fill="#8A9098">${Math.round(val * 10) / 10}</text>`;
  }
  const path = k => series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join("");
  const dots = series.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4" fill="${color}" stroke="#fff" stroke-width="2"/>`).join("");
  const last = series[series.length - 1];
  const p2 = series.every(p => typeof p.v2 === "number") ? `<path d="${path("v2")}" fill="none" stroke="${color}" stroke-opacity=".45" stroke-width="2" stroke-dasharray="5 4"/>` : "";
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || "Grafic")}">${grid}${p2}
    <path d="${path("v")}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}
    <text x="${x(series.length - 1).toFixed(1)}" y="${(y(last.v) - 10).toFixed(1)}" font-size="13" font-weight="700" fill="#17191C" text-anchor="middle">${fmtW(last.v)}${opts.unit || ""}</text>
    <text x="${P.l}" y="${H - 6}" font-size="11" fill="#8A9098">${fmtDate(series[0].date)}</text>
    <text x="${W - P.r}" y="${H - 6}" font-size="11" fill="#8A9098" text-anchor="end">${fmtDate(last.date)}</text></svg>`;
  const tip = el("div", "chart-tip"); wrap.appendChild(tip);
  wrap.addEventListener("pointerdown", e => {
    const r = wrap.querySelector("svg").getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width * W;
    let bi = 0, bd = 1e9;
    series.forEach((p, i) => { const d = Math.abs(x(i) - px); if (d < bd) { bd = d; bi = i; } });
    const p = series[bi];
    tip.textContent = `${fmtDate(p.date)}: ${fmtW(p.v)}${opts.unit || ""}${typeof p.v2 === "number" ? ` · ${opts.label2 || ""} ${fmtW(p.v2)}` : ""}${p.extra ? " · " + p.extra : ""}`;
    tip.style.left = (x(bi) / W * 100) + "%"; tip.style.top = (y(p.v) / H * 100) + "%"; tip.style.opacity = 1;
    clearTimeout(tip._t); tip._t = setTimeout(() => (tip.style.opacity = 0), 2200);
  });
  return wrap;
}
