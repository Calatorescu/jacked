/* JACKED v2 — clipurile demonstrative: embed YouTube din clipuri publice, cu segment în buclă (start/end, în
   secunde). Nimic nu e republicat; redarea offline merge doar prin importul local din Unelte (cache jacked2-demos).
   verificat: true = cadrele segmentului au fost verificate (yt-dlp + ffmpeg, cadru la 3 s) la 20.11.2026, sau
   preluate din v1 unde fuseseră verificate la 07.11 și 12.11.2026 (sursa: "v1"). false = timp estimat, neverificat. */
"use strict";

const VIDEO = {
  /* ---- Upper A ---- */
  "inc-db-press":              { id: "lVDrlOw3gcQ", start: 103, end: 114, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "cs-row-neutral":            { id: "8r-lqewUNUY", start: 142, end: 160, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "db-shoulder-press-neutral": { id: "EuQKG2t9iQU", start: 3, end: 33, autor: "Louis Guarino", verificat: true },
  "pulldown-neutral":          { id: "lmmShS3KLB4", start: 9, end: 33, autor: "Matt Klingler", verificat: true },
  "cable-lat-raise-1":         { id: "lVDrlOw3gcQ", start: 167, end: 178, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "triceps-rope-pushdown":     { id: "lVDrlOw3gcQ", start: 186, end: 197, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "face-pull":                 { id: "7z65m-qWJrA", start: 15, end: 45, autor: "Horton Barbell", verificat: true },

  /* ---- Lower A ---- */
  "leg-press-high":            { id: "2Qr4T_Y-s00", start: 0, end: 21, autor: "Joey Gast", verificat: true },
  "db-rdl":                    { id: "R8BRgzRE7yU", start: 136, end: 152, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "leg-curl-seated":           { id: "R8BRgzRE7yU", start: 156, end: 168, autor: "Average To Jacked", verificat: true },
  "step-up-low":               { id: "Jyzc7eK74Ho", start: 6, end: 40, autor: "Danny Nichols Fitness", verificat: true },
  "calf-standing":             { id: "ucy86plaufg", start: 9, end: 33, autor: "MenoMojo", verificat: true },
  "hip-abduction":             { id: "5O_Y9l__iao", start: 60, end: 96, autor: "Hammer Fitness", verificat: true },
  "pallof-press":              { id: "B3rvNN17Svc", start: 9, end: 26, autor: "GHF Training", verificat: true },
  "dead-bug":                  { id: "vWGVXZltbqE", start: 24, end: 48, autor: "Coury & Buehler Physical Therapy", verificat: true },

  /* ---- Upper B ---- */
  "pullup-neutral":            { id: "cd_38C6LuvY", start: 0, end: 8, autor: "OPEX Fitness", verificat: true },
  "machine-chest-press":       { id: "B-zyH8OTlsg", start: 57, end: 80, autor: "Hammer Fitness", verificat: true },
  "cable-row-1arm":            { id: "SqlsitqMeMs", start: 60, end: 95, autor: "Hammer Fitness", verificat: true },
  "db-bench-neutral":          { id: "Lj57a6xk7l0", start: 0, end: 5, autor: "Osamoje", verificat: true },
  "rear-delt-fly":             { id: "8r-lqewUNUY", start: 170, end: 188, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "hammer-curl":               { id: "YqVNxuYVIow", start: 232, end: 250, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "triceps-overhead-rope":     { id: "jioCqlKKrJc", start: 3, end: 30, autor: "Live Lean TV Daily Exercises", verificat: true },

  /* ---- Lower B ---- */
  "hip-thrust":                { id: "NDlzVV-UCHE", start: 0, end: 13, autor: "Steev", verificat: true },
  "hack-squat":                { id: "hglQExHCM9Q", start: 48, end: 76, autor: "Vivian Ngo (Team Evolve)", verificat: true },
  "leg-curl-lying":            { id: "3gZm9wGTsEo", start: 0, end: 24, autor: "FIT.nl", verificat: true },
  "leg-ext-partial":           { id: "jaoyCag-VGU", start: 9, end: 33, autor: "FitWorkz", verificat: true },
  "split-squat":               { id: "Wcmg-3iHwjQ", start: 0, end: 7, autor: "OPEX Fitness", verificat: true },
  "calf-seated":               { id: "R8BRgzRE7yU", start: 213, end: 226, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "plank-weighted":            { id: "cnBD9oWwiZQ", start: 30, end: 51, autor: "Jenny LaBaw", verificat: true },
  "suitcase-carry":            { id: "CgJup_IrnCw", start: 0, end: 5, autor: "Steev", verificat: true },

  /* ---- Trunchi (sâmbătă) ---- */
  "bird-dog":                  { id: "NdIxQGpGvWA", start: 0, end: 7, autor: "Atrius Health", verificat: true },
  "side-plank":                { id: "55OHhZgu-og", start: 42, end: 60, autor: "Rx Rehab", verificat: true },
  "farmer-carry":              { id: "AXOrMG1rwu0", start: 64, end: 96, autor: "Travis Tarrant", verificat: true },

  /* ---- Înlocuitori ---- */
  "glute-bridge":              { id: "tqp5XQPpTxY", start: 0, end: 18, autor: "PureGym", verificat: true },
  "back-ext-45":               { id: "a2UrKheEcIc", start: 0, end: 30, autor: "ThriveTraining", verificat: true },
  "quad-iso-60":               { id: "KtpD_VaK5lM", start: 9, end: 28, autor: "BSR Physical Therapy", verificat: true },
  "spanish-squat":             { id: "VltrVzeGmcM", start: 15, end: 45, autor: "MANA Performance Therapy", verificat: true },
  "goblet-squat":              { id: "xIU3-8WqasQ", start: 0, end: 5, autor: "Steev", verificat: true },
  "reverse-lunge":             { id: "Q2k3kYbtOcI", start: 0, end: 7, autor: "OPEX Fitness", verificat: true },
  "landmine-press":            { id: "dV9Amo1B2eY", start: 3, end: 33, autor: "Pike Fitness", verificat: true },
  "machine-shoulder-press":    { id: "DD_N1OvKSQc", start: 0, end: 30, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "pulldown-wide":             { id: "8r-lqewUNUY", start: 113, end: 130, autor: "Average To Jacked", verificat: true, sursa: "v1" },
  "db-lateral-raise":          { id: "Y29xKcze8Ik", start: 60, end: 90, autor: "Physique Development", verificat: true },
  "cable-hammer-curl":         { id: "BnFjdVxV8hw", start: 3, end: 17, autor: "MuscleSquad", verificat: true },
  "monster-walk":              { id: "hE4UsbLMjC8", start: 130, end: 160, autor: "Clench Fitness", verificat: true },

  /* ---- Încălzire ---- */
  "cat-cow":                   { id: "9be19kZMqm8", start: 3, end: 19, autor: "White House Clinic", verificat: true },
  "open-book":                 { id: "aFUhPd7cEGk", start: 0, autor: "Gotham Physical Therapy", verificat: true, sursa: "v1" },
  "chin-tuck":                 { id: "qfYcLXhCjWw", start: 24, end: 57, autor: "Potomac Valley Orthopaedic Associates", verificat: true },
  "neck-rotation":             { id: "ZgeO87_VFog", start: 0, end: 27, autor: "Rehab My Patient", verificat: true },
  "band-pull-apart":           { id: "Xg58d9lDWME", start: 0, autor: "Catalyst Athletics", verificat: true, sursa: "v1" },
  "dislocates":                { id: "th1CUY49IzY", start: 3, end: 27, autor: "Testosterone Nation", verificat: true },
  "band-external-rotation":    { id: "ybNV36DoRfY", start: 0, autor: "Rehab My Patient", verificat: true, sursa: "v1" },
  "wrist-circles":             { id: "IJvS9bYl_cs", start: 6, end: 36, autor: "Blind Athletes Exercise", verificat: true },
  "wrist-extensor":            { id: "267XvJCphr0", start: 0, autor: "LuWellness", verificat: true, sursa: "v1" },
  "hip-9090":                  { id: "nWBKgtVjIjE", start: 3, end: 22, autor: "Rehab My Patient", verificat: true },
  "leg-swing-front":           { id: "UN9j_8l3keM", start: 0, autor: "The Sustainable Training Method", verificat: true, sursa: "v1" },
  "ankle-rocks":               { id: "Hm_Iu72bJJg", start: 0, end: 9, autor: "80/20 Endurance", verificat: true },
  "tke":                       { id: "LiIfnOzsq7g", start: 36, end: 58, autor: "Straight Up Spine and Posture", verificat: true },

  /* ---- Răcire ---- */
  "hip-flexor":                { id: "F55tzqJggAY", start: 0, autor: "Cara Giusti, PT, DPT", verificat: true, sursa: "v1" },
  "hamstring-strap":           { id: "Il1L75v6gq0", start: 9, end: 36, autor: "AskDoctorJo", verificat: true },
  "figure-4":                  { id: "-g0nuyTHMrI", start: 0, autor: "AskDoctorJo", verificat: true, sursa: "v1" },
  "quad-prone-strap":          { id: "fyJBWW4pNxA", start: 24, end: 45, autor: "Coury & Buehler Physical Therapy", verificat: true },
  "wall-calf":                 { id: "a_R_wUS4qac", start: 0, autor: "Smart PT Pro", verificat: true, sursa: "v1" },
  "doorway-pec":               { id: "069o76BafTk", start: 24, end: 51, autor: "OMPT Specialists", verificat: true },
  "bench-lat":                 { id: "UCV-zQkKYBY", start: 0, autor: "Henry Halse", verificat: true, sursa: "v1" },
  "trap-levator":              { id: "MiJ2FjQt6xY", start: 9, end: 31, autor: "Heatrick Muay Thai Performance", verificat: true },
  "breathing-9090":            { id: "DKdIY5GX1As", start: 0, end: 24, autor: "Train With Cuz", verificat: true },

  /* ---- Mobilitate ---- */
  "foam-thoracic":             { id: "9Y11Kc0E0og", start: 0, end: 36, autor: "Rehab My Patient", verificat: true },
  "wall-slides":               { id: "Zlb9wpXgNuI", start: 15, end: 45, autor: "Therapeutic Innovations Physical Therapy", verificat: true },
  "hip-cars":                  { id: "xRUhU6D2w3o", start: 0, end: 7, autor: "Zion Physical Therapy", verificat: true },
  "couch-stretch":             { id: "B8ABCwZaSyM", start: 36, end: 60, autor: "Your House Fitness", verificat: true },
  "wgs":                       { id: "-CiWQ2IvY34", start: 6, end: 36, autor: "Squat University", verificat: true },
  "knee-to-wall":              { id: "uippmmTdoWw", start: 0, autor: "Union Physical Therapy", verificat: true, sursa: "v1" }
};
