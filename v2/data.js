/* JACKED v2 — programul „Recomp 4+2”: date statice (program, exerciții, încălzire, răcire,
   mobilitate, tabel de înlocuire). Indicațiile tehnice sunt text original, scris pentru aplicație.
   Etichetele de siguranță sunt generice („priză neutră”, „variantă prietenoasă cu genunchiul”). */
"use strict";

/* ===== Săptămâna ===== */
const WEEK = ["upperA", "lowerA", "cardioZ2", "upperB", "lowerB", "intervals", "rest"];
const ZILE = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const ZILE_SCURT = ["L", "Ma", "Mi", "J", "V", "S", "D"];

/* Pauze (secunde) după tipul exercițiului */
const REST = { compound: 150, iso: 75, core: 45 };

/* ===== Zilele ===== */
const DAYS = {
  upperA: {
    id: "upperA", name: "Upper A", sub: "Împins-dominant", kind: "forta", color: "#C43A2F",
    grad: "linear-gradient(150deg,#D94A3F,#96231C)", warm: "upper",
    plan: [
      { ex: "inc-db-press", sets: 3, repLow: 6, repHigh: 10 },
      { ex: "cs-row-neutral", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "db-shoulder-press-neutral", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "pulldown-neutral", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "cable-lat-raise-1", sets: 2, repLow: 12, repHigh: 15 },
      { ex: "triceps-rope-pushdown", sets: 2, repLow: 10, repHigh: 15 },
      { ex: "face-pull", sets: 2, repLow: 15, repHigh: 20 }
    ]
  },
  lowerA: {
    id: "lowerA", name: "Lower A", sub: "Cvadriceps · prietenos cu genunchiul", kind: "forta", color: "#2456A6",
    grad: "linear-gradient(150deg,#3A6FC8,#1C3F82)", warm: "lower",
    plan: [
      { ex: "leg-press-high", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "db-rdl", sets: 3, repLow: 8, repHigh: 10 },
      { ex: "leg-curl-seated", sets: 3, repLow: 10, repHigh: 15 },
      { ex: "step-up-low", sets: 2, repLow: 10, repHigh: 10 },
      { ex: "calf-standing", sets: 3, repLow: 10, repHigh: 15 },
      { ex: "hip-abduction", sets: 2, repLow: 15, repHigh: 15 },
      { ex: "pallof-press", sets: 2, repLow: 12, repHigh: 12 },
      { ex: "dead-bug", sets: 2, repLow: 10, repHigh: 10 }
    ]
  },
  cardioZ2: {
    id: "cardioZ2", name: "Zonă 2", sub: "Cardio 45–60 min · mobilitate · kineto", kind: "cardio", color: "#B5651D",
    grad: "linear-gradient(150deg,#D27A2C,#8A4512)"
  },
  upperB: {
    id: "upperB", name: "Upper B", sub: "Tras-dominant", kind: "forta", color: "#1E7A46",
    grad: "linear-gradient(150deg,#2FA265,#176B3E)", warm: "upper",
    plan: [
      { ex: "pullup-neutral", sets: 3, repLow: 6, repHigh: 10 },
      { ex: "machine-chest-press", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "cable-row-1arm", sets: 3, repLow: 10, repHigh: 12 },
      { ex: "db-bench-neutral", sets: 2, repLow: 8, repHigh: 12 },
      { ex: "rear-delt-fly", sets: 2, repLow: 12, repHigh: 15 },
      { ex: "hammer-curl", sets: 2, repLow: 10, repHigh: 12 },
      { ex: "triceps-overhead-rope", sets: 2, repLow: 10, repHigh: 15 }
    ]
  },
  lowerB: {
    id: "lowerB", name: "Lower B", sub: "Șold și femurali", kind: "forta", color: "#5B3FA6",
    grad: "linear-gradient(150deg,#7355C9,#3E2A7A)", warm: "lower",
    plan: [
      { ex: "hip-thrust", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "hack-squat", sets: 3, repLow: 8, repHigh: 12 },
      { ex: "leg-curl-lying", sets: 3, repLow: 10, repHigh: 15 },
      { ex: "leg-ext-partial", sets: 2, repLow: 12, repHigh: 15 },
      { ex: "split-squat", sets: 2, repLow: 8, repHigh: 10 },
      { ex: "calf-seated", sets: 3, repLow: 12, repHigh: 15 },
      { ex: "plank-weighted", sets: 3, repLow: 30, repHigh: 45 },
      { ex: "suitcase-carry", sets: 3, repLow: 30, repHigh: 30 }
    ]
  },
  intervals: {
    id: "intervals", name: "Intervale 4×4", sub: "Cardio intens · trunchi", kind: "intervale", color: "#A3321F",
    grad: "linear-gradient(150deg,#C9452E,#7A2114)",
    core: [
      { ex: "bird-dog", sets: 2, repLow: 8, repHigh: 8 },
      { ex: "side-plank", sets: 2, repLow: 30, repHigh: 30 },
      { ex: "pallof-press", sets: 2, repLow: 12, repHigh: 12 },
      { ex: "farmer-carry", sets: 3, repLow: 30, repHigh: 30 }
    ]
  },
  rest: {
    id: "rest", name: "Odihnă activă", sub: "Plimbare 45–60 min · mobilitate opțional", kind: "odihna", color: "#5B6067",
    grad: "linear-gradient(150deg,#737982,#3F444B)"
  }
};

/* Secvențierul intervalelor 4×4: faze în secunde */
const INTERVAL_PLAN = [
  { f: "incalzire", t: 480, label: "Încălzire progresivă" },
  { f: "lucru", t: 240, label: "Interval 1" }, { f: "usor", t: 180, label: "Ușor" },
  { f: "lucru", t: 240, label: "Interval 2" }, { f: "usor", t: 180, label: "Ușor" },
  { f: "lucru", t: 240, label: "Interval 3" }, { f: "usor", t: 180, label: "Ușor" },
  { f: "lucru", t: 240, label: "Interval 4" },
  { f: "racire", t: 300, label: "Răcire" }
];

/* ===== Grupe musculare, pentru numărarea seriilor pe săptămână ===== */
const GRUPE = {
  piept: "Piept", spate: "Spate", umeri: "Umeri", triceps: "Triceps", biceps: "Biceps",
  cvadriceps: "Cvadriceps", femurali: "Femurali", fesieri: "Fesieri", gambe: "Gambe", trunchi: "Trunchi"
};

/* ===== Exercițiile =====
   unit: rep (greutate × repetări), s (greutate × secunde), m (greutate × metri)
   inc: cel mai mic increment de greutate (kg); compound: pauză lungă; core: pauză 45 s; perSide: pe fiecare parte */
const EX = {
  /* ---- Upper A ---- */
  "inc-db-press": {
    name: "Presă cu gantere pe bancă înclinată 30°", grp: ["piept"], compound: true, inc: 2, video: "inc-db-press",
    cues: [
      "Banca la ~30°: pieptul superior lucrează, umerii rămân protejați. Mai sus de atât devine presă de umeri.",
      "Omoplații trași înapoi și în jos pe bancă, înainte de prima repetare, și ținuți așa tot setul.",
      "Coboară ganterele 2–3 s, coatele la ~45° față de trunchi, până simți întinderea în piept. Fără săritură din întindere.",
      "Împinge în sus și ușor spre interior, fără să lovești ganterele între ele. Expiră pe împins.",
      "Tălpile fixe pe podea, fesele pe bancă, lombarul cu arc natural, nu forțat."
    ],
    safety: "Încheietura dreaptă, deasupra cotului. Palmele ușor spre interior, dacă așa stă încheietura mai relaxat.",
    subs: ["machine-chest-press", "db-bench-neutral"]
  },
  "cs-row-neutral": {
    name: "Ramat la aparat cu pieptul sprijinit, priză neutră", grp: ["spate"], compound: true, inc: 2.5, video: "cs-row-neutral",
    cues: [
      "Pieptul lipit de pernă pe tot parcursul setului; trunchiul nu mai are de ce să compenseze.",
      "Pornește cu brațele complet întinse și omoplații lăsați înainte: întinderea e jumătate din exercițiu.",
      "Trage coatele spre șolduri, nu spre urechi. La capăt strânge omoplații 1 s.",
      "Revino lent, 2–3 s, până omoplații alunecă din nou înainte.",
      "Gâtul neutru, privirea spre pernă, nu în sus."
    ],
    safety: "Priză neutră, încheietura dreaptă. La seturile grele, curele, ca priza să nu fie limita.",
    subs: ["cable-row-1arm"]
  },
  "db-shoulder-press-neutral": {
    name: "Presă umeri șezând cu gantere, priză neutră", grp: ["umeri", "triceps"], compound: true, inc: 2, video: "db-shoulder-press-neutral",
    cues: [
      "Spătarul aproape vertical (80–85°), spatele lipit, tălpile fixe.",
      "Palmele față în față, ganterele pornesc de la nivelul urechilor, coatele ușor în fața trunchiului.",
      "Împinge în sus pe o linie ușor spre interior; sus, brațele aproape întinse, fără blocaj brusc.",
      "Coboară controlat până coatele ajung puțin sub linia umerilor. Nu mai jos, dacă umărul protestează.",
      "Coastele jos, abdomenul contractat: dacă lombarul se arcuiește, greutatea e prea mare."
    ],
    safety: "Priză neutră, nimic în spatele capului, gât neutru. Dacă umărul se simte încărcat, treci la varianta de înlocuire.",
    subs: ["landmine-press", "machine-shoulder-press-neutral"]
  },
  "pulldown-neutral": {
    name: "Tracțiuni la helcometru, priză neutră", grp: ["spate", "biceps"], compound: true, inc: 2.5, video: "pulldown-neutral",
    cues: [
      "Mâner V sau mânere paralele, coapsele fixate sub pernă, trunchiul ușor înclinat pe spate (10–15°).",
      "Pornește din întindere completă, umerii lăsați în sus, apoi coboară întâi omoplații și abia apoi trage cu brațele.",
      "Coatele spre podea și spre coaste; mânerul ajunge în partea de sus a pieptului.",
      "Urcă lent, 2–3 s, până brațele sunt din nou întinse. Fără balans din trunchi.",
      "Pieptul deschis pe tot parcursul, gâtul neutru, fără să întinzi bărbia spre mâner."
    ],
    safety: "Priză neutră. Curele dacă antebrațele obosesc înaintea spatelui.",
    subs: ["pullup-neutral"]
  },
  "cable-lat-raise-1": {
    name: "Fluturări laterale la cablu, un braț", grp: ["umeri"], inc: 1, video: "cable-lat-raise-1", perSide: true,
    cues: [
      "Scripetele jos, stai lateral față de aparat, mânerul în mâna de pe partea opusă, cablul trece prin fața corpului.",
      "Cealaltă mână pe cadru, trunchiul vertical sau cu o înclinare mică departe de aparat.",
      "Ridică brațul până la orizontală, cotul ușor îndoit, condus de cot, nu de mână.",
      "Coboară 2–3 s, lăsând cablul să te întindă în jos, fără să lași umărul să urce spre ureche.",
      "Greutate mică: dacă trunchiul se leagănă, scazi."
    ],
    safety: "Mânerul ținut relaxat, încheietura dreaptă, fără să ridici dosul palmei.",
    subs: ["db-lateral-raise"]
  },
  "triceps-rope-pushdown": {
    name: "Extensii triceps la cablu cu frânghie", grp: ["triceps"], inc: 2.5, video: "triceps-rope-pushdown",
    cues: [
      "Scripetele sus, stai cu un pas în spate, trunchi ușor înclinat înainte, coatele lipite de coaste.",
      "Doar antebrațele se mișcă; brațele stau fixe pe tot setul.",
      "Jos, întinde complet și desparte capetele frânghiei spre exterior, palmele spre coapse.",
      "Urcă 2–3 s până antebrațele trec puțin de orizontală. Fără să ridici coatele.",
      "Umerii jos, gât neutru, fără să împingi cu greutatea corpului."
    ],
    safety: "Frânghie, nu bară: palmele față în față țin încheietura dreaptă.",
    subs: ["triceps-overhead-rope"]
  },
  "face-pull": {
    name: "Face pull la cablu", grp: ["umeri", "spate"], inc: 2.5, video: "face-pull",
    cues: [
      "Frânghia la nivelul feței sau puțin mai sus; priză cu degetele mari spre tine.",
      "Un pas înapoi, un picior în față pentru echilibru, brațele întinse înainte cu tensiune în cablu.",
      "Trage spre față, coatele sus și în lateral, până mâinile ajung lângă urechi. La capăt, rotește antebrațele în sus.",
      "Omoplații strânși și jos 1 s, apoi revino lent.",
      "Greutate mică, repetări multe: e un exercițiu de sănătate a umărului, nu de forță."
    ],
    safety: "Dacă frânghia obosește încheietura, mânere individuale (D-handle) sau bandă.",
    subs: ["face-pull-dhandle"]
  },

  /* ---- Lower A ---- */
  "leg-press-high": {
    name: "Presă de picioare, tălpile sus pe platformă", grp: ["fesieri", "femurali", "cvadriceps"], compound: true, inc: 5, video: "leg-press-high",
    cues: [
      "Tălpile în partea de sus a platformei, lățimea șoldurilor, vârfurile ușor spre exterior.",
      "Coboară 2–3 s până unde șoldul rămâne pe pernă și genunchiul nu protestează. Nu mai adânc.",
      "Împinge prin călcâie și mijlocul tălpii, genunchii pe linia vârfurilor, fără să-i lași spre interior.",
      "Sus, oprește-te înainte de blocarea genunchilor.",
      "Lombarul pe pernă pe tot parcursul; dacă bazinul se rulează, ai coborât prea mult."
    ],
    safety: "Variantă prietenoasă cu genunchiul: amplitudine fără durere, nu amplitudine maximă.",
    subs: ["hip-thrust", "glute-bridge-weighted"]
  },
  "db-rdl": {
    name: "Romanian deadlift cu gantere", grp: ["femurali", "fesieri"], compound: true, inc: 2, video: "db-rdl",
    cues: [
      "Picioarele la lățimea șoldurilor, genunchii ușor îndoiți și fixați la unghiul acela tot setul.",
      "Împinge șoldurile înapoi, spatele drept, ganterele alunecă pe coapse până sub genunchi sau unde se oprește întinderea femuralilor.",
      "Nu urmări podeaua: cobori atât cât spatele rămâne drept.",
      "Urcă strângând fesele și împingând șoldul înainte; sus stai drept, fără să te apleci pe spate.",
      "Respirație normală, abdomenul contractat moderat; fără apnee forțată."
    ],
    safety: "Încărcare moderată, fără maxime. Curele la seturile grele. Trap-bar e varianta echivalentă.",
    subs: ["back-ext-45", "hip-thrust"]
  },
  "leg-curl-seated": {
    name: "Flexii femurali șezând", grp: ["femurali"], inc: 2.5, video: "leg-curl-seated",
    cues: [
      "Axul aparatului la nivelul genunchiului, perna de coapse strânsă, perna de gleznă chiar deasupra călcâielor.",
      "Trage călcâiele sub scaun, cât de complet poți, și ține 1 s.",
      "Revino 2–3 s, fără să lași greutatea să cadă; oprește-te chiar înainte de întinderea completă.",
      "Șoldul rămâne pe scaun; dacă se ridică, greutatea e prea mare.",
      "Mâinile pe mânere, trunchiul relaxat."
    ],
    safety: "Mișcare stabilă pentru genunchi: amplitudine fără durere.",
    subs: ["leg-curl-lying"]
  },
  "step-up-low": {
    name: "Step-up pe cutie joasă (20–30 cm)", grp: ["cvadriceps", "fesieri"], inc: 2, video: "step-up-low", perSide: true,
    cues: [
      "Cutie joasă, talpa întreagă pe ea, genunchiul pe linia vârfului.",
      "Urcă împingând prin talpa de pe cutie, nu sărind cu piciorul de jos. Trunchiul vertical.",
      "Coboară lent, 2–3 s, controlat, cu același picior. Asta e partea care contează.",
      "Gantere ușoare în mâini sau fără, până mișcarea e curată.",
      "Toate repetările pe un picior, apoi schimbi."
    ],
    safety: "Variantă prietenoasă cu genunchiul: cutia rămâne joasă; dacă apare durere, înlocuitorul e fandarea înapoi sau hip thrust.",
    subs: ["reverse-lunge", "hip-thrust", "leg-curl-seated"]
  },
  "calf-standing": {
    name: "Ridicări pe vârfuri în picioare", grp: ["gambe"], inc: 5, video: "calf-standing",
    cues: [
      "Vârfurile pe margine, călcâiele libere, genunchii aproape întinși.",
      "Coboară lent în întindere completă, 2 s jos.",
      "Urcă pe vârfuri cât de sus poți și ține 1 s. Fără arcuiri.",
      "Repetări lente, controlate; dacă sari, scazi greutatea.",
      "Mâinile pe mânere doar pentru echilibru."
    ],
    safety: "Umerii sub pernă doar dacă gâtul rămâne relaxat; altfel varianta la presă sau la aparatul șezând.",
    subs: ["calf-seated"]
  },
  "hip-abduction": {
    name: "Abductori la aparat", grp: ["fesieri"], inc: 2.5, video: "hip-abduction",
    cues: [
      "Spatele pe spătar, pernele pe exteriorul genunchilor, mâinile pe mânere.",
      "Deschide genunchii controlat, 1 s ținut la capăt.",
      "Revino 2–3 s, fără să lași greutatea să se lovească.",
      "Trunchiul nemișcat; fără balans ca să miști plăci în plus.",
      "O înclinare ușoară înainte mută accentul pe fesierul mijlociu; e opțională."
    ],
    safety: "Mișcare stabilă pentru genunchi și șold; amplitudine confortabilă.",
    subs: ["monster-walk-set"]
  },
  "pallof-press": {
    name: "Pallof press la cablu", grp: ["trunchi"], core: true, inc: 2.5, video: "pallof-press", perSide: true,
    cues: [
      "Cablul la nivelul pieptului, stai lateral față de aparat, picioarele la lățimea umerilor, genunchii ușor îndoiți.",
      "Mânerul la piept cu ambele mâini; abdomenul contractat ca pentru un pumn.",
      "Întinde brațele în față, lent, fără ca trunchiul să se rotească spre aparat. Ține 2 s.",
      "Revino la piept controlat. Respiri normal tot timpul.",
      "Toate repetările pe o parte, apoi te întorci."
    ],
    safety: "Anti-rotație, fără flexie lombară încărcată.",
    subs: ["side-plank"]
  },
  "dead-bug": {
    name: "Dead bug", grp: ["trunchi"], core: true, inc: 0, video: "dead-bug", unit: "rep", bodyweight: true,
    cues: [
      "Culcat pe spate, șoldurile și genunchii la 90°, brațele întinse spre tavan, lombarul lipit de podea.",
      "Expiră și întinde lent un picior spre podea și brațul opus peste cap, fără ca lombarul să se dezlipească.",
      "Revino, apoi cealaltă pereche. O repetare = ambele părți.",
      "Capul pe podea, gâtul relaxat.",
      "Dacă lombarul se arcuiește, scurtează amplitudinea: contează controlul, nu cât de jos ajungi."
    ],
    safety: "Trunchiul se lucrează anti-extensie, nu prin flexii încărcate.",
    subs: ["bird-dog"]
  },

  /* ---- Upper B ---- */
  "pullup-neutral": {
    name: "Tracțiuni la bară, priză neutră", grp: ["spate", "biceps"], compound: true, inc: 2.5, video: "pullup-neutral", bodyweight: true,
    cues: [
      "Mânere paralele, palmele față în față, brațele complet întinse la start.",
      "Întâi coboară omoplații, apoi trage cu coatele spre coaste; bărbia trece de bară fără să întinzi gâtul.",
      "Coboară 2–3 s până la întindere completă, fără să te lași să cazi.",
      "Picioarele liniștite, fără kipping.",
      "Dacă nu ies 6 curate, folosește aparatul asistat și notează asistența ca greutate negativă."
    ],
    safety: "Priză neutră și curele la nevoie. Alternativă echivalentă: helcometru cu priză largă.",
    subs: ["pulldown-wide", "pulldown-neutral"]
  },
  "machine-chest-press": {
    name: "Presă piept la aparat", grp: ["piept", "triceps"], compound: true, inc: 2.5, video: "machine-chest-press",
    cues: [
      "Scaunul reglat ca mânerele să fie la mijlocul pieptului, spatele lipit de spătar.",
      "Omoplații trași înapoi și jos înainte de prima repetare.",
      "Împinge până brațele sunt aproape întinse, fără blocaj.",
      "Revino 2–3 s până simți întinderea în piept; nu lăsa plăcile să se atingă.",
      "Capul pe spătar, gâtul neutru."
    ],
    safety: "Mânere neutre dacă aparatul le are; încheietura dreaptă.",
    subs: ["db-bench-neutral", "inc-db-press"]
  },
  "cable-row-1arm": {
    name: "Ramat cu un braț la cablu", grp: ["spate"], compound: true, inc: 2.5, video: "cable-row-1arm", perSide: true,
    cues: [
      "Cablul la nivelul stomacului, mâna liberă sprijinită pe cadru sau pe genunchi.",
      "Lasă umărul să meargă înainte la start, pentru întindere completă.",
      "Trage cotul pe lângă corp spre șold, fără să rotești trunchiul.",
      "1 s ținut la capăt, apoi revino lent.",
      "Pieptul deschis, gâtul neutru; toate repetările pe o parte, apoi schimbi."
    ],
    safety: "Priză neutră. Dacă trunchiul obosește sau se rotește, treci la ramat cu pieptul sprijinit.",
    subs: ["cs-row-neutral"]
  },
  "db-bench-neutral": {
    name: "Presă cu gantere pe bancă plată, priză neutră", grp: ["piept", "triceps"], compound: true, inc: 2, video: "db-bench-neutral",
    cues: [
      "Palmele față în față, ganterele deasupra pieptului, omoplații strânși pe bancă.",
      "Coboară 2–3 s pe lângă piept, coatele apropiate de trunchi.",
      "Împinge până brațele sunt aproape întinse.",
      "Tălpile fixe, fesele pe bancă.",
      "Întinderea jos e moderată, fără să forțezi umărul."
    ],
    safety: "Priză neutră, încheietura dreaptă deasupra cotului.",
    subs: ["machine-chest-press"]
  },
  "rear-delt-fly": {
    name: "Fluturări posterioare (rear delt)", grp: ["umeri", "spate"], inc: 2.5, video: "rear-delt-fly",
    cues: [
      "La aparat: pieptul pe pernă, mânerele la nivelul umerilor. Cu gantere: pieptul pe bancă înclinată.",
      "Brațele aproape întinse, cotul ușor îndoit și fix; condu mișcarea din cot, spre spate.",
      "La capăt, 1 s cu omoplații strânși, apoi revino lent.",
      "Greutate mică: dacă ridici umerii spre urechi, scazi.",
      "Gâtul neutru, privirea în jos."
    ],
    safety: "Mânere neutre dacă aparatul le are; priză relaxată.",
    subs: ["face-pull"]
  },
  "hammer-curl": {
    name: "Flexii biceps „ciocan” cu gantere", grp: ["biceps"], inc: 1, video: "hammer-curl",
    cues: [
      "Palmele față în față, coatele lângă corp, ușor în fața șoldului.",
      "Urcă fără avânt, cotul rămâne pe loc.",
      "Coboară 2–3 s până la întinderea completă.",
      "Alternativ sau simultan, cum preferi; trunchiul nu se leagănă.",
      "Încheietura dreaptă pe tot parcursul."
    ],
    safety: "Priză neutră. Începe ușor dacă antebrațul protestează.",
    subs: ["cable-hammer-curl"]
  },
  "triceps-overhead-rope": {
    name: "Extensii triceps deasupra capului, cablu cu frânghie", grp: ["triceps"], inc: 2.5, video: "triceps-overhead-rope",
    cues: [
      "Scripetele jos, cu spatele la aparat, un picior în față, trunchiul ușor înclinat înainte.",
      "Frânghia deasupra capului, coatele îndreptate înainte, aproape de urechi.",
      "Întinde brațele în față și în sus, 1 s la capăt.",
      "Revino 2–3 s până simți întinderea în triceps; coatele nu se deschid lateral.",
      "Coastele jos, fără să arcuiești lombarul."
    ],
    safety: "Mișcarea rămâne în fața capului, nu în spatele lui; frânghie, nu bară.",
    subs: ["triceps-rope-pushdown"]
  },

  /* ---- Lower B ---- */
  "hip-thrust": {
    name: "Hip thrust", grp: ["fesieri", "femurali"], compound: true, inc: 5, video: "hip-thrust",
    cues: [
      "Spatele de sus pe marginea băncii (sub omoplați), bara cu pad peste șold sau aparatul reglat.",
      "Tălpile la lățimea șoldurilor, astfel încât sus tibia să fie verticală.",
      "Împinge prin călcâie, sus șoldul în linie cu genunchii și umerii, bărbia în piept, coastele jos.",
      "1 s strâns sus, apoi coboară controlat, 2 s.",
      "Nu arcui lombarul sus: mișcarea vine din șold."
    ],
    safety: "Amplitudine fără durere; dacă bara deranjează, varianta la aparat sau glute bridge cu greutate.",
    subs: ["glute-bridge-weighted"]
  },
  "hack-squat": {
    name: "Hack squat", grp: ["cvadriceps", "fesieri"], compound: true, inc: 5, video: "hack-squat",
    cues: [
      "Spatele și capul pe spătar, umerii sub perne, tălpile la lățimea umerilor, puțin mai sus de mijlocul platformei.",
      "Coboară 2–3 s până unde genunchiul rămâne confortabil și călcâiele pe platformă.",
      "Împinge prin toată talpa, genunchii pe linia vârfurilor.",
      "Oprește-te înainte de blocarea genunchilor.",
      "Dacă lombarul se dezlipește jos, ai coborât prea mult."
    ],
    safety: "Variantă prietenoasă cu genunchiul: amplitudine fără durere. Alternativă echivalentă: presă cu tălpile jos sau goblet squat la cutie.",
    subs: ["leg-press-low", "goblet-box-squat"]
  },
  "leg-curl-lying": {
    name: "Flexii femurali culcat", grp: ["femurali"], inc: 2.5, video: "leg-curl-lying",
    cues: [
      "Perna chiar deasupra călcâielor, genunchii puțin în afara băncii, șoldul lipit de pernă.",
      "Trage călcâiele spre fese și ține 1 s.",
      "Coboară 2–3 s, oprindu-te chiar înainte de întinderea completă.",
      "Fesele contractate, șoldul nu se ridică.",
      "Mâinile pe mânere, capul relaxat."
    ],
    safety: "Mișcare stabilă pentru genunchi; amplitudine fără durere.",
    subs: ["leg-curl-seated"]
  },
  "leg-ext-partial": {
    name: "Extensii cvadriceps, amplitudine parțială", grp: ["cvadriceps"], inc: 2.5, video: "leg-ext-partial",
    cues: [
      "Axul aparatului la nivelul genunchiului, perna deasupra gleznelor, spatele pe spătar.",
      "Lucrează de la 90° până la ~30°: nu întinde complet, nu bloca.",
      "Urcă 1–2 s, ține 1 s, coboară 2–3 s.",
      "Greutate ușoară; e un exercițiu de control, nu de forță.",
      "Dacă apare durere, înlocuitorul e izometria la ~60°: 3 × 20 s."
    ],
    safety: "Variantă prietenoasă cu genunchiul: fără amplitudine completă sub încărcare.",
    subs: ["quad-iso-60", "spanish-squat"]
  },
  "split-squat": {
    name: "Split squat static", grp: ["cvadriceps", "fesieri"], inc: 2, video: "split-squat", perSide: true,
    cues: [
      "Pas scurt, trunchiul vertical, greutatea pe piciorul din față.",
      "Coboară drept în jos, 2–3 s, genunchiul din spate spre podea fără să o atingă.",
      "Genunchiul din față pe linia vârfului; dacă fuge spre interior, oprește-te mai sus.",
      "Urcă prin talpa din față. Gantere mici sau fără.",
      "Varianta cu piciorul din spate pe bancă (bulgarian) doar ușor, dacă genunchiul e liniștit."
    ],
    safety: "Variantă prietenoasă cu genunchiul: pas scurt, amplitudine fără durere.",
    subs: ["hip-thrust", "leg-curl-lying"]
  },
  "calf-seated": {
    name: "Ridicări pe vârfuri șezând", grp: ["gambe"], inc: 5, video: "calf-seated",
    cues: [
      "Perna pe coapse, chiar deasupra genunchilor; vârfurile pe margine.",
      "Coboară lent în întindere completă, 2 s jos.",
      "Urcă cât de sus poți și ține 1 s.",
      "Fără arcuiri; repetări lente.",
      "Genunchii la ~90° tot setul."
    ],
    safety: "Mișcare stabilă, fără încărcare pe gât sau lombar.",
    subs: ["calf-standing"]
  },
  "plank-weighted": {
    name: "Plank cu încărcare", grp: ["trunchi"], core: true, inc: 2.5, video: "plank-weighted", unit: "s",
    cues: [
      "Pe antebrațe, coatele sub umeri, corpul în linie dreaptă de la cap la călcâie.",
      "Discul pe partea de sus a spatelui, pus de cineva sau așezat cu grijă; fără greutate dacă ești singur și nu ajungi.",
      "Fesele strânse, abdomenul contractat, coastele jos; nu lăsa șoldul să cadă.",
      "Respiri normal; dacă îți ții respirația, timpul e prea lung.",
      "Privirea în podea, gâtul neutru."
    ],
    safety: "Trunchi anti-extensie; fără flexie lombară. Pe antebrațe, nu pe palme.",
    subs: ["dead-bug"]
  },
  "suitcase-carry": {
    name: "Suitcase carry", grp: ["trunchi"], core: true, inc: 2.5, video: "suitcase-carry", unit: "m", perSide: true,
    cues: [
      "O ganteră într-o mână, lângă coapsă, brațul întins.",
      "Umerii la același nivel, pieptul sus; corpul nu se înclină spre greutate.",
      "Pași scurți, ritm constant, privirea înainte.",
      "Distanța pe o parte, apoi schimbi mâna.",
      "Dacă umărul urcă spre ureche, greutatea e prea mare."
    ],
    safety: "Anti-înclinare laterală. Curea dacă priza obosește prima.",
    subs: ["plank-weighted"]
  },

  /* ---- Trunchi, sâmbătă ---- */
  "bird-dog": {
    name: "Bird-dog", grp: ["trunchi"], core: true, inc: 0, video: "bird-dog", bodyweight: true, perSide: true,
    cues: [
      "În patrupedie, mâinile sub umeri, genunchii sub șolduri, spatele neutru.",
      "Întinde lent brațul și piciorul opus, fără să te răsucești și fără să ridici piciorul peste linia șoldului.",
      "Ține 2–3 s, revino controlat.",
      "Gâtul neutru, privirea în podea.",
      "Un pahar imaginar pe lombar nu trebuie să cadă."
    ],
    safety: "Anti-extensie și anti-rotație, fără încărcare pe încheietură: dacă palma plată deranjează, pumnii sau mânere.",
    subs: ["dead-bug"]
  },
  "side-plank": {
    name: "Side plank", grp: ["trunchi"], core: true, inc: 0, video: "side-plank", unit: "s", bodyweight: true, perSide: true,
    cues: [
      "Cotul sub umăr, picioarele întinse și suprapuse sau cu cel de sus în față.",
      "Ridică șoldul până corpul e în linie dreaptă; fesele strânse.",
      "Gâtul neutru, privirea înainte.",
      "Respiri normal; dacă șoldul coboară, oprești și notezi timpul real.",
      "Varianta cu genunchii îndoiți e în regulă în prima lună."
    ],
    safety: "Anti-înclinare laterală; fără flexie lombară.",
    subs: ["suitcase-carry"]
  },
  "farmer-carry": {
    name: "Farmer carry", grp: ["trunchi"], core: true, inc: 2.5, video: "farmer-carry", unit: "m",
    cues: [
      "O ganteră în fiecare mână, brațele întinse, umerii trași înapoi și jos.",
      "Pieptul sus, abdomenul contractat, pași scurți și constanți.",
      "Privirea înainte, gâtul neutru.",
      "Fără să ridici umerii spre urechi.",
      "Pune greutățile jos controlat, nu le arunca."
    ],
    safety: "Curele dacă priza e limita; alternativă: plank cu încărcare.",
    subs: ["plank-weighted"]
  },

  /* ---- Înlocuitori (apar doar prin tabelul de înlocuire) ---- */
  "glute-bridge-weighted": {
    name: "Glute bridge cu greutate", grp: ["fesieri", "femurali"], compound: true, inc: 5, video: "glute-bridge", sub: true,
    cues: [
      "Culcat pe spate, tălpile la lățimea șoldurilor, aproape de fese; discul sau gantera pe șold.",
      "Împinge prin călcâie, șoldul sus până corpul e drept de la genunchi la umeri.",
      "1 s strâns sus, coastele jos; nu arcui lombarul.",
      "Coboară controlat, 2 s."
    ],
    safety: "Amplitudine fără durere, fără încărcare pe genunchi."
  },
  "back-ext-45": {
    name: "Extensii de spate la 45°, cu greutate pe piept", grp: ["femurali", "fesieri"], compound: true, inc: 2.5, video: "back-ext-45", sub: true,
    cues: [
      "Perna chiar sub creasta șoldului, călcâiele fixate; discul ținut la piept.",
      "Coboară din șold cu spatele drept, 2–3 s.",
      "Urcă strângând fesele până trunchiul e în linie cu picioarele; nu mai sus.",
      "Gâtul neutru, privirea în jos."
    ],
    safety: "Mișcare de șold, nu de lombar; fără hiperextensie sus."
  },
  "quad-iso-60": {
    name: "Izometrie cvadriceps la ~60°", grp: ["cvadriceps"], inc: 2.5, video: "quad-iso-60", sub: true, unit: "s",
    cues: [
      "La aparatul de extensii: ridică perna până la ~60° și ține. Sau wall sit la același unghi.",
      "20 s ținut, respirație normală.",
      "Efort moderat, 7 din 10, fără durere.",
      "3 ținute, pauză 45 s."
    ],
    safety: "Variantă prietenoasă cu genunchiul: fără mișcare sub încărcare."
  },
  "spanish-squat": {
    name: "Spanish squat cu bandă", grp: ["cvadriceps"], inc: 0, video: "spanish-squat", sub: true, bodyweight: true,
    cues: [
      "Bandă groasă ancorată la nivelul genunchilor, trecută prin spatele genunchilor.",
      "Lasă-te pe spate în bandă, tibia verticală, și coboară cât e confortabil.",
      "2–3 s jos, urcă controlat; trunchiul vertical.",
      "Fără greutate sau cu o ganteră la piept."
    ],
    safety: "Variantă prietenoasă cu genunchiul: tibia rămâne verticală."
  },
  "leg-press-low": {
    name: "Presă de picioare, amplitudine redusă, tălpile jos", grp: ["cvadriceps", "fesieri"], compound: true, inc: 5, video: "leg-press-high", sub: true,
    cues: [
      "Tălpile în partea de jos-mijloc a platformei, lățimea umerilor.",
      "Coboară doar până unde genunchiul e confortabil; nu urmări adâncimea.",
      "Împinge prin toată talpa, fără blocarea genunchilor sus.",
      "Lombarul pe pernă pe tot parcursul."
    ],
    safety: "Variantă prietenoasă cu genunchiul."
  },
  "goblet-box-squat": {
    name: "Goblet squat la cutie", grp: ["cvadriceps", "fesieri"], compound: true, inc: 2, video: "goblet-squat", sub: true,
    cues: [
      "Gantera la piept, cutia sau banca în spate, la o înălțime la care genunchiul e confortabil.",
      "Coboară controlat până atingi ușor cutia; nu te așeza complet.",
      "Urcă prin toată talpa, trunchiul vertical.",
      "Genunchii pe linia vârfurilor."
    ],
    safety: "Variantă prietenoasă cu genunchiul; adâncimea o dă cutia."
  },
  "reverse-lunge": {
    name: "Fandare înapoi", grp: ["cvadriceps", "fesieri"], inc: 2, video: "reverse-lunge", sub: true, perSide: true,
    cues: [
      "Pas înapoi, trunchiul vertical, greutatea pe piciorul din față.",
      "Coboară drept, 2 s, genunchiul din spate spre podea.",
      "Urcă prin talpa din față, revino cu picioarele împreună.",
      "Pas mai scurt dacă genunchiul din față protestează."
    ],
    safety: "Variantă prietenoasă cu genunchiul: pasul înapoi ține tibia verticală."
  },
  "landmine-press": {
    name: "Landmine press", grp: ["umeri", "piept"], compound: true, inc: 2.5, video: "landmine-press", sub: true,
    cues: [
      "Capătul barei la piept, priză neutră, picioarele la lățimea umerilor sau în genunchi pe un picior.",
      "Împinge în sus și înainte pe arcul barei, până brațul e aproape întins.",
      "Revino lent la piept.",
      "Coastele jos, abdomenul contractat."
    ],
    safety: "Priză neutră, mișcare în fața capului."
  },
  "machine-shoulder-press-neutral": {
    name: "Presă umeri la aparat, mânere neutre", grp: ["umeri", "triceps"], compound: true, inc: 2.5, video: "machine-shoulder-press", sub: true,
    cues: [
      "Scaunul reglat ca mânerele să pornească la nivelul urechilor.",
      "Mânere neutre, coatele ușor în față.",
      "Împinge fără blocaj sus, revino 2–3 s.",
      "Spatele pe spătar, coastele jos."
    ],
    safety: "Priză neutră, nimic în spatele capului."
  },
  "pulldown-wide": {
    name: "Tracțiuni la helcometru, priză largă", grp: ["spate", "biceps"], compound: true, inc: 2.5, video: "pulldown-wide", sub: true,
    cues: [
      "Priză puțin mai largă decât umerii, coapsele fixate.",
      "Coboară întâi omoplații, apoi trage coatele spre coaste; bara ajunge sus pe piept.",
      "Urcă 2–3 s până la întindere completă.",
      "Trunchi ușor înclinat pe spate, fără balans."
    ],
    safety: "Curele la seturile grele; dacă priza pronată deranjează, înapoi la priza neutră."
  },
  "db-lateral-raise": {
    name: "Ridicări laterale cu gantere", grp: ["umeri"], inc: 1, video: "db-lateral-raise", sub: true,
    cues: [
      "Gantere mici, cotul ușor îndoit, condus de cot.",
      "Urcă până la orizontală, coboară 2–3 s.",
      "Fără balans din trunchi."
    ],
    safety: "Priză relaxată, încheietura dreaptă."
  },
  "cable-hammer-curl": {
    name: "Flexii ciocan la cablu cu frânghie", grp: ["biceps"], inc: 2.5, video: "cable-hammer-curl", sub: true,
    cues: [
      "Frânghia la scripetele de jos, palmele față în față.",
      "Coatele lângă corp, urcă fără avânt.",
      "Coboară 2–3 s până la întindere."
    ],
    safety: "Priză neutră, încheietura dreaptă."
  },
  "face-pull-dhandle": {
    name: "Face pull cu mânere individuale sau bandă", grp: ["umeri", "spate"], inc: 2.5, video: "face-pull", sub: true,
    cues: [
      "Două mânere D sau o bandă, la nivelul feței.",
      "Trage spre urechi, coatele sus, rotește antebrațele în sus la capăt.",
      "Revino lent."
    ],
    safety: "Mânerele individuale lasă încheieturile libere să se așeze natural."
  },
  "monster-walk-set": {
    name: "Monster walk cu bandă (set)", grp: ["fesieri"], inc: 0, video: "monster-walk", sub: true, bodyweight: true, unit: "rep",
    cues: [
      "Banda deasupra genunchilor, genunchii ușor îndoiți.",
      "Pași laterali mici, genunchii împinși în afară.",
      "10 pași într-un sens, 10 în celălalt = o repetare."
    ],
    safety: "Fără durere la genunchi; bandă mai ușoară dacă genunchii fug spre interior."
  }
};

/* Tabelul de înlocuire (ordinea = preferința). Se aplică la „durere ≥ 4” și rămâne salvat ca preferință. */
const SUBS = {
  "leg-press-high": ["hip-thrust", "glute-bridge-weighted"],
  "step-up-low": ["reverse-lunge", "hip-thrust", "leg-curl-seated"],
  "split-squat": ["hip-thrust", "leg-curl-lying"],
  "leg-ext-partial": ["quad-iso-60", "spanish-squat"],
  "hack-squat": ["leg-press-low", "goblet-box-squat"],
  "db-rdl": ["back-ext-45", "hip-thrust"],
  "hip-thrust": ["glute-bridge-weighted"],
  "db-shoulder-press-neutral": ["landmine-press", "machine-shoulder-press-neutral"],
  "cable-row-1arm": ["cs-row-neutral"],
  "face-pull": ["face-pull-dhandle"],
  "suitcase-carry": ["plank-weighted"],
  "farmer-carry": ["plank-weighted"],
  "pullup-neutral": ["pulldown-wide", "pulldown-neutral"],
  "inc-db-press": ["machine-chest-press", "db-bench-neutral"],
  "db-bench-neutral": ["machine-chest-press"],
  "machine-chest-press": ["db-bench-neutral"],
  "cs-row-neutral": ["cable-row-1arm"],
  "pulldown-neutral": ["pullup-neutral"],
  "cable-lat-raise-1": ["db-lateral-raise"],
  "triceps-rope-pushdown": ["triceps-overhead-rope"],
  "triceps-overhead-rope": ["triceps-rope-pushdown"],
  "hammer-curl": ["cable-hammer-curl"],
  "rear-delt-fly": ["face-pull"],
  "leg-curl-seated": ["leg-curl-lying"],
  "leg-curl-lying": ["leg-curl-seated"],
  "calf-standing": ["calf-seated"],
  "calf-seated": ["calf-standing"],
  "hip-abduction": ["monster-walk-set"],
  "pallof-press": ["side-plank"],
  "dead-bug": ["bird-dog"],
  "bird-dog": ["dead-bug"],
  "side-plank": ["suitcase-carry"],
  "plank-weighted": ["dead-bug"]
};

/* Regulile generale de înlocuire, afișate în tabul Exerciții */
const SUBS_REGULI = [
  "Orice exercițiu cu bară → varianta cu gantere sau la aparat.",
  "Orice tras cu priză pronată → priză neutră + curele.",
  "Ramat cu ganteră → ramat cu pieptul sprijinit.",
  "Face pull care deranjează încheietura → mânere individuale sau bandă.",
  "Carry → plank cu încărcare."
];

/* ===== Încălzirea standard ===== */
const WARMUP_GENERAL = [
  { id: "bike-easy", t: "Bicicletă sau mers ușor", sec: 240, body: "Ritm lejer, cât să te încălzești și să intri în antrenament." },
  { id: "cat-cow", t: "Cat-cow", rep: "× 8", video: "cat-cow", body: "În patrupedie, rotunjește și arcuiește lent coloana, segment cu segment." },
  { id: "open-book", t: "Rotații toracice în patrupedie (open book)", rep: "× 8 pe parte", video: "open-book", body: "O mână la ceafă, cotul spre podea, apoi spre tavan, urmărit cu privirea. Bazinul nu se mișcă." },
  { id: "chin-tuck", t: "Chin tucks (bărbia înapoi)", rep: "× 10", video: "chin-tuck", body: "Bărbia trasă drept înapoi, „bărbie dublă”, 2 s ținut, fără să pleci capul." },
  { id: "neck-rot", t: "Rotații lente ale gâtului", rep: "× 5 pe parte", video: "neck-rotation", body: "Privește peste umăr, lent, cât e confortabil; fără cercuri complete și fără forțare." }
];
const WARMUP_UPPER = [
  { id: "band-pull-apart", t: "Band pull-apart", rep: "× 15", video: "band-pull-apart", body: "Brațele întinse în față, deschizi banda strângând omoplații; umerii rămân jos." },
  { id: "dislocates", t: "„Dislocări” de umăr cu bandă", rep: "× 10", video: "dislocates", body: "Priză largă și relaxată, banda trece lent peste cap și în spate, brațele întinse. Lărgește priza dacă e greu." },
  { id: "band-er", t: "Rotații externe cu bandă", rep: "× 12 pe parte", video: "band-external-rotation", body: "Cotul lipit de corp, îndoit la 90°, antebrațul se duce spre exterior. Bandă ușoară." },
  { id: "wrist-circles", t: "Cercuri de încheietură", rep: "× 10 pe sens", video: "wrist-circles", body: "Lent, amplitudine completă, ambele sensuri." },
  { id: "forearm-stretch", t: "Întindere flexori și extensori antebraț", sec: 20, side: true, video: "wrist-extensor", body: "Brațul întins în față: palma în jos și încheietura îndoită în jos (extensori), apoi palma în sus și degetele trase spre tine (flexori). 20 s fiecare." }
];
const WARMUP_LOWER = [
  { id: "hip-9090", t: "90/90 șold", rep: "× 6 pe parte", video: "hip-9090", body: "Așezat, ambii genunchi la 90°; treci lent dintr-o parte în alta, trunchiul drept." },
  { id: "leg-swings", t: "Leg swings", rep: "× 10 pe picior", video: "leg-swing-front", body: "Sprijinit de perete, balansări față-spate, apoi laterale, tot mai largi, fără smucituri." },
  { id: "ankle-rocks", t: "Ankle rocks", rep: "× 10 pe picior", video: "ankle-rocks", body: "Pe un genunchi, talpa din față fixă, genunchiul merge înainte peste vârf, călcâiul rămâne jos." },
  { id: "glute-bridge", t: "Glute bridge", rep: "× 12", video: "glute-bridge", body: "Culcat, tălpile aproape de fese; împinge șoldul sus, 1 s strâns, coboară lent." },
  { id: "tke", t: "Extensie terminală de genunchi cu bandă (TKE)", rep: "× 15 pe picior", video: "tke", body: "Banda în spatele genunchiului, ancorată în față; întinde genunchiul contra benzii, 1 s ținut." },
  { id: "monster-walk", t: "Monster walk cu bandă", rep: "× 10 pași pe sens", video: "monster-walk", body: "Banda deasupra genunchilor, genunchii împinși în afară, pași laterali mici." }
];
/* Seturile de acomodare la primul compus al zilei, procente din greutatea de lucru */
const ACCOM = [{ p: 0.5, r: 8 }, { p: 0.7, r: 5 }, { p: 0.85, r: 2 }];

/* ===== Răcirea standard (întinderi statice; sec = pe fiecare parte unde side) ===== */
const COOLDOWN = [
  { id: "walk-easy", t: "Mers ușor", sec: 180, body: "Bandă sau sală, ritm lejer." },
  { id: "hip-flexor", t: "Flexori șold (half-kneeling)", sec: 40, side: true, video: "hip-flexor", body: "Pe un genunchi, fesa strânsă, șoldul ușor înainte, fără să arcuiești spatele." },
  { id: "hamstring-strap", t: "Femurali (culcat pe spate, cu curea)", sec: 40, side: true, video: "hamstring-strap", body: "Cureaua pe talpă, piciorul aproape întins ridicat lent până simți spatele coapsei; celălalt picior pe podea." },
  { id: "figure-4", t: "Fesieri și piriform (figura 4)", sec: 40, side: true, video: "figure-4", body: "Culcat, glezna pe genunchiul opus, tragi coapsa de jos spre piept." },
  { id: "quad-prone", t: "Cvadriceps (culcat pe burtă, cu curea)", sec: 40, side: true, video: "quad-prone-strap", body: "Cureaua la gleznă, tragi lent călcâiul spre fesă; șoldul rămâne pe podea." },
  { id: "calf-wall", t: "Gambe la perete", sec: 40, side: true, video: "wall-calf", body: "Un picior în spate, călcâiul pe podea, șoldul împins înainte." },
  { id: "pec-door", t: "Pectoral în cadrul ușii", sec: 40, side: true, video: "doorway-pec", body: "Antebrațul pe cadru, cotul la nivelul umărului, un pas înainte." },
  { id: "lat-bench", t: "Dorsal (agățat ușor sau cu brațele pe bancă)", sec: 40, video: "bench-lat", body: "În genunchi, coatele pe bancă, pieptul coboară spre podea; fără să strângi nimic." },
  { id: "trap-levator", t: "Trapez superior și levator", sec: 30, side: true, video: "trap-levator", body: "Capul înclinat lateral și ușor rotit în jos, mâna doar ghidează; nu trage de cap." },
  { id: "forearm-cool", t: "Flexori și extensori antebraț", sec: 20, side: true, video: "wrist-extensor", body: "Palma în jos apoi palma în sus, cu cealaltă mână; întindere, nu durere." },
  { id: "breathing-9090", t: "Respirație diafragmatică în 90/90", sec: 120, video: "breathing-9090", body: "Culcat, gambele pe o bancă sau scaun, o mână pe burtă: inspiri lent pe nas în burtă, expiri lung." }
];

/* ===== Mobilitate (miercuri și opțional duminică) ===== */
const MOBILITY = [
  { id: "foam-thoracic", t: "Foam roller toracic", sec: 120, video: "foam-thoracic", body: "Rola sub mijlocul spatelui, mâinile la ceafă, fesele jos; extensii lente, mutând rola din 2 în 2 cm." },
  { id: "open-book-m", t: "Open book", rep: "× 10 pe parte", video: "open-book", body: "Culcat lateral, genunchii îndoiți; brațul de sus se deschide spre podea, urmărit cu privirea." },
  { id: "wall-slides", t: "Wall slides", rep: "× 10", video: "wall-slides", body: "Antebrațele pe perete, alunecă în sus fără să ridici umerii; coastele jos." },
  { id: "hip-cars", t: "Hip CARs", rep: "× 5 pe sens, pe parte", video: "hip-cars", body: "În patrupedie, un genunchi descrie lent cercul cel mai mare posibil, fără să miști bazinul." },
  { id: "couch-stretch", t: "Couch stretch", sec: 45, side: true, video: "couch-stretch", body: "Genunchiul din spate la perete sau bancă, trunchiul vertical, fesa strânsă; fără durere la genunchi." },
  { id: "wgs", t: "World's greatest stretch", rep: "× 5 pe parte", video: "wgs", body: "Fandare lungă, mâna lângă piciorul din față, cotul spre podea, apoi rotație cu brațul spre tavan." },
  { id: "ankle-wall", t: "Cățărarea pe perete pentru gleznă", rep: "× 10 pe picior", video: "knee-to-wall", body: "Vârful la o palmă de perete, genunchiul spre perete, călcâiul jos." }
];

/* Textul protocolului de măsurare a taliei */
const TALIE_PROTOCOL = "Dimineața, pe nemâncate, după toaletă, la sfârșitul unei expirații normale, banda orizontală, strânsă fără să comprime, același reper de fiecare dată.";

/* Țintele săptămânale */
const TINTE = { setsLow: 10, setsHigh: 20, cardioMin: 150, pasi: [8000, 10000], proteina: 150 };
