/* Teste pentru motorul v2, fără browser: node --test v2/tests/engine.test.js
   Încarcă data.js, videos.js și engine.js ca scripturi globale, ca în pagină. Valorile sunt fictive. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("vm");
const fs = require("fs");
const path = require("path");

const load = f => vm.runInThisContext(fs.readFileSync(path.join(__dirname, "..", f), "utf8"), { filename: f });
load("data.js"); load("videos.js"); load("engine.js");
const J2 = vm.runInThisContext("J2");
const DAYS = vm.runInThisContext("DAYS"), EX = vm.runInThisContext("EX");
const VIDEO = vm.runInThisContext("VIDEO"), SUBS = vm.runInThisContext("SUBS");
const WARMUP_GENERAL = vm.runInThisContext("WARMUP_GENERAL"), WARMUP_UPPER = vm.runInThisContext("WARMUP_UPPER"), WARMUP_LOWER = vm.runInThisContext("WARMUP_LOWER");
const COOLDOWN = vm.runInThisContext("COOLDOWN"), MOBILITY = vm.runInThisContext("MOBILITY");

const memStorage = () => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; };
const fresh = () => { const s = memStorage(); J2.setStorage(s); return s; };
const TODAY = "2026-11-23"; // luni
const settingsFor = week => ({ ...J2.DEFAULT_SETTINGS, blockStart: J2.addDays(TODAY, -7 * (week - 1)) });

function fillAll(draft, w, r, rpe) {
  for (const sets of Object.values(draft.entries)) for (const s of sets) { s.w = w; s.r = r; s.rpe = rpe; s.done = true; }
}

test("datele: fiecare exercițiu are indicații, siguranță, grupă și clip; înlocuitorii există", () => {
  for (const [id, ex] of Object.entries(EX)) {
    assert.ok(ex.cues.length >= 3, id + " cues");
    assert.ok(ex.safety, id + " safety");
    assert.ok(ex.grp.length, id + " grp");
    assert.ok(VIDEO[ex.video], id + " video " + ex.video);
  }
  for (const [id, list] of Object.entries(SUBS)) { assert.ok(EX[id], id); for (const s of list) assert.ok(EX[s], id + " → " + s); }
  for (const d of ["upperA", "lowerA", "upperB", "lowerB"]) for (const p of DAYS[d].plan) assert.ok(EX[p.ex], d + " " + p.ex);
  for (const p of DAYS.intervals.core) assert.ok(EX[p.ex]);
  for (const it of [...WARMUP_GENERAL, ...WARMUP_UPPER, ...WARMUP_LOWER, ...COOLDOWN, ...MOBILITY]) if (it.video) assert.ok(VIDEO[it.video], it.id + " video " + it.video);
  for (const [k, v] of Object.entries(VIDEO)) { assert.match(v.id, /^[\w-]{11}$/, k); if (v.end) assert.ok(v.end > (v.start || 0), k + " end"); }
});

test("seriile planificate pe zi se potrivesc cu programul", () => {
  const n = d => DAYS[d].plan.reduce((a, p) => a + p.sets, 0);
  assert.equal(n("upperA"), 18); assert.equal(n("lowerA"), 20); assert.equal(n("upperB"), 17); assert.equal(n("lowerB"), 22);
});

test("zonele de puls (Karvonen) cu valorile implicite", () => {
  const z = J2.zones(J2.DEFAULT_SETTINGS);
  assert.deepEqual(z.z2, [125, 137]);
  assert.deepEqual(z.int, [147, 159]);
});

test("blocul și fazele", () => {
  const s = settingsFor(1);
  assert.equal(J2.blockWeek(TODAY, s), 1);
  assert.equal(J2.blockWeek(J2.addDays(TODAY, 7 * 11), s), 12);
  assert.equal(J2.blockWeek(J2.addDays(TODAY, 84), s), 1);
  assert.equal(J2.blockNumber(J2.addDays(TODAY, 84), s), 2);
  assert.equal(J2.phase(1).compoundMinus, 1); assert.equal(J2.phase(5).rpe, "8"); assert.equal(J2.phase(10).rpe, "8–9"); assert.ok(J2.phase(12).deload);
});

test("Upper A, săptămâna 1: ciornă, serii −1 la compuse, finalizare, progresie în sus", () => {
  fresh();
  const s = settingsFor(1);
  const d = J2.newDraft("upperA", TODAY, s, [], {});
  assert.equal(Object.keys(d.entries).length, 7);
  assert.equal(d.entries["inc-db-press"].length, 2); // 3 − 1 la compus
  assert.equal(d.entries["cable-lat-raise-1"].length, 2);
  fillAll(d, 20, 10, 8); // la capătul de sus pentru presa înclinată (6–10)
  const logs = [];
  const { entry, prs } = J2.finish(d, logs);
  assert.equal(logs.length, 1); assert.equal(entry.sets, 14); assert.ok(entry.tonnage > 0); assert.ok(prs.includes("inc-db-press"));
  const sug = J2.suggest("inc-db-press", DAYS.upperA.plan[0], logs, J2.phase(1));
  assert.equal(sug.dir, "up"); assert.equal(sug.w, 22); // +2,5 % e sub increment → cel puțin +2 kg
  const sug2 = J2.suggest("cs-row-neutral", DAYS.upperA.plan[1], logs, J2.phase(1));
  assert.equal(sug2.dir, "same"); // interval 8–12, făcute 10 → aceeași greutate, țintă 11
  assert.equal(sug2.r, 11);
});

test("Lower A: o serie sub capătul de jos → −5 %; seriile de acomodare", () => {
  fresh();
  const s = settingsFor(5);
  const d = J2.newDraft("lowerA", TODAY, s, [], {});
  assert.equal(d.entries["leg-press-high"].length, 3);
  fillAll(d, 100, 10, 8);
  d.entries["leg-press-high"][2].r = 6; // sub 8
  const logs = []; J2.finish(d, logs);
  const sug = J2.suggest("leg-press-high", DAYS.lowerA.plan[0], logs, J2.phase(5));
  assert.equal(sug.dir, "down"); assert.equal(sug.w, 95);
  const acc = J2.accom(95, 5);
  assert.deepEqual(acc.map(a => a.w), [50, 65, 80]);
  assert.deepEqual(acc.map(a => a.r), [8, 5, 2]);
});

test("deload: jumătate din serii, −30 %, iar după deload se pornește de la ultima ședință normală", () => {
  fresh();
  const logs = [];
  const d1 = J2.newDraft("upperA", TODAY, settingsFor(8), logs, {});
  fillAll(d1, 40, 12, 8); J2.finish(d1, logs);
  const d2 = J2.newDraft("upperA", TODAY, settingsFor(12), logs, {});
  assert.ok(d2.deload);
  assert.equal(d2.entries["inc-db-press"].length, 2); // ceil(3/2)
  assert.equal(d2.entries["face-pull"].length, 1);    // ceil(2/2)
  const sug = J2.suggest("cs-row-neutral", DAYS.upperA.plan[1], logs, J2.phase(12));
  assert.equal(sug.dir, "deload"); assert.equal(sug.w, 27.5); // 40 × 0,7 = 28 → 27,5 la increment de 2,5
  fillAll(d2, 27.5, 8, 6); J2.finish(d2, logs);
  const sug1 = J2.suggest("cs-row-neutral", DAYS.upperA.plan[1], logs, J2.phase(1));
  assert.equal(sug1.dir, "up"); assert.equal(sug1.w, 42.5); // de la 40, deload-ul e sărit
});

test("zonă 2 și intervale: ciornă, finalizare, minute pe săptămână", () => {
  fresh();
  const logs = [];
  const z = J2.newDraft("cardioZ2", TODAY, settingsFor(2), logs, {});
  assert.ok(z.cardio); z.cardio.min = 50; z.cardio.zoneMin = 45; z.cardio.kind = "bicicleta";
  assert.ok(J2.hasProgress(z)); J2.finish(z, logs);
  const i = J2.newDraft("intervals", J2.addDays(TODAY, 5), settingsFor(2), logs, {});
  assert.equal(Object.keys(i.entries).length, 4);
  i.cardio.min = 38; i.cardio.zoneMin = 16; i.cardio.rounds = 4;
  for (const s of i.entries["bird-dog"]) { s.r = 8; s.done = true; }
  J2.finish(i, logs);
  const c = J2.weeklyCardio(logs, J2.mondayOf(TODAY));
  assert.equal(c.zone, 61); assert.equal(c.total, 88);
  const ws = J2.weeklySets(logs, J2.mondayOf(TODAY));
  assert.equal(ws.trunchi, 2);
});

test("durere ≥ 4: înlocuirea în ciornă și preferința salvată", () => {
  fresh();
  const d = J2.newDraft("lowerA", TODAY, settingsFor(5), [], {});
  J2.swapInDraft(d, "leg-press-high", "hip-thrust", [], settingsFor(5));
  assert.ok(d.entries["hip-thrust"]); assert.equal(d.subsUsed["leg-press-high"], "hip-thrust"); assert.ok(d.pain["leg-press-high"] >= 4);
  const plan = J2.effectivePlan("lowerA", { "leg-press-high": "hip-thrust" });
  assert.equal(plan[0].ex, "hip-thrust"); assert.equal(plan[0].orig, "leg-press-high");
  const d2 = J2.newDraft("lowerA", TODAY, settingsFor(5), [], { "leg-press-high": "hip-thrust" });
  assert.ok(d2.entries["hip-thrust"]); assert.ok(!d2.entries["leg-press-high"]);
});

test("programul: ședința sărită se decalează; ziua de start mută maparea", () => {
  fresh();
  assert.equal(J2.nextDayId(J2.store.sched()), "upperA");
  J2.advanceCursor("upperA"); assert.equal(J2.nextDayId(J2.store.sched()), "lowerA");
  J2.advanceCursor("rest"); assert.equal(J2.nextDayId(J2.store.sched()), "upperA");
  J2.setCursor("upperB"); assert.equal(J2.nextDayId(J2.store.sched()), "upperB");
  assert.equal(J2.planDay(0, { startDay: 0 }), "upperA");
  assert.equal(J2.planDay(0, { startDay: 1 }), "rest");
  assert.equal(J2.planDay(1, { startDay: 1 }), "upperA");
});

test("export și import complet", () => {
  fresh();
  const logs = [];
  const d = J2.newDraft("upperB", TODAY, settingsFor(3), logs, {}); fillAll(d, 30, 10, 8); J2.finish(d, logs);
  J2.store.saveLogs(logs); J2.store.saveSettings(settingsFor(3)); J2.logTalie(TODAY, 90); J2.logDaily(TODAY, { kg: 75, proteina: true });
  const exp = JSON.parse(JSON.stringify(J2.exportAll()));
  assert.equal(exp.app, "jacked2"); assert.equal(exp.logs.length, 1);
  fresh();
  assert.equal(J2.importAll(exp), 1);
  assert.deepEqual(J2.store.logs(), logs);
  assert.equal(J2.store.body().talie[0].cm, 90);
  assert.equal(J2.store.settings().blockStart, settingsFor(3).blockStart);
  assert.throws(() => J2.importAll({ app: "altceva" }));
});

test("importul din v1: exercițiile comune, fără dubluri", () => {
  fresh();
  const v1 = [
    { id: 1, date: "2026-11-07", dayId: "push", entries: { "incline-db-press": [{ w: 24, r: 10, done: true }, { w: 24, r: 9, done: true }], "chest-fly": [{ w: 30, r: 12, done: true }] } },
    { id: 2, date: "2026-11-09", dayId: "legs", entries: { "leg-press": [{ w: 120, r: 8, done: true }], "db-rdl": [{ w: 30, r: 10, done: false }] } }
  ];
  const logs = [];
  const r = J2.importV1(v1, logs);
  assert.equal(r.added, 2); assert.equal(r.mapped, 2);
  assert.ok(logs[0].entries["inc-db-press"]); assert.ok(!logs[0].entries["chest-fly"]);
  assert.ok(logs[1].entries["leg-press-high"]); assert.ok(!logs[1].entries["db-rdl"]);
  const r2 = J2.importV1(v1, logs);
  assert.equal(r2.added, 0);
  const sug = J2.suggest("inc-db-press", DAYS.upperA.plan[0], logs, J2.phase(1));
  assert.equal(sug.w, 24); assert.equal(sug.dir, "same");
});

test("e1RM Epley și seria pe exercițiu", () => {
  assert.equal(Math.round(J2.e1rm(100, 10)), 133);
  assert.equal(J2.e1rm(100, 1), 100);
  const logs = [{ date: "2026-11-10", entries: { "hip-thrust": [{ w: 80, r: 10, done: true }, { w: 80, r: 8, done: true }] } }];
  const s = J2.seriesForEx(logs, "hip-thrust");
  assert.equal(s.length, 1); assert.equal(s[0].maxW, 80); assert.equal(s[0].r, 10);
});

test("talia: memento la 14 zile", () => {
  fresh();
  assert.ok(J2.talieDue(J2.store.body(), J2.DEFAULT_SETTINGS, TODAY).due);
  J2.logTalie("2026-11-10", 90);
  assert.equal(J2.talieDue(J2.store.body(), J2.DEFAULT_SETTINGS, TODAY).due, false);
  assert.equal(J2.talieDue(J2.store.body(), J2.DEFAULT_SETTINGS, "2026-11-24").due, true);
});
