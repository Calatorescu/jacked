// Programul de antrenament — sintetizat din canalul YouTube "Average to Jacked"
// (540 de clipuri parcurse, noiembrie 2026). Varianta pentru începători: 3 seturi/exercițiu,
// progresie 8→12 repetări, aproape de failure (mai poți ~2 repetări).
// Secvențele video sunt din clipurile originale ale canalului, redate prin
// embed YouTube cu start/stop (verificate cadru cu cadru).

// Moduri de antrenament (comutabile din Program):
//  - beginner: 3 seturi × 8→12 (programul de bază al canalului, recomandat începătorilor)
//  - 2x4: varianta intermediară a metodei ×4 — 2 seturi de lucru, 6→10 la compuse, 8→15 la izolări;
//    ținta setului e progresia (recordul bătut), nu failure-ul
// Exercițiile cu `mode` apar doar în modul respectiv; restul apar în ambele.
const MODES = {
  beginner: { label: "Începător — 3 seturi", sets: 3, repLow: 8, repHigh: 12 },
  "2x4":    { label: "2×4 — două seturi de lucru", sets: 2, repLow: 6, repHigh: 10, isoLow: 8, isoHigh: 15 }
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
          id: "machine-shoulder-press",
          name: "Machine Shoulder Press",
          ro: "Împins pentru umeri la aparat",
          mode: "2x4",
          sets: 2, repLow: 6, repHigh: 10, rest: 150, compound: true,
          video: { id: "DD_N1OvKSQc", start: 0, end: 58 },
          cues: "Mișcarea de împins deasupra capului. Mânere neutre dacă aparatul le are, coatele ușor în față, fără să blochezi brusc sus.",
          alts: ["Împins cu gantere din șezut"]
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
          mode: "2x4",
          sets: 2, repLow: 6, repHigh: 10, rest: 150, compound: true,
          video: { id: "4-ERnMonUGQ", start: 377, end: 399 },
          cues: "Motorul principal pentru cvadriceps. În clip e făcută cu un singur picior — cu ambele e la fel de bine și mai rapid. Amplitudine completă, controlat.",
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
          id: "seated-cable-row",
          name: "Seated Cable Row (neutral grip)",
          ro: "Ramat la cablu, priză neutră",
          mode: "2x4",
          sets: 2, repLow: 6, repHigh: 10, rest: 150, compound: true,
          video: { id: "ErlBDk2ujgk", start: 225, end: 250 },
          cues: "Al doilea ramat, tot cu trunchiul stabil. Tragi cu spatele, coatele aproape de corp, fără să te balansezi.",
          alts: ["Ramat la aparat"]
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
          mode: "beginner",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "8r-lqewUNUY", start: 200, end: 210 },
          cues: "Brațele atârnă în spatele corpului = întindere maximă pe biceps. Controlat, fără avânt.",
          alts: ["Flexii cu gantere în picioare"]
        },
        {
          id: "cable-curl",
          name: "Cable Curl",
          ro: "Flexii biceps la cablu",
          sets: 3, repLow: 8, repHigh: 12, rest: 90,
          video: { id: "8r-lqewUNUY", start: 217, end: 228 },
          cues: "Tensiune continuă pe tot parcursul mișcării. Controlat, fără avânt, cotul fix lângă corp.",
          alts: ["Flexii la cablu prin spate"]
        },
        {
          id: "hammer-curl",
          name: "Hammer Curl",
          ro: "Flexii ciocan cu gantere",
          mode: "2x4",
          sets: 2, repLow: 10, repHigh: 15, rest: 90,
          video: { id: "YqVNxuYVIow", start: 232, end: 250 },
          cues: "Priză neutră, încheietura dreaptă. Îngroașă brațul și antebrațul. Controlat, întindere completă jos, fără avânt.",
          alts: ["Flexii ciocan la cablu cu coardă"]
        }
      ]
    }
  }
};

// Repetări proprii în 2×4, unde diferă de regula generală (compuse 6–10, izolări 8–15).
// Brațele merg pe repetări multe și greutate mică, ca să nu încarce tendonul cotului.
const REPS_2X4 = {
  "triceps-pushdown": [10, 15],
  "incline-db-curl": [10, 15],
  "cable-curl": [10, 15],
  "hammer-curl": [10, 15],
  "seated-calf": [10, 15],
  "cable-crunch": [10, 15]
};

// Adaptări pentru epicondilita laterală („cotul tenismenului”).
// NU vin de pe canal și nu înlocuiesc sfatul medicului.
const COT = {
  "incline-db-press": "Palmele spre interior sau ușor rotite, încheietura dreaptă, fără strâns excesiv.",
  "machine-shoulder-press": "Mânere neutre dacă există. Începe ușor: al doilea împins al zilei încarcă mai mult cotul.",
  "lowhigh-cable-fly": "Ține mânerele relaxat, încheietura dreaptă, coatele ușor îndoite și fixe.",
  "cable-lateral-raise": "Ține mânerul relaxat și încheietura dreaptă, fără să ridici dosul palmei.",
  "triceps-pushdown": "Cu coardă, palmele față în față, nu cu bara dreaptă cu palmele în jos.",
  "db-rdl": "Folosește chingi: priza strânsă e cel mai probabil declanșator pe exteriorul cotului.",
  "cable-crunch": "Ține coarda relaxat. Fără ridicări atârnat de bară, cât timp doare.",
  "lat-pulldown": "Chingi și mâner neutru. Evită bara lată cu palmele în jos, dacă doare.",
  "tbar-row": "Priză neutră, cu chingi la seturile grele. Nu cu palmele în jos.",
  "seated-cable-row": "Priză neutră, chingi la seturile grele; nu smuci greutatea la începutul mișcării.",
  "rear-delt-fly": "Mânere neutre dacă aparatul le are, nu cu palmele în jos. Priză relaxată.",
  "incline-db-curl": "Bancă la ~30°, greutate mică, încheietura dreaptă. Dacă doare, treci la flexii la cablu: autorul canalului a făcut la fel când a avut cot de tenisman.",
  "cable-curl": "Ales în locul flexiilor pe bancă: autorul canalului a trecut la cablu când a avut cot de tenisman. Încheietura dreaptă, greutate mică.",
  "hammer-curl": "Începe foarte ușor: priza neutră poate solicita exteriorul cotului. Primul pe care îl scoți dacă doare."
};

const COT_REGULI = [
  { title: "Ce evităm", body: "Flexii cu palmele în jos, wrist roller, ridicări și atârnări de bară. Tot ce înseamnă strâns tare sau încheietura ridicată sub greutate. Exerciții directe pentru antebraț doar dacă le recomandă medicul sau kinetoterapeutul." },
  { title: "Regula durerii", body: "În timpul setului, cel mult 3 din 10 la cot. A doua zi dimineață trebuie să fie ca înainte. Dacă nu: scazi greutatea sau schimbi exercițiul." },
  { title: "Ordinea în care scoți", body: "Dacă se agravează: scoți flexiile ciocan, apoi împinsul pentru umeri, apoi flexiile la cablu. Spatele și picioarele rămân, cu chingi și priză neutră." },
  { title: "Oprire și verificare", body: "Durere ascuțită, amorțeală în degete sau durere care nu cedează în câteva săptămâni: oprești exercițiile care o provoacă și mergi la medic sau kinetoterapeut. Adaptările de aici nu vin de pe canal și nu sunt sfat medical." }
];

// Stretching și mobilitate. Rutina de bază vine din clipul de mobilitate al canalului;
// atârnarea de bară e înlocuită, iar întinderile de antebraț nu vin de pe canal.
const STRETCH = [
  { title: "Când", body: "După antrenament sau separat, în zilele libere. Nu înainte de antrenament: canalul ține încălzirea scurtă, fără întinderi lungi. Durează ~5 minute; zilnic sau de 3 ori pe săptămână." },
  { title: "1. Antebraț, extensori (nu e de pe canal)", sec: 30, body: "Brațul întins în față, palma în jos. Cu cealaltă mână îndoi ușor încheietura în jos, până simți întinderea pe exteriorul antebrațului. 20–30 s, de 2–3 ori, pe fiecare braț. Întindere, nu durere." },
  { title: "2. Antebraț, flexori (nu e de pe canal)", sec: 30, body: "Brațul întins, palma în sus. Îndoi ușor degetele spre podea. 20–30 s, de 2–3 ori, pe fiecare braț." },
  { title: "3. Deschiderea umerilor (în locul atârnării de bară)", sec: 45, body: "Canalul folosește atârnarea de bară, dar ea încarcă priza. Sprijină palmele deschise pe un suport la nivelul pieptului și lasă pieptul în jos, fără să strângi nimic. 30–60 s." },
  { title: "4. Genuflexiune adâncă asistată", sec: 45, body: "Ții ușor un suport stabil și cobori cât de jos e confortabil, mutând greutatea ușor stânga-dreapta. 30–60 s." },
  { title: "5. Rotări cu banda peste cap", body: "Bandă ușoară, priză largă și relaxată. O duci lent peste cap, în spate și înapoi. 10–15 repetări. Dacă e prea mult, prinde mai larg." },
  { title: "6. Îndepărtări cu banda", body: "Banda în față, o tragi în lateral deschizând pieptul, cu priza relaxată. 10–15 repetări lente. Începi cu o rundă; apoi, dacă vrei, două sau trei." },
  { title: "Sursa", body: "Pașii 3–6 pornesc de la <a href=\"https://www.youtube.com/watch?v=iRdJk7dl2Tg\" target=\"_blank\" rel=\"noopener\">rutina de mobilitate a canalului</a>. Dacă o întindere crește durerea din cot, o scoți și întrebi medicul." }
];

// Ghid de încălzire — din videoclipul dedicat al canalului
const WARMUP = [
  { title: "Mers înclinat 5–10 min", body: "Bandă cu înclinație, ritm lejer. Doar cât să-ți crești temperatura corpului și să intri mental în antrenament. La picioare poți merge 10–12 min." },
  { title: "Mimează mișcările cu banda elastică", body: "Ia o bandă ușoară și imită exercițiile de azi: presses, ridicări laterale, flexii, extensii. Lin și controlat, câteva repetări — nu trebuie să obosească." },
  { title: "Seturi progresive la primul exercițiu", body: "≈25% din greutatea de lucru × 8 · ≈50% × 5 · ≈75% × 3. Pauză 30–45 sec între ele, apoi pauză completă înainte de primul set de lucru." },
  { title: "La restul exercițiilor", body: "Un singur set de încălzire la ~50% din greutatea de lucru, 5–8 repetări lente, apoi direct la seturile de lucru." },
  { title: "Ce NU e încălzirea", body: "Nu e un antrenament. Dacă ajungi obosit la primul set de lucru, ai făcut prea mult sau ai pus prea mult pe încălzire." }
];

// Principiile canalului — extrase din cele mai importante videoclipuri
const PRINCIPLES = [
  { title: "Progresie, nu pump", body: "Naturalii cresc dintr-un singur motiv: greutăți sau repetări mai multe în timp. Caietul (aplicația) bate senzația." },
  { title: "Recuperare, nu volum nesfârșit", body: "3 zile pe săptămână e suficient. Mușchiul crește când te recuperezi, nu când stai în sală. Mai puțin antrenament = mai puține accidentări + motivație constantă." },
  { title: "Execuție, nu variație nesfârșită", body: "Alege un exercițiu per mișcare și rămâi la el luni întregi. Repetări lente, controlate, amplitudine completă, pauză jos — fără avânt, fără repetări murdare." },
  { title: "Progresie, nu failure", body: "Ținta setului e să bați ce ai făcut data trecută. Când ai reușit, te poți opri: restul repetărilor adaugă oboseală în articulații și tendoane, de care trebuie să te recuperezi." },
  { title: "Regula sursei unice", body: "Alege un plan și urmează-l 6+ luni fără să-l schimbi. Schimbatul constant al programului e cel mai mare distrugător de progres." },
  { title: "Normalizează anii, nu săptămânile", body: "O transformare reală durează ani, nu 30 de zile. Consecvența bate orice program «optim»." },
  { title: "În zilele libere: mișcare, nu sală", body: "8.000–10.000 de pași pe zi, plimbări, cardio ușor (zona 2). Somn 7+ ore pe noapte — acolo se construiește mușchiul." }
];

const NUTRITION = [
  { title: "Proteină: 1,5–2,2 g / kg din greutatea-țintă", body: "Exemplu: vrei să ajungi la 80 kg → 120–175 g proteină pe zi. Nu trebuie să fie exact." },
  { title: "Surplus mic pentru masă", body: "Pornește cu 100–200 kcal peste mentenanță, ritm de ~0,2 kg pe săptămână. Urmărește media săptămânală: dacă stă 1–2 săptămâni, adaugi 100–200 kcal; dacă urcă prea repede, scazi." },
  { title: "Mâncare reală", body: "Carne, ouă, orez, cartofi, fructe, lactate. Restul caloriilor din carbohidrați și grăsimi sănătoase." },
  { title: "Suplimente: doar 2 merită", body: "Creatină monohidrat (~5 g/zi) și eventual un multivitaminic + proteină din zer pentru comoditate. Restul sunt bani aruncați." }
];

// Ziua 4 opțională (accesorii — doar informativ)
const DAY4 = {
  title: "Ziua 4 (opțională) — accesorii",
  body: "Dacă vrei o a patra zi: neck curls (începe fără greutate). Autorul adaugă și un sprint de 15 secunde după o încălzire dinamică de 15 min, plus antebrațe; pe acestea le sari, din cauza cotului. Gambele și abdomenul sunt deja la Legs. Complet opțional: cele 3 zile sunt programul."
};

const CHANNEL = {
  name: "Average to Jacked",
  url: "https://www.youtube.com/@Averagetojacked"
};
