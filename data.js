// Programul de antrenament — sintetizat din canalul YouTube "Average to Jacked"
// (131 videoclipuri scanate). Varianta pentru începători: 3 seturi/exercițiu,
// progresie 8→12 repetări, aproape de failure (mai poți ~2 repetări).
// Secvențele video sunt din clipurile originale ale canalului, redate prin
// embed YouTube cu start/stop (verificate cadru cu cadru).

// Moduri de antrenament (comutabile din Program):
//  - beginner: 3 seturi × 8→12 (programul de bază al canalului, recomandat începătorilor)
//  - 1x4: metoda 1×4 — 1 set dus la failure × 4 exerciții, 6→10 repetări
// Exercițiile cu `mode` apar doar în modul respectiv; restul apar în ambele.
const MODES = {
  beginner: { label: "Începător — 3 seturi", sets: 3, repLow: 8, repHigh: 12 },
  "1x4":    { label: "1×4 — un set la failure", sets: 1, repLow: 6, repHigh: 10 }
};

const PROGRAM = {
  cycle: ["push", "legs", "pull"],
  days: {
    push: {
      name: "Push",
      subtitle: "Piept · Umeri · Triceps",
      color: "#C43A2F",
      video: "lVDrlOw3gcQ",
      exercises: [
        {
          id: "incline-db-press",
          name: "Incline Dumbbell Press",
          ro: "Împins cu gantere pe bancă înclinată",
          sets: 3, repLow: 8, repHigh: 12, rest: 180, compound: true,
          video: { id: "lVDrlOw3gcQ", start: 103, end: 114 },
          cues: "Mișcarea principală pentru pieptul superior. Coboară controlat, pauză scurtă jos, fără să sari din întindere.",
          alts: ["Împins la aparat înclinat", "Împins cu bara înclinat"]
        },
        {
          id: "chest-fly",
          name: "Machine Chest Fly",
          ro: "Fluturări la aparat",
          sets: 3, repLow: 8, repHigh: 12, rest: 120,
          video: { id: "lVDrlOw3gcQ", start: 126, end: 145 },
          cues: "Press + fly = tot ce îți trebuie pentru piept. Lasă pieptul să se întindă complet, apoi strânge.",
          alts: ["Fluturări cu gantere", "Pec deck"]
        },
        {
          id: "lowhigh-cable-fly",
          name: "Low-to-High Cable Fly",
          ro: "Fluturări la cablu, de jos în sus",
          mode: "beginner",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "lVDrlOw3gcQ", start: 149, end: 164 },
          cues: "Cablurile setate jos de tot, tragi în sus pe diagonală. Volum extra pentru pieptul superior.",
          alts: ["Fluturări la cablu standard"]
        },
        {
          id: "cable-lateral-raise",
          name: "Cable Lateral Raise",
          ro: "Ridicări laterale la cablu",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "lVDrlOw3gcQ", start: 167, end: 178 },
          cues: "Mișcarea nr. 1 pentru umeri lați. Greutate mică, control total, lasă cablul să te întindă jos.",
          alts: ["Ridicări laterale cu gantere"]
        },
        {
          id: "triceps-pushdown",
          name: "Triceps Cable Extension",
          ro: "Extensii triceps la cablu",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "lVDrlOw3gcQ", start: 186, end: 197 },
          cues: "Coardă sau bară dreaptă — ce simți mai bine în coate. Extensie completă și control.",
          alts: ["Extensii cu coarda", "Extensii deasupra capului"]
        }
      ]
    },
    legs: {
      name: "Legs",
      subtitle: "Picioare",
      color: "#2456A6",
      video: "R8BRgzRE7yU",
      exercises: [
        {
          id: "leg-press",
          name: "Leg Press",
          ro: "Presă de picioare",
          mode: "1x4",
          sets: 1, repLow: 6, repHigh: 10, rest: 120, compound: true,
          video: { id: "4-ERnMonUGQ", start: 377, end: 399 },
          cues: "Motorul principal pentru cvadriceps în metoda 1×4. În clip e făcută cu un singur picior — cu ambele e la fel de bine și mai rapid. Amplitudine completă, controlat.",
          alts: ["Hack squat", "Genuflexiuni cu bara", "Pendulum squat"]
        },
        {
          id: "squat",
          name: "Squat (pendulum / hack / bară)",
          ro: "Genuflexiuni",
          mode: "beginner",
          sets: 3, repLow: 8, repHigh: 12, rest: 180, compound: true,
          video: { id: "R8BRgzRE7yU", start: 102, end: 125 },
          cues: "Mișcarea compusă principală pentru cvadriceps. Alege varianta care îți place (pendulum, hack squat sau bară) și rămâi la ea.",
          alts: ["Genuflexiuni cu bara", "Hack squat", "Presă de picioare"]
        },
        {
          id: "db-rdl",
          name: "Dumbbell Romanian Deadlift",
          ro: "Îndreptări românești cu gantere",
          sets: 3, repLow: 8, repHigh: 12, rest: 180, compound: true,
          video: { id: "R8BRgzRE7yU", start: 136, end: 152 },
          cues: "Tot lanțul posterior: femurali + fesieri. Formă strictă, controlează negativa — femuralii trebuie să ardă, nu lombarul.",
          alts: ["RDL cu bara", "RDL cu trap bar"]
        },
        {
          id: "leg-curl",
          name: "Leg Curl (așezat sau culcat)",
          ro: "Flexii femurali la aparat",
          sets: 3, repLow: 8, repHigh: 12, rest: 120,
          video: { id: "R8BRgzRE7yU", start: 154, end: 168 },
          cues: "RDL = extensie de șold, leg curl = flexia genunchiului. Ambele unghiuri pentru femurali compleți.",
          alts: ["Seated leg curl", "Lying leg curl"]
        },
        {
          id: "leg-extension",
          name: "Leg Extension",
          ro: "Extensii cvadriceps la aparat",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "R8BRgzRE7yU", start: 190, end: 199 },
          cues: "Lucru direct pe cvadriceps. Focus pe conexiunea minte-mușchi, nu pe greutate.",
          alts: []
        },
        {
          id: "seated-calf",
          name: "Seated Calf Raise",
          ro: "Ridicări pe vârfuri din șezut",
          sets: 3, repLow: 10, repHigh: 15, rest: 60, optional: true,
          video: { id: "R8BRgzRE7yU", start: 213, end: 226 },
          cues: "Opțional. Repetări multe, până la failure complet. Întindere completă jos.",
          alts: ["Ridicări pe vârfuri în picioare"]
        },
        {
          id: "cable-crunch",
          name: "Cable Crunch",
          ro: "Crunch la cablu (abdomen)",
          sets: 3, repLow: 10, repHigh: 15, rest: 60, optional: true,
          video: { id: "R8BRgzRE7yU", start: 231, end: 249 },
          cues: "Opțional. Rulează coloana, nu trage cu brațele. Poți alterna cu ridicări de genunchi la bară.",
          alts: ["Ridicări de genunchi atârnat"]
        }
      ]
    },
    pull: {
      name: "Pull",
      subtitle: "Spate · Biceps · Umeri posteriori",
      color: "#1E7A46",
      video: "8r-lqewUNUY",
      exercises: [
        {
          id: "lat-pulldown",
          name: "Wide-Grip Lat Pulldown",
          ro: "Tracțiuni la helcometru, priză largă",
          sets: 3, repLow: 8, repHigh: 12, rest: 180, compound: true,
          video: { id: "8r-lqewUNUY", start: 113, end: 130 },
          cues: "Constructorul principal de lățime. Stai în întindere sus, apoi explodează în jos. Amplitudine completă.",
          alts: ["Tracțiuni la bară", "Tracțiuni asistate"]
        },
        {
          id: "tbar-row",
          name: "Chest-Supported T-Bar Row",
          ro: "Ramat T-bar cu pieptul sprijinit",
          sets: 3, repLow: 8, repHigh: 12, rest: 150, compound: true,
          video: { id: "8r-lqewUNUY", start: 142, end: 160 },
          cues: "Grosime pentru mijlocul spatelui și trapez, fără să te limiteze lombarul. Alege un ramat și rămâi la el.",
          alts: ["Ramat cu gantera", "Ramat la aparat", "Ramat cu bara"]
        },
        {
          id: "rear-delt-fly",
          name: "Rear Delt Fly",
          ro: "Fluturări pentru umerii posteriori",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "8r-lqewUNUY", start: 170, end: 188 },
          cues: "Rotunjesc umerii și echilibrează postura după atâta împins. Nu-i sări niciodată.",
          alts: ["Reverse pec deck", "Face pulls"]
        },
        {
          id: "incline-db-curl",
          name: "Incline Dumbbell Curl",
          ro: "Flexii biceps pe bancă înclinată",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "8r-lqewUNUY", start: 200, end: 210 },
          cues: "Brațele atârnă în spatele corpului = întindere maximă pe biceps. Controlat, fără avânt.",
          alts: ["Flexii cu gantere în picioare"]
        },
        {
          id: "cable-curl",
          name: "Cable Curl",
          ro: "Flexii biceps la cablu",
          mode: "beginner",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "8r-lqewUNUY", start: 217, end: 228 },
          cues: "Ultimul exercițiu — termină în forță. Tensiune continuă pe tot parcursul mișcării.",
          alts: ["Flexii la cablu prin spate"]
        }
      ]
    }
  }
};

// Ghid de încălzire — din videoclipul dedicat al canalului
const WARMUP = [
  { title: "Mers înclinat 5–10 min", body: "Bandă cu înclinație, ritm lejer. Doar cât să-ți crești temperatura corpului și să intri mental în antrenament. La picioare poți merge 10–12 min." },
  { title: "Mimează mișcările cu banda elastică", body: "Ia o bandă ușoară și imită exercițiile de azi: presses, ridicări laterale, flexii, extensii. Lin și controlat, câteva repetări — nu trebuie să obosească." },
  { title: "Seturi progresive la primul exercițiu", body: "≈40% din greutatea de lucru × 8 · ≈60% × 5 · ≈80% × 3. Pauză 30–45 sec între ele, apoi 2 min pauză înainte de primul set de lucru." },
  { title: "La restul exercițiilor", body: "Un singur set de încălzire la ~50% din greutatea de lucru, 5–8 repetări lente, apoi direct la seturile de lucru." },
  { title: "Ce NU e încălzirea", body: "Nu e un antrenament. Dacă ajungi obosit la primul set de lucru, ai făcut prea mult sau ai pus prea mult pe încălzire." }
];

// Principiile canalului — extrase din cele mai importante videoclipuri
const PRINCIPLES = [
  { title: "Progresie, nu pump", body: "Naturalii cresc dintr-un singur motiv: greutăți sau repetări mai multe în timp. Caietul (aplicația) bate senzația." },
  { title: "Recuperare, nu volum nesfârșit", body: "3 zile pe săptămână e suficient. Mușchiul crește când te recuperezi, nu când stai în sală. Mai puțin antrenament = mai puține accidentări + motivație constantă." },
  { title: "Execuție, nu variație nesfârșită", body: "Alege un exercițiu per mișcare și rămâi la el luni întregi. Repetări lente, controlate, amplitudine completă, pauză jos — fără avânt, fără repetări murdare." },
  { title: "Aproape de failure, la fiecare set", body: "Ca începător nu duce seturile până la blocaj: oprește-te când ai mai putea ~2 repetări curate. Discomfortul apare înaintea limitei reale — nu te opri la prima senzație de greu." },
  { title: "Regula sursei unice", body: "Alege un plan și urmează-l 6+ luni fără să-l schimbi. Schimbatul constant al programului e cel mai mare distrugător de progres." },
  { title: "Normalizează anii, nu săptămânile", body: "O transformare reală durează ani, nu 30 de zile. Consecvența bate orice program «optim»." },
  { title: "În zilele libere: mișcare, nu sală", body: "8.000 de pași pe zi, plimbări, cardio ușor (zona 2). Somn 7+ ore pe noapte — acolo se construiește mușchiul." }
];

const NUTRITION = [
  { title: "Proteină: 2,2 g / kg din greutatea-țintă", body: "Exemplu: vrei să ajungi la 80 kg → ~175 g proteină pe zi, în fiecare zi." },
  { title: "Surplus mic pentru masă", body: "Mănâncă cu 200–300 kcal peste mentenanță. Dacă cântarul urcă prea repede (peste ~0,5 kg/săpt), taie ~150 kcal." },
  { title: "Mâncare reală", body: "Carne, ouă, orez, cartofi, fructe, lactate. Restul caloriilor din carbohidrați și grăsimi sănătoase." },
  { title: "Suplimente: doar 2 merită", body: "Creatină monohidrat (3–5 g/zi) și eventual un multivitaminic + proteină din zer pentru comoditate. Restul sunt bani aruncați." }
];

// Ziua 4 opțională din metoda 1×4 (accesorii — doar informativ)
const DAY4_1X4 = {
  title: "Ziua 4 (opțională) — accesorii",
  body: "Dacă vrei o a patra zi: neck curls (începe fără greutate), wrist roller pentru antebrațe, cable crunch pentru abdomen și ridicări pe vârfuri pentru gambe — câte 1 set la failure fiecare. Autorul adaugă și un sprint de 15 secunde după o încălzire dinamică de 15 min. Complet opțional: cele 3 zile sunt programul."
};

const CHANNEL = {
  name: "Average to Jacked",
  url: "https://www.youtube.com/@Averagetojacked"
};
