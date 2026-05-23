import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  Syringe,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

// ─── Mizzou palette ─────────────────────────────────────────────────────────
const GOLD = "#F1B82D";
const GOLD_DEEP = "#B8860B";
const BLACK = "#000000";
const INK = "#1a1a1a";
const CREAM = "#FAF8F2";
const RULE = "#E5E0D2";
const MUTED = "#6b6b6b";
const DANGER = "#B91C1C";
const DANGER_DEEP = "#7F1D1D";

const MEDIA = (file) => `${import.meta.env.BASE_URL}nerve_blocks/${file}`;

// Per-file attribution. Full source URLs + license terms live in ATTRIBUTIONS.md.
// All original nerve_* media is credited to The POCUS Atlas (CC BY-NC-ND 4.0).
// The entries below are the only exceptions — supplementary home-screen
// thumbnails sourced from Wikimedia Commons / open-access journals, which
// are verifiably NOT from The POCUS Atlas and keep their true attribution.
const MEDIA_CREDITS = {
  "wiki_femoral_block_photo.jpg": "PhilippN · CC BY-SA 3.0 (Wikimedia Commons)",
  "wiki_median_anatomy.jpg": "Wikimedia Commons · CC BY-SA",
  "wiki_ulnar_anatomy_alt2.png": "BruceBlaus · CC BY-SA 4.0 (Wikimedia Commons)",
  "wiki_sciatic_anatomy.svg": "Wikimedia Commons · CC BY-SA",
  "pmc_peng_sonoanatomy.jpg": "Ain-Shams J Anesthesiol 2022 · CC BY 4.0",
  "pmc_adductor_canal_sonoanatomy.jpg": "Reg Anesth Pain Med 2017 · CC BY-NC-ND 4.0",
};

const POCUS_ATLAS_CREDIT = "The POCUS Atlas · CC BY-NC-ND 4.0";

function mediaCredit(file) {
  if (!file) return null;
  // Externally sourced home-screen thumbnails keep their true origin.
  if (MEDIA_CREDITS[file]) return MEDIA_CREDITS[file];
  // All original nerve_* media (clips + probe photos) is The POCUS Atlas.
  return POCUS_ATLAS_CREDIT;
}

// Dedup all credits used by a block (covers thumbnail-only sourced images).
function blockCredits(block) {
  const files = [
    block.media.probe,
    block.media.anatomy,
    block.media.block,
    block.media.thumbnail,
  ].filter(Boolean);
  return [...new Set(files.map(mediaCredit))];
}

// ─── Local anesthetic agents ────────────────────────────────────────────────
// ASRA 2020 / NYSORA reference values. mg/kg uses lean/ideal body weight.
// Caps from package inserts; clinically most regional services use lower caps.
const LA_AGENTS = [
  {
    id: "bupi-025",
    label: "Bupivacaine 0.25%",
    concMgPerMl: 2.5,
    mgPerKg: 2,
    mgPerKgEpi: 3,
    capMg: 175,
    capMgEpi: 225,
    epiCompatible: true,
    onset: "15–30 min",
    duration: "8–16 h",
  },
  {
    id: "bupi-05",
    label: "Bupivacaine 0.5%",
    concMgPerMl: 5,
    mgPerKg: 2,
    mgPerKgEpi: 3,
    capMg: 175,
    capMgEpi: 225,
    epiCompatible: true,
    onset: "15–30 min",
    duration: "10–18 h",
  },
  {
    id: "ropi-05",
    label: "Ropivacaine 0.5%",
    concMgPerMl: 5,
    mgPerKg: 3,
    mgPerKgEpi: 3,
    capMg: 200,
    capMgEpi: 200,
    epiCompatible: false,
    onset: "10–20 min",
    duration: "6–14 h",
  },
  {
    id: "lido-1",
    label: "Lidocaine 1%",
    concMgPerMl: 10,
    mgPerKg: 4.5,
    mgPerKgEpi: 7,
    capMg: 300,
    capMgEpi: 500,
    epiCompatible: true,
    onset: "5–15 min",
    duration: "1.5–3 h",
  },
  {
    id: "lido-2",
    label: "Lidocaine 2%",
    concMgPerMl: 20,
    mgPerKg: 4.5,
    mgPerKgEpi: 7,
    capMg: 300,
    capMgEpi: 500,
    epiCompatible: true,
    onset: "5–10 min",
    duration: "1.5–3 h",
  },
];

// ─── Block data ─────────────────────────────────────────────────────────────
const BLOCKS = [
  // UPPER EXTREMITY
  {
    id: "interscalene",
    name: "Interscalene",
    region: "Upper extremity",
    indication: "Shoulder, clavicle, proximal humerus",
    coverage: {
      nerves: ["Brachial plexus roots/trunks (upper, middle)", "Suprascapular", "Axillary"],
      roots: "C5–C7 (spares C8–T1 → ulnar territory)",
    },
    media: {
      anatomy: "nerve_interscalene_anatomy.mp4",
      block: "nerve_interscalene_block.mp4",
      probe: "nerve_interscalene_probe.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 15,
    positioning: "Supine, head turned ~45° to contralateral side. Slight HOB elevation.",
    probe: "Linear high-frequency (10–15 MHz). Place transversely at level of cricoid, lateral to SCM.",
    landmarks: [
      "Sternocleidomastoid (SCM) laterally",
      "Anterior scalene (AS) and middle scalene (MS) muscles",
      "Brachial plexus roots/trunks between AS and MS — the 'stoplight' (3 round hypoechoic structures)",
    ],
    technique: [
      "Scan from supraclavicular fossa cephalad until plexus elements ('stoplight') appear between AS and MS.",
      "Lateral-to-medial in-plane approach from posterolateral neck.",
      "Advance through middle scalene; target is between C5 and C6 nerve roots.",
      "Aspirate every 3–5 mL. Inject in 5 mL aliquots, watching spread surround the plexus.",
    ],
    endpoint: "Spread between AS and MS, encircling C5–C6 roots/superior trunk. Avoid intraneural injection.",
    pearls: [
      "Hand surgery? Use supraclavicular instead — interscalene spares C8–T1 (ulnar territory).",
      "100% ipsilateral phrenic palsy at standard volumes — counsel patient.",
      "Use lowest effective volume (10–15 mL) to reduce phrenic spread.",
    ],
    pitfalls: [
      "Avoid in severe COPD, contralateral phrenic palsy, contralateral pneumonectomy.",
      "Vertebral artery and pleura nearby — keep needle tip visualized at all times.",
      "Horner syndrome and recurrent laryngeal nerve block are common, transient.",
    ],
  },
  {
    id: "supraclavicular",
    name: "Supraclavicular",
    region: "Upper extremity",
    indication: "Elbow, forearm, hand ('spinal of the arm')",
    coverage: {
      nerves: ["Entire brachial plexus (trunks/divisions)"],
      roots: "C5–T1 — full upper extremity below shoulder",
    },
    media: {
      anatomy: "nerve_supraclavicular_anatomy.mp4",
      block: "nerve_supraclavicular_block.mp4",
      probe: "nerve_supraclavicular_probe.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 20,
    positioning: "Supine, head turned away. Pillow under shoulders helps lift clavicle.",
    probe: "Linear, placed in supraclavicular fossa angled caudad. Identify subclavian artery on top of 1st rib.",
    landmarks: [
      "Subclavian artery (pulsatile, hypoechoic)",
      "First rib (bright hyperechoic line with shadow) — DO NOT cross",
      "Pleura (sliding line) — deep to and lateral to 1st rib",
      "Brachial plexus 'cluster of grapes' superolateral to artery",
    ],
    technique: [
      "Lateral-to-medial in-plane. Needle stays parallel to and superficial to the 1st rib.",
      "Target the 'corner pocket' — between subclavian artery and 1st rib — first.",
      "Then redirect to deposit around the plexus cluster superolateral to artery.",
      "Aspirate frequently. Avoid pushing needle below the rib line.",
    ],
    endpoint: "Donut of LA around plexus and in corner pocket. Aim for circumferential spread.",
    pearls: [
      "Fastest-onset upper extremity block. Excellent for elbow → hand.",
      "Lower phrenic palsy risk than interscalene (~30–50%) but not zero.",
      "Use color Doppler to confirm subclavian and identify dorsal scapular/transverse cervical arteries.",
    ],
    pitfalls: [
      "Pneumothorax risk — never advance without tip visualization.",
      "Higher LA volume than interscalene; respect max dose for weight.",
    ],
  },
  {
    id: "median-forearm",
    name: "Median (forearm)",
    region: "Upper extremity",
    indication: "Palmar hand, thumb–ring finger sensory, carpal tunnel territory",
    coverage: {
      nerves: ["Median nerve"],
      roots: "C6–T1 (motor C5–T1 to forearm flexors; sensory to lateral palm and digits 1–3 + radial half of 4)",
    },
    media: {
      anatomy: "nerve_median_anatomy.mp4",
      block: "nerve_median_block.mp4",
      probe: null,
      thumbnail: "wiki_median_anatomy.jpg",
    },
    defaultAgent: "lido-1",
    typicalVolMl: 5,
    positioning: "Supine, arm supinated and abducted on arm board.",
    probe: "Linear high-frequency at mid-forearm volar surface.",
    landmarks: [
      "Median nerve: honeycomb fascicular pattern between FDS and FDP",
      "Identify nerve at wrist crease, then trace proximally to mid-forearm to avoid carpal tunnel anatomy",
      "Radial/ulnar arteries used for orientation",
    ],
    technique: [
      "Identify nerve at wrist, trace proximal to mid-forearm (safer working space).",
      "In-plane lateral-to-medial approach.",
      "Hydrodissect around nerve in 1 mL aliquots until circumferential halo achieved.",
    ],
    endpoint: "Halo of LA surrounding nerve. 3–5 mL usually sufficient.",
    pearls: [
      "Great for hand lacerations, FB removal, abscess I&D in median distribution.",
      "Forearm approach avoids carpal tunnel — safer than wrist block in acute injuries.",
      "Pair with ulnar ± radial for complete hand anesthesia.",
    ],
    pitfalls: [
      "Beware median nerve fascicles look very similar to tendons — wiggle fingers to confirm tendons move and nerve does not.",
      "Avoid intraneural injection — stop and reposition if pressure rises or patient reports paresthesias.",
    ],
  },
  {
    id: "radial-forearm",
    name: "Radial (forearm)",
    region: "Upper extremity",
    indication: "Dorsal hand, dorsal thumb/index web space",
    coverage: {
      nerves: ["Superficial branch of radial nerve"],
      roots: "C5–C8 (sensory to dorsolateral hand and dorsal thumb–index web space)",
    },
    media: {
      anatomy: "nerve_radial_anatomy.mp4",
      block: "nerve_radial_block.jpg",
      probe: null,
      blockIsImage: true,
    },
    defaultAgent: "lido-1",
    typicalVolMl: 5,
    positioning: "Supine, arm pronated for proximal radial or supinated for superficial branch.",
    probe: "Linear high-frequency. Scan mid-forearm proximal to where the nerve splits.",
    landmarks: [
      "Superficial branch of radial nerve adjacent to radial artery in mid/proximal forearm",
      "Deeper PIN (posterior interosseous) branch — avoid",
      "Brachioradialis muscle as superficial landmark",
    ],
    technique: [
      "Identify radial artery; superficial radial nerve lies adjacent (lateral).",
      "In-plane approach, depositing LA around the nerve.",
      "3–5 mL usually adequate.",
    ],
    endpoint: "Hypoechoic halo around superficial radial nerve.",
    pearls: [
      "Combine with median + ulnar for full hand anesthesia.",
      "Radial nerve is small and easy to miss — slow scan, trace from elbow if uncertain.",
    ],
    pitfalls: [
      "Radial artery proximity — aspirate, use color Doppler.",
      "Block video pending — refer to anatomy clip and the still photo until updated.",
    ],
  },
  {
    id: "ulnar",
    name: "Ulnar",
    region: "Upper extremity",
    indication: "Small finger, ulnar half of ring finger, ulnar hand",
    coverage: {
      nerves: ["Ulnar nerve"],
      roots: "C8–T1 (sensory to medial hand, digit 5, ulnar half of digit 4)",
    },
    media: {
      anatomy: "nerve_ulnar_anatomy.mp4",
      block: "nerve_ulnar_block.mp4",
      probe: null,
      thumbnail: "wiki_ulnar_anatomy_alt2.png",
    },
    defaultAgent: "lido-1",
    typicalVolMl: 5,
    positioning: "Supine, arm abducted and supinated.",
    probe: "Linear, mid-forearm on ulnar (volar) aspect — proximal to where nerve joins ulnar artery.",
    landmarks: [
      "Ulnar nerve as honeycomb structure",
      "Block PROXIMAL to where ulnar nerve joins ulnar artery (mid-forearm) to avoid vascular puncture",
      "FCU (flexor carpi ulnaris) as superficial landmark",
    ],
    technique: [
      "Identify ulnar nerve at wrist, trace proximally until it separates from ulnar artery.",
      "In-plane approach from radial-to-ulnar side.",
      "Hydrodissect circumferentially with 3–5 mL.",
    ],
    endpoint: "Donut sign around ulnar nerve, away from artery.",
    pearls: [
      "Always block proximal to ulnar artery convergence to avoid intravascular injection.",
      "Use lower volume (3–5 mL) — small target, generous spread risks median spread.",
    ],
    pitfalls: [
      "Ulnar artery laceration — aspirate frequently.",
      "Avoid medial epicondyle approach in ED — higher injury risk and patient-unfriendly position.",
    ],
  },

  // LOWER EXTREMITY
  {
    id: "femoral",
    name: "Femoral",
    region: "Lower extremity",
    indication: "Hip fracture, femur fracture, anterior thigh / knee surgery",
    coverage: {
      nerves: ["Femoral nerve"],
      roots: "L2–L4 (anterior thigh sensation; quadriceps motor; saphenous sensory to medial leg)",
    },
    media: {
      anatomy: null,
      block: "nerve_femoral_block.mp4",
      probe: "wiki_femoral_block_photo.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 20,
    positioning: "Supine, leg slightly externally rotated and abducted.",
    probe: "Linear (curvilinear if obese) at inguinal crease.",
    landmarks: [
      "Femoral artery (pulsatile, round, hypoechoic)",
      "Femoral nerve lateral to artery, hyperechoic and triangular",
      "Fascia iliaca overlies the nerve",
      "Iliopsoas muscle deep to nerve",
    ],
    technique: [
      "Identify femoral artery at crease; nerve sits lateral.",
      "In-plane lateral-to-medial approach.",
      "Pierce fascia iliaca with audible/visible 'pop' — deposit LA between fascia iliaca and iliopsoas, surrounding the nerve.",
      "Aspirate every 3–5 mL.",
    ],
    endpoint: "LA spread under fascia iliaca, surrounding femoral nerve.",
    pearls: [
      "First-line analgesia for hip/femur fractures — reduces opioid use significantly.",
      "Combine with fascia iliaca approach if hip — broader spread to obturator and LFCN.",
      "Excellent for elderly hip fracture patients — reduces delirium risk vs. opioids.",
    ],
    pitfalls: [
      "Avoid intravascular injection into femoral artery — confirm with color Doppler if uncertain.",
      "Quadriceps weakness post-block — patient is fall risk; counsel and document.",
      "Block above inguinal crease (in the canal proper, NOT distal where nerve branches).",
    ],
  },
  {
    id: "fascia-iliaca",
    name: "Fascia Iliaca",
    region: "Lower extremity",
    indication: "Hip fracture, femur fracture (alternative/extension of femoral)",
    coverage: {
      nerves: ["Femoral", "Lateral femoral cutaneous (LFCN)", "Obturator (often)"],
      roots: "L2–L4 — anterior + lateral thigh; variable medial thigh",
    },
    media: {
      anatomy: "nerve_fascia_iliaca_anatomy.mp4",
      block: "nerve_fascia_iliaca_block.mp4",
      probe: "nerve_fascia_iliaca_probe.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 30,
    positioning: "Supine, leg slightly externally rotated.",
    probe: "Linear at inguinal crease; for supra-inguinal approach, place probe parasagittal lateral to femoral vessels and tilt cephalad.",
    landmarks: [
      "Sartorius and internal oblique muscles (supra-inguinal 'bow-tie' view)",
      "Fascia iliaca as bright hyperechoic line over iliacus muscle",
      "Femoral artery medially as reference",
    ],
    technique: [
      "Supra-inguinal approach preferred (better spread to LFCN, obturator).",
      "In-plane caudad-to-cephalad approach. Tip aimed under fascia iliaca.",
      "Pop through fascia; inject 30–40 mL — LA should dissect cephalad and medial.",
      "Hydrodissect with saline first if uncertain about plane.",
    ],
    endpoint: "Large hypoechoic spread under fascia iliaca, peeling fascia off iliacus muscle.",
    pearls: [
      "Volume-dependent: needs 30+ mL for full hip coverage.",
      "Lower vascular puncture risk than femoral approach — good for anticoagulated hip fx patients.",
      "Single injection covers femoral, LFCN, often obturator nerves.",
    ],
    pitfalls: [
      "Failure usually due to inadequate volume or wrong plane (above fascia iliaca).",
      "Use ideal body weight for max dose calc in elderly thin patients.",
    ],
  },
  {
    id: "adductor-canal",
    name: "Adductor Canal (Saphenous)",
    region: "Lower extremity",
    indication: "Medial knee / lower leg sensory, knee surgery analgesia (preserves quad strength)",
    coverage: {
      nerves: ["Saphenous (terminal sensory branch of femoral)", "Nerve to vastus medialis (variable)"],
      roots: "L3–L4 (sensory only — medial knee, medial leg, medial ankle/foot)",
    },
    media: {
      anatomy: null,
      block: "nerve_adductor_canal_saphenous_block.mp4",
      probe: null,
      thumbnail: "pmc_adductor_canal_sonoanatomy.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 15,
    positioning: "Supine, leg slightly externally rotated, knee slightly flexed.",
    probe: "Linear at mid-thigh, medial aspect, between ASIS and patella.",
    landmarks: [
      "Sartorius muscle (superficial)",
      "Femoral artery deep to sartorius (within adductor canal)",
      "Saphenous nerve lateral/anterior to artery",
      "Vastus medialis laterally; adductor longus/magnus medially",
    ],
    technique: [
      "Probe at mid-thigh; identify sartorius and femoral artery beneath.",
      "In-plane lateral-to-medial approach.",
      "Deposit 10–15 mL adjacent to the artery in the canal.",
    ],
    endpoint: "Spread around femoral artery in adductor canal, encircling saphenous nerve.",
    pearls: [
      "QUAD-SPARING — preferred over femoral when ambulation matters (knee surgery, outpatient).",
      "Add IPACK for posterior knee coverage in total knee analgesia.",
      "Saphenous covers medial leg below knee — useful for medial ankle/foot lacerations.",
    ],
    pitfalls: [
      "Wrong location: blocking too proximally captures the femoral nerve itself → quad weakness.",
      "Confirm you are mid-thigh, not near inguinal crease.",
    ],
  },
  {
    id: "popliteal-sciatic",
    name: "Popliteal Sciatic",
    region: "Lower extremity",
    indication: "Foot and ankle, distal lower leg (sparing medial leg = saphenous)",
    coverage: {
      nerves: ["Tibial nerve", "Common peroneal (fibular) nerve"],
      roots: "L4–S3 — posterior leg, dorsum + sole of foot (spares medial leg = saphenous)",
    },
    media: {
      anatomy: null,
      block: "nerve_popliteal_sciatic_block.mp4",
      probe: "nerve_popliteal_sciatic_probe.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 20,
    positioning: "Prone or lateral. Knee slightly flexed.",
    probe: "Linear in popliteal fossa, transverse.",
    landmarks: [
      "Popliteal artery and vein (deep)",
      "Tibial nerve (more medial) and common peroneal (more lateral) — converge into sciatic ~5–10 cm above popliteal crease",
      "Block at the bifurcation or just proximal where they form a single sciatic structure",
    ],
    technique: [
      "Identify tibial/peroneal at popliteal crease, scan cephalad until they fuse into sciatic.",
      "In-plane lateral-to-medial approach.",
      "Deposit 15–20 mL around the sciatic (just at or proximal to bifurcation).",
      "Watch for circumferential spread.",
    ],
    endpoint: "Hypoechoic donut around sciatic at/proximal to popliteal bifurcation.",
    pearls: [
      "Combine with saphenous/adductor canal for full foot/ankle anesthesia.",
      "Block at bifurcation provides faster onset (LA reaches both divisions directly).",
      "Patient can be lateral if prone is difficult (trauma, pregnancy).",
    ],
    pitfalls: [
      "Common peroneal injury — avoid high-pressure injection.",
      "Foot drop post-block — counsel patient and document.",
    ],
  },
  {
    id: "sciatic",
    name: "Sciatic (subgluteal/anterior)",
    region: "Lower extremity",
    indication: "Posterior thigh, knee, complete lower leg (paired with femoral)",
    coverage: {
      nerves: ["Sciatic nerve (tibial + common peroneal divisions)", "Posterior femoral cutaneous (often)"],
      roots: "L4–S3 — posterior thigh, complete leg/foot below knee (spares medial leg)",
    },
    media: {
      anatomy: "nerve_sciatic_anatomy.mp4",
      block: null,
      probe: null,
      thumbnail: "wiki_sciatic_anatomy.svg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 20,
    positioning: "Lateral (Sims) for subgluteal; supine with leg flexed/externally rotated for anterior approach.",
    probe: "Curvilinear (deeper structures) at subgluteal fold OR linear/curvilinear at proximal anterior thigh.",
    landmarks: [
      "Subgluteal: sciatic between greater trochanter and ischial tuberosity, deep to gluteus maximus",
      "Anterior: sciatic deep to adductor magnus, medial to femur",
      "Sciatic appears as hyperechoic flat/oval structure",
    ],
    technique: [
      "Subgluteal: in-plane lateral-to-medial through gluteus maximus.",
      "Anterior: in-plane medial-to-lateral, very deep approach.",
      "Deposit 15–20 mL around the nerve.",
    ],
    endpoint: "LA spread around sciatic at chosen level.",
    pearls: [
      "Use for procedures above the popliteal fossa.",
      "Anterior approach allows supine positioning — useful in trauma.",
      "Block video pending — refer to anatomy clip and use popliteal sciatic technique as reference for distal block.",
    ],
    pitfalls: [
      "Deep block — needle visualization can be difficult; consider in-plane probe walking.",
      "Long-acting block + foot drop = significant disability; counsel and document.",
    ],
  },
  {
    id: "peng",
    name: "PENG",
    region: "Lower extremity",
    indication: "Hip fracture / hip pain (motor-sparing alternative to femoral)",
    coverage: {
      nerves: ["Articular branches of femoral, obturator, accessory obturator (hip capsule sensory)"],
      roots: "L1–L4 — anterior hip joint capsule (motor-sparing; quad strength preserved)",
    },
    media: {
      anatomy: null,
      block: "nerve_peng_block.mp4",
      probe: null,
      thumbnail: "pmc_peng_sonoanatomy.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 20,
    positioning: "Supine, leg neutral.",
    probe: "Curvilinear, oblique sagittal at the inguinal crease initially, then rotated to identify the pubic ramus.",
    landmarks: [
      "Anterior inferior iliac spine (AIIS) — bright hyperechoic prominence",
      "Iliopubic eminence (IPE)",
      "Psoas tendon (PT) crossing between AIIS and IPE",
      "Femoral artery medially for orientation",
    ],
    technique: [
      "Identify AIIS, then slide medial/caudal until you see the iliopubic eminence and psoas tendon.",
      "Target is the musculofascial plane between psoas tendon and the pubic ramus.",
      "In-plane lateral-to-medial approach.",
      "Deposit 15–20 mL in this plane — should spread along the ramus.",
    ],
    endpoint: "Spread between psoas tendon and pubic ramus, capturing articular branches of femoral, obturator, accessory obturator.",
    pearls: [
      "Motor-sparing — preserves quad strength, lower fall risk than femoral.",
      "Best for hip fracture, especially geriatric — combines well with fascia iliaca if posterior coverage needed.",
      "Targets sensory articular branches of the hip joint capsule.",
    ],
    pitfalls: [
      "Femoral nerve nearby — accidental spread can still cause quad weakness.",
      "Operator-dependent — learning curve steeper than fascia iliaca.",
    ],
  },

  // TRUNK
  {
    id: "serratus-anterior",
    name: "Serratus Anterior",
    region: "Trunk",
    indication: "Rib fractures (T2–T9), chest wall trauma, mastectomy/thoracotomy analgesia",
    coverage: {
      nerves: ["Lateral cutaneous branches of intercostal nerves", "Long thoracic", "Thoracodorsal (deep plane)"],
      roots: "T2–T9 dermatomes — lateral and anterior hemithorax",
    },
    media: {
      anatomy: "nerve_serratus_anterior_anatomy.mp4",
      block: "nerve_serratus_anterior_block.mp4",
      probe: "nerve_serratus_anterior_probe.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 30,
    positioning: "Supine with ipsilateral arm abducted/overhead, or lateral decubitus.",
    probe: "Linear at the mid-axillary line, 4th–5th rib level.",
    landmarks: [
      "Latissimus dorsi (superficial)",
      "Serratus anterior (deep to lat)",
      "Ribs (hyperechoic with shadow) and pleura (sliding) below",
    ],
    technique: [
      "Identify 4th/5th rib at mid-axillary line.",
      "In-plane posterior-to-anterior or anterior-to-posterior approach.",
      "Superficial plane: between latissimus dorsi and serratus anterior (most common).",
      "Inject 30–40 mL — should dissect along the fascial plane.",
    ],
    endpoint: "LA hydrodissecting fascial plane between lat dorsi and serratus.",
    pearls: [
      "Workhorse rib fracture block in EM — single shot covers multiple dermatomes (T2–T9).",
      "Lower complication risk than paravertebral or epidural.",
      "Catheter placement option for ongoing flail/multiple rib fx admission.",
    ],
    pitfalls: [
      "Pneumothorax — keep needle tip ALWAYS visualized above the rib/pleura.",
      "Volume-dependent for full coverage — don't skimp.",
      "Doesn't cover anterior chest below ~T2; pair with PECS or use ESP for posterior fractures.",
    ],
  },
  {
    id: "erector-spinae",
    name: "Erector Spinae (ESP)",
    region: "Trunk",
    indication: "Rib fractures (posterior/lateral), thoracic/abdominal pain, back trauma",
    coverage: {
      nerves: ["Dorsal + ventral rami of thoracic spinal nerves at injected level"],
      roots: "Multi-level dermatomal coverage (typically 3–4 levels above/below injection; T5 ≈ T2–T9 with 30 mL)",
    },
    media: {
      anatomy: "nerve_erector_spinae_anatomy.mp4",
      block: "nerve_erector_spinae_block.mp4",
      probe: "nerve_erector_spinae_probe.jpg",
    },
    defaultAgent: "ropi-05",
    typicalVolMl: 25,
    positioning: "Sitting, lateral, or prone. Sitting is easiest in ED.",
    probe: "Linear or curvilinear, parasagittal orientation, ~3 cm lateral to spinous processes at desired level (typically T5 for rib fx).",
    landmarks: [
      "Transverse process — square/flat hyperechoic structure with shadow (NOT rounded like a rib)",
      "Erector spinae muscle group superficial to TP",
      "Trapezius and rhomboid major superficial to erectors",
    ],
    technique: [
      "Identify the transverse process at the target level (T5 for mid rib coverage).",
      "In-plane cephalad-to-caudad approach.",
      "Advance tip to contact the transverse process — bone is your safety stop.",
      "Inject between erector spinae muscle and TP. Hydrodissect with saline first to confirm plane.",
      "Inject 20–30 mL — should spread cephalad/caudad along multiple levels.",
    ],
    endpoint: "LA lifting erector spinae off the transverse process, spreading several levels.",
    pearls: [
      "Posterior approach — useful when rib fx pain is posterolateral (where serratus may miss).",
      "TP is bone — bone-contact stops your needle, lowering pneumothorax/neuraxial risk vs. paravertebral.",
      "Single-shot covers 3–4 dermatomes; catheter possible.",
    ],
    pitfalls: [
      "Don't mistake rib for transverse process — rib is rounded with continuous pleura beyond; TP is flat/square with deeper shadow.",
      "Too lateral = subcutaneous injection (no block); too medial = neuraxial risk.",
    ],
  },
];

// Home screen is ordered easiest → hardest. Difficulty = target depth,
// landmark obviousness, danger of adjacent structures, consequence of failure.
const TIERS = [
  {
    name: "Foundational",
    blurb: "Superficial, forgiving, low-risk — learn these first",
    ids: ["fascia-iliaca", "femoral", "serratus-anterior"],
  },
  {
    name: "Core",
    blurb: "Everyday workhorse blocks — superficial, modest landmark ID",
    ids: ["adductor-canal", "erector-spinae", "median-forearm", "ulnar", "radial-forearm"],
  },
  {
    name: "Advanced",
    blurb: "Deeper targets, more landmark recognition required",
    ids: ["peng", "popliteal-sciatic", "sciatic"],
  },
  {
    name: "Expert",
    blurb: "High stakes — pleura, phrenic, or vascular proximity",
    ids: ["supraclavicular", "interscalene"],
  },
];

const BLOCK_BY_ID = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

// ─── LA calc helpers ────────────────────────────────────────────────────────
function calcMaxDose(agent, weightKg, withEpi) {
  const mgPerKg = withEpi && agent.epiCompatible ? agent.mgPerKgEpi : agent.mgPerKg;
  const cap = withEpi && agent.epiCompatible ? agent.capMgEpi : agent.capMg;
  const totalMg = Math.min(weightKg * mgPerKg, cap);
  const totalMl = totalMg / agent.concMgPerMl;
  return { totalMg, totalMl, cappedByWeight: weightKg * mgPerKg < cap };
}

// ─── UI primitives ──────────────────────────────────────────────────────────
function Pill({ children, color = GOLD, dark = false }) {
  return (
    <span
      className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
      style={{
        background: dark ? color : `${color}22`,
        color: dark ? "#fff" : GOLD_DEEP,
        border: `1px solid ${color}66`,
      }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, children, color = GOLD_DEEP }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-2">
      {Icon ? <Icon size={18} style={{ color }} /> : null}
      <h3
        className="font-display font-bold text-lg"
        style={{ color: INK, letterSpacing: "-0.01em" }}
      >
        {children}
      </h3>
    </div>
  );
}

function MediaCaption({ children, credit }) {
  return (
    <div className="mt-1.5 flex items-baseline justify-between gap-3 flex-wrap">
      <span className="text-xs italic" style={{ color: MUTED }}>
        {children}
      </span>
      {credit && (
        <span className="text-[10px] not-italic shrink-0" style={{ color: MUTED, opacity: 0.7 }}>
          {credit}
        </span>
      )}
    </div>
  );
}

// ─── LA Calculator ──────────────────────────────────────────────────────────
function LACalculator({ defaultAgentId, typicalVolMl }) {
  const [weight, setWeight] = useState(70);
  const [agentId, setAgentId] = useState(defaultAgentId || "ropi-05");
  const [withEpi, setWithEpi] = useState(false);
  const [open, setOpen] = useState(true);

  const agent = useMemo(
    () => LA_AGENTS.find((a) => a.id === agentId) || LA_AGENTS[0],
    [agentId]
  );
  const { totalMg, totalMl, cappedByWeight } = useMemo(
    () => calcMaxDose(agent, weight, withEpi),
    [agent, weight, withEpi]
  );

  const overTypical = typicalVolMl > totalMl;
  const fillPct = Math.min(100, (typicalVolMl / totalMl) * 100);

  return (
    <div
      className="rounded-xl mt-4"
      style={{ border: `1px solid ${RULE}`, background: "#fff" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: GOLD, borderRadius: "0.75rem 0.75rem 0 0" }}
      >
        <span className="font-display font-bold text-base" style={{ color: BLACK }}>
          LA max-dose calculator
        </span>
        {open ? <ChevronUp size={18} color={BLACK} /> : <ChevronDown size={18} color={BLACK} />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {/* Weight */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
              Patient weight (kg)
            </label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min={5}
                max={150}
                step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="flex-1 accent-yellow-500"
              />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, Number(e.target.value) || 0))}
                className="w-20 px-2 py-1 rounded text-right font-semibold"
                style={{ border: `1px solid ${RULE}` }}
              />
            </div>
          </div>

          {/* Agent */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
              Agent
            </label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {LA_AGENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAgentId(a.id)}
                  className="text-sm py-2 px-2 rounded font-semibold text-left"
                  style={{
                    background: agentId === a.id ? BLACK : "#fff",
                    color: agentId === a.id ? GOLD : INK,
                    border: `1px solid ${agentId === a.id ? BLACK : RULE}`,
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Epi toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withEpi}
              onChange={(e) => setWithEpi(e.target.checked)}
              disabled={!agent.epiCompatible}
              className="accent-yellow-500"
            />
            <span style={{ color: agent.epiCompatible ? INK : MUTED }}>
              With epinephrine{!agent.epiCompatible ? " (no benefit for this agent)" : ""}
            </span>
          </label>

          {/* Result */}
          <div
            className="rounded-lg p-3"
            style={{ background: CREAM, border: `1px solid ${RULE}` }}
          >
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: MUTED }}>
                Max safe dose
              </span>
              <span className="text-xs" style={{ color: MUTED }}>
                {cappedByWeight ? "weight-limited" : "package cap reached"}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-4">
              <span className="font-display font-bold text-2xl" style={{ color: BLACK }}>
                {totalMg.toFixed(0)} mg
              </span>
              <span className="text-lg font-semibold" style={{ color: GOLD_DEEP }}>
                = {totalMl.toFixed(1)} mL of {agent.label.split(" ")[1]}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: MUTED }}>
              Onset {agent.onset} · Duration {agent.duration}
            </div>

            {/* Visual headroom bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px]" style={{ color: MUTED }}>
                <span>Typical block volume: {typicalVolMl} mL</span>
                <span>Max: {totalMl.toFixed(1)} mL</span>
              </div>
              <div
                className="mt-1 h-2.5 rounded-full overflow-hidden"
                style={{ background: RULE }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${fillPct}%`,
                    background: overTypical ? DANGER : GOLD,
                    transition: "width 200ms ease",
                  }}
                />
              </div>
            </div>

            {overTypical && (
              <div
                className="mt-3 p-2 rounded text-sm font-semibold flex items-start gap-2"
                style={{ background: `${DANGER}10`, color: DANGER, border: `1px solid ${DANGER}55` }}
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>
                  Typical block volume ({typicalVolMl} mL) exceeds calculated max for this patient.
                  Use lower concentration or reduce volume.
                </span>
              </div>
            )}
          </div>

          <div className="text-[11px]" style={{ color: MUTED }}>
            Use ideal/lean body weight in obese patients. Caps from package inserts; clinical practice often uses lower
            ceilings, especially in elderly/cachectic patients. Always aspirate; inject in aliquots.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Home Page ──────────────────────────────────────────────────────────────
function Home({ onSelect, onLast }) {
  const [openTiers, setOpenTiers] = useState(() =>
    Object.fromEntries(TIERS.map((t) => [t.name, true]))
  );
  const toggleTier = (name) =>
    setOpenTiers((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="page-enter-forward" style={{ minHeight: "100vh", background: CREAM }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: BLACK,
          borderBottom: `3px solid ${GOLD}`,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h1
                className="font-display font-black text-3xl leading-none tracking-tight"
                style={{ color: GOLD }}
              >
                Nerve Blocks
              </h1>
              <p className="text-xs mt-1 uppercase tracking-[0.18em]" style={{ color: "#d6d3c8" }}>
                Mizzou EM · Peripheral block reference
              </p>
            </div>
            <button
              onClick={onLast}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md font-bold text-sm"
              style={{ background: DANGER, color: "#fff" }}
            >
              <AlertTriangle size={16} />
              LAST
            </button>
          </div>
        </div>
      </header>

      <main
        className="max-w-3xl mx-auto px-4 pt-6"
        style={{ paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" }}
      >
        {TIERS.map((tier, ti) => {
          const blocks = tier.ids.map((id) => BLOCK_BY_ID[id]).filter(Boolean);
          const isOpen = openTiers[tier.name];
          return (
            <section key={tier.name} className="mb-8">
              <button
                onClick={() => toggleTier(tier.name)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 mb-1 text-left"
              >
                <h2
                  className="font-display font-bold text-xl"
                  style={{ color: INK }}
                >
                  <span
                    className="inline-block mr-2 text-sm font-bold align-middle rounded px-1.5 py-0.5"
                    style={{ background: GOLD, color: BLACK }}
                  >
                    {ti + 1}
                  </span>
                  {tier.name}
                </h2>
                <div className="flex-1 h-px" style={{ background: GOLD }} />
                <span className="text-xs" style={{ color: MUTED }}>
                  {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
                </span>
                {isOpen ? (
                  <ChevronUp size={20} style={{ color: GOLD_DEEP }} />
                ) : (
                  <ChevronDown size={20} style={{ color: GOLD_DEEP }} />
                )}
              </button>
              {isOpen && (
                <>
                  <p className="text-xs mb-3 ml-9" style={{ color: MUTED }}>
                    {tier.blurb}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {blocks.map((b) => (
                      <BlockCard key={b.id} block={b} onClick={() => onSelect(b.id)} />
                    ))}
                  </div>
                </>
              )}
            </section>
          );
        })}

        <footer className="text-center mt-12 text-xs" style={{ color: MUTED }}>
          Reference tool. Always correlate with patient anatomy, comorbidities, and institutional protocols.
        </footer>
      </main>
    </div>
  );
}

function BlockCard({ block, onClick }) {
  const thumbSrc = block.media.probe
    ? MEDIA(block.media.probe)
    : block.media.thumbnail
    ? MEDIA(block.media.thumbnail)
    : block.media.blockIsImage && block.media.block
    ? MEDIA(block.media.block)
    : null;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl overflow-hidden transition-transform active:scale-[0.98]"
      style={{ background: "#fff", border: `1px solid ${RULE}`, boxShadow: "0 1px 0 rgba(0,0,0,0.03)" }}
    >
      <div
        className="aspect-[16/10] flex items-center justify-center"
        style={{ background: thumbSrc ? "#000" : `${GOLD}18` }}
      >
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={`${block.name} probe`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Activity size={36} style={{ color: GOLD_DEEP }} />
        )}
      </div>
      <div className="p-3">
        <div
          className="font-display font-bold text-base leading-tight"
          style={{ color: INK }}
        >
          {block.name}
        </div>
        <div className="text-xs mt-1" style={{ color: MUTED }}>
          {block.indication}
        </div>
      </div>
    </button>
  );
}

// ─── Block Detail Page ──────────────────────────────────────────────────────
function BlockDetail({ block, onBack, onLast }) {
  const defaultAgent = LA_AGENTS.find((a) => a.id === block.defaultAgent) || LA_AGENTS[0];

  return (
    <div className="page-enter-forward" style={{ minHeight: "100vh", background: CREAM }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: BLACK,
          borderBottom: `3px solid ${GOLD}`,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm font-semibold"
            style={{ color: GOLD }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-lg truncate" style={{ color: GOLD }}>
              {block.name}
            </div>
            <div className="text-[11px] uppercase tracking-wider truncate" style={{ color: "#d6d3c8" }}>
              {block.region} · {block.indication}
            </div>
          </div>
        </div>
      </header>

      <main
        className="max-w-3xl mx-auto px-4 pt-4"
        style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
      >
        {/* TL;DR */}
        <div
          className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ background: BLACK, color: "#fff" }}
        >
          <TldrCell label="Typical volume" value={`${block.typicalVolMl} mL`} />
          <TldrCell label="Agent" value={defaultAgent.label} />
          <TldrCell label="Onset" value={defaultAgent.onset} />
          <TldrCell label="Duration" value={defaultAgent.duration} />
        </div>

        {/* Coverage — nerves & roots */}
        {block.coverage && (
          <div
            className="mt-3 rounded-xl p-3"
            style={{ background: "#fff", border: `1px solid ${RULE}` }}
          >
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: GOLD_DEEP }}>
              Coverage
            </div>
            <div className="mt-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                Nerves:&nbsp;
              </span>
              <span className="text-sm" style={{ color: INK }}>
                {block.coverage.nerves.join(" · ")}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                Roots:&nbsp;
              </span>
              <span className="text-sm" style={{ color: INK }}>
                {block.coverage.roots}
              </span>
            </div>
          </div>
        )}

        {/* Calculator */}
        <LACalculator defaultAgentId={block.defaultAgent} typicalVolMl={block.typicalVolMl} />

        {/* Probe & positioning */}
        <SectionTitle icon={Target}>Probe & positioning</SectionTitle>
        <p className="text-sm leading-relaxed" style={{ color: INK }}>
          <strong>Position:</strong> {block.positioning}
        </p>
        <p className="text-sm leading-relaxed mt-2" style={{ color: INK }}>
          <strong>Probe:</strong> {block.probe}
        </p>
        {block.media.probe && (
          <div className="mt-3">
            <img
              src={MEDIA(block.media.probe)}
              alt={`${block.name} probe position`}
              className="w-full rounded-lg"
              style={{ border: `1px solid ${RULE}` }}
            />
            <MediaCaption credit={mediaCredit(block.media.probe)}>Probe placement</MediaCaption>
          </div>
        )}

        {/* Landmarks */}
        <SectionTitle icon={Layers}>Landmarks</SectionTitle>
        <ul className="text-sm space-y-1.5 list-disc pl-5" style={{ color: INK }}>
          {block.landmarks.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>

        {/* Anatomy video */}
        {block.media.anatomy && (
          <>
            <SectionTitle icon={Activity}>Anatomy</SectionTitle>
            <video
              src={MEDIA(block.media.anatomy)}
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-lg"
            />
            <MediaCaption credit={mediaCredit(block.media.anatomy)}>Sonoanatomy overview</MediaCaption>
          </>
        )}

        {/* Technique */}
        <SectionTitle icon={Syringe}>Technique</SectionTitle>
        <ol className="text-sm space-y-2 list-decimal pl-5" style={{ color: INK }}>
          {block.technique.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>

        {/* Block video */}
        {block.media.block && !block.media.blockIsImage && (
          <>
            <SectionTitle icon={Activity}>Block procedure</SectionTitle>
            <video
              src={MEDIA(block.media.block)}
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-lg"
            />
            <MediaCaption credit={mediaCredit(block.media.block)}>Needle approach and injection</MediaCaption>
          </>
        )}
        {block.media.block && block.media.blockIsImage && (
          <>
            <SectionTitle icon={Activity}>Block image</SectionTitle>
            <img
              src={MEDIA(block.media.block)}
              alt={`${block.name} block`}
              className="w-full rounded-lg"
              style={{ border: `1px solid ${RULE}` }}
            />
            <MediaCaption credit={mediaCredit(block.media.block)}>
              Reference image — full procedural video pending
            </MediaCaption>
          </>
        )}
        {!block.media.block && (
          <div
            className="mt-4 p-3 rounded-lg text-sm flex items-start gap-2"
            style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}55`, color: INK }}
          >
            <Info size={16} className="shrink-0 mt-0.5" style={{ color: GOLD_DEEP }} />
            <span>Block video pending — refer to anatomy clip and the technique steps above.</span>
          </div>
        )}

        {/* Endpoint */}
        <SectionTitle icon={Target}>Endpoint</SectionTitle>
        <p className="text-sm leading-relaxed" style={{ color: INK }}>
          {block.endpoint}
        </p>

        {/* Pearls / Pitfalls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div
            className="rounded-lg p-3"
            style={{ background: `${GOLD}14`, border: `1px solid ${GOLD}55` }}
          >
            <div className="font-display font-bold text-sm mb-1.5" style={{ color: GOLD_DEEP }}>
              Pearls
            </div>
            <ul className="text-sm space-y-1.5 list-disc pl-5" style={{ color: INK }}>
              {block.pearls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: `${DANGER}10`, border: `1px solid ${DANGER}44` }}
          >
            <div className="font-display font-bold text-sm mb-1.5" style={{ color: DANGER }}>
              Pitfalls
            </div>
            <ul className="text-sm space-y-1.5 list-disc pl-5" style={{ color: INK }}>
              {block.pitfalls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Media credits */}
        <div
          className="mt-8 pt-3 text-[11px] leading-relaxed"
          style={{ borderTop: `1px solid ${RULE}`, color: MUTED }}
        >
          <span className="font-semibold uppercase tracking-wider">Media</span>{" "}
          {blockCredits(block).join(" · ")}
        </div>
      </main>

      {/* Sticky LAST footer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          background: DANGER,
          borderTop: `2px solid ${DANGER_DEEP}`,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <button
          onClick={onLast}
          className="w-full py-3 flex items-center justify-center gap-2 font-bold text-white text-sm uppercase tracking-wider"
        >
          <AlertTriangle size={18} />
          LAST — recognition & treatment
        </button>
      </div>
    </div>
  );
}

function TldrCell({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: GOLD }}>
        {label}
      </div>
      <div className="font-display font-bold text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

// ─── LAST Page ──────────────────────────────────────────────────────────────
function LastPage({ onBack }) {
  const [weight, setWeight] = useState(70);
  const bolusMl = (1.5 * weight).toFixed(0);
  const infusionMlPerMin = (0.25 * weight).toFixed(1);
  const max30minMl = (12 * weight).toFixed(0);

  return (
    <div className="page-enter-forward" style={{ minHeight: "100vh", background: "#fff" }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: DANGER,
          color: "#fff",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm font-semibold"
            style={{ color: "#fff" }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex-1">
            <div className="font-display font-bold text-lg">LAST</div>
            <div className="text-[11px] uppercase tracking-wider">
              Local anesthetic systemic toxicity · ASRA 2020/21
            </div>
          </div>
          <AlertTriangle size={22} />
        </div>
      </header>

      <main
        className="max-w-3xl mx-auto px-4 pt-4 space-y-6"
        style={{ paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" }}
      >
        <Callout color={DANGER}>
          <strong>Stop injection. Call for help. Get the lipid emulsion.</strong>
        </Callout>

        <section>
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: DANGER }}>
            Recognize
          </h2>
          <ul className="text-sm space-y-1.5 list-disc pl-5">
            <li>
              <strong>CNS prodrome:</strong> perioral numbness, metallic taste, tinnitus, lightheadedness,
              dysarthria, agitation, drowsiness.
            </li>
            <li>
              <strong>CNS progression:</strong> seizures, then coma.
            </li>
            <li>
              <strong>Cardiovascular:</strong> hypertension/tachycardia early → bradycardia, conduction
              block, wide QRS, ventricular arrhythmia, asystole.
            </li>
            <li>
              <strong>Timing:</strong> minutes to 30+ min post-injection. Cardiac arrest can be the
              presenting sign (esp. bupivacaine).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: DANGER }}>
            Initial management
          </h2>
          <ol className="text-sm space-y-2 list-decimal pl-5">
            <li>
              <strong>Stop the LA injection immediately.</strong> Call for help. Request the lipid
              emulsion ("LipidRescue" kit).
            </li>
            <li>
              <strong>Airway:</strong> Ventilate with 100% O₂. Prevent hypoxia, hypercapnia, and
              acidosis — they worsen toxicity. Avoid hyperventilation. Intubate if seizing or obtunded.
            </li>
            <li>
              <strong>Seizure:</strong> benzodiazepine first-line (midazolam 1–2 mg IV). Small doses of
              propofol acceptable if hemodynamically stable; avoid if not.
            </li>
            <li>
              <strong>Cardiac arrest → modified ACLS:</strong> epinephrine in <em>reduced</em> doses
              (≤1 mcg/kg boluses); <strong>avoid</strong> vasopressin, calcium-channel blockers, beta
              blockers, lidocaine, procainamide.
            </li>
            <li>
              <strong>Lipid emulsion 20%</strong> — see dosing below.
            </li>
            <li>
              Persistent cardiovascular collapse → consider <strong>cardiopulmonary bypass / ECMO</strong>{" "}
              early; alert team.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: DANGER }}>
            Lipid emulsion 20% — dose calculator
          </h2>

          <div
            className="rounded-xl p-4"
            style={{ background: `${DANGER}08`, border: `1px solid ${DANGER}44` }}
          >
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
              Lean / ideal body weight (kg)
            </label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min={5}
                max={150}
                step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="flex-1 accent-red-700"
              />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, Number(e.target.value) || 0))}
                className="w-20 px-2 py-1 rounded text-right font-semibold"
                style={{ border: `1px solid ${RULE}` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LastDoseCell
                label="Bolus"
                value={`${bolusMl} mL`}
                detail="1.5 mL/kg over 2–3 min · repeat up to 2× if persistent CV collapse"
              />
              <LastDoseCell
                label="Infusion"
                value={`${infusionMlPerMin} mL/min`}
                detail="0.25 mL/kg/min · double if BP remains low"
              />
              <LastDoseCell
                label="30-min max"
                value={`${max30minMl} mL`}
                detail="12 mL/kg ceiling in first 30 min"
              />
            </div>

            <div className="text-[11px] mt-3" style={{ color: MUTED }}>
              Continue infusion 10 min beyond hemodynamic stability. Bolus is over 2–3 min — do not push.
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: DANGER }}>
            Disposition
          </h2>
          <ul className="text-sm space-y-1.5 list-disc pl-5">
            <li>Monitor for at least 4–6 h after severe events; longer if persistent symptoms.</li>
            <li>ICU admission for any patient requiring lipid emulsion or with cardiac involvement.</li>
            <li>
              Report event: <a className="underline" href="https://www.lipidrescue.org" target="_blank" rel="noreferrer">www.lipidrescue.org</a>{" "}
              and institutional QI.
            </li>
          </ul>
        </section>

        <div className="text-[11px] pt-4" style={{ color: MUTED }}>
          Source: ASRA Practice Advisory on Local Anesthetic Systemic Toxicity (2020 / 2021 update).
          For reference only — defer to institutional protocols and current ASRA guidance.
        </div>
      </main>
    </div>
  );
}

function LastDoseCell({ label, value, detail }) {
  return (
    <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${RULE}` }}>
      <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: DANGER }}>
        {label}
      </div>
      <div className="font-display font-bold text-2xl" style={{ color: BLACK }}>
        {value}
      </div>
      <div className="text-[11px] mt-1" style={{ color: MUTED }}>
        {detail}
      </div>
    </div>
  );
}

function Callout({ color, children }) {
  return (
    <div
      className="rounded-xl p-3 flex items-start gap-2"
      style={{ background: `${color}12`, border: `1px solid ${color}55`, color: INK }}
    >
      <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color }} />
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────
export default function NerveBlockReference() {
  const [view, setView] = useState({ name: "home" });

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [view]);

  if (view.name === "last") {
    return <LastPage onBack={() => setView({ name: "home" })} />;
  }
  if (view.name === "block") {
    const block = BLOCKS.find((b) => b.id === view.id);
    if (!block) return <Home onSelect={(id) => setView({ name: "block", id })} onLast={() => setView({ name: "last" })} />;
    return (
      <BlockDetail
        block={block}
        onBack={() => setView({ name: "home" })}
        onLast={() => setView({ name: "last" })}
      />
    );
  }
  return (
    <Home
      onSelect={(id) => setView({ name: "block", id })}
      onLast={() => setView({ name: "last" })}
    />
  );
}
