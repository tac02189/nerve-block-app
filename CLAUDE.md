# Nerve Block App — Claude Instructions

## Project Overview

Mizzou EM Nerve Block Reference — a React + Vite + Tailwind single-page app for ED ultrasound-guided peripheral nerve blocks. Home grid of 13 blocks grouped by region (upper, lower, trunk) + a dedicated LAST page. Each block page includes a weight-based LA max-dose calculator.

## Stack

- **React 18** + **Vite** — SPA, no router (state-based view switching)
- **Tailwind CSS** — utility classes; inline styles for dynamic values (e.g. progress bar widths)
- **lucide-react** — icons
- **Firebase** — initialized in `firebase.js`; v1 ships static with no active services (Hosting only)

## Architecture

All content and UI live in **`NerveBlockReference.jsx`** — single source of truth. Specifically:

- `BLOCKS` array — every block definition (media, content, default agent, typical volume)
- `LA_AGENTS` array — shared by block calculator and LAST page
- `REGIONS` array — grouping labels on home grid
- `MEDIA(filename)` helper — resolves to `${BASE_URL}nerve_blocks/<file>`

To add a new block: append an entry to `BLOCKS` with the appropriate `region`, drop its media into `public/nerve_blocks/`, and reference filenames in the entry's `media` object. No other file needs to change.

## Media

- **Raw archive**: `Nerve_Blocks/` (gitignored — too large for git)
- **Served from**: `public/nerve_blocks/` (committed — must include every file referenced in `BLOCKS`)
- If you add or update media, run a copy from `Nerve_Blocks/` → `public/nerve_blocks/` before building.

## Local anesthetic data

`LA_AGENTS` reflects ASRA / NYSORA reference values. If you change mg/kg or caps, update the LAST page wording too if needed.

Weight guidance lives in two strings, and they differ on purpose. Change each in its string, not per page.

- **`DOSING_WEIGHT_HINT`** sits under the LA max-dose calculator: actual body weight, or lean/ideal body weight if obese. Do not tell users to dose a thin patient's local anesthetic on ideal body weight. In a thin or frail patient, ideal weight can exceed actual weight and overstate the ceiling.
- **`LIPID_WEIGHT_HINT`** sits under the LAST lipid calculator: ideal body weight, by Thiago's decision of 2026-11-15.
  - Up to and including 70 kg, the doses are per kg: ~1.5 mL/kg over 2–3 min, then ~0.25 mL/kg/min.
  - Over 70 kg, they are fixed: ~100 mL over 2–3 min, then ~250 mL over 15–20 min.
  - The weight entered also sets the 12 mL/kg maximum.

The lipid numbers follow the ASRA LAST checklist 2020 (v1.1), at Thiago's word. Do not swap in an older version's numbers. The 2017 checklist's "200–250 mL" was on this branch briefly, because his first instruction quoted that version; he meant the current one.

The checklist leaves two things open, and the page settles both by Thiago's choice:
- **Ideal body weight for every lipid figure.** The checklist names no weight basis. Its 2017 version put ideal body weight on the infusion only.
- **Exactly 70 kg uses the per-kg doses.** The checklist says only "over" and "under" 70 kg.

## Firebase Pattern

Firebase is initialized in `firebase.js` at the project root with a placeholder config, on purpose: the app is Hosting-only (`mizzou-nerve-blocks`) and uses no Firebase SDK service. Fill the config from the console only when adding one (Firestore, Analytics, Auth):

```js
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
```

Then import into components from `./firebase.js`. Never re-initialize the app.

## Git & GitHub Workflow

Repo: `https://github.com/tac02189/nerve-block-app`
Branch: `master` (per global CLAUDE.md, commit directly to master for normal work)

**Proactively commit and push at major milestones** — new feature, new block added, content correction, deploy, etc.

## Deployment

```bash
npm run deploy
```

Builds with Vite, then `firebase deploy --only hosting`. Live URL pattern: `https://mizzou-nerve-blocks.web.app`.

`firebase.json` rewrites all routes → `index.html` (SPA).

## Design Conventions

- Mizzou palette: Gold `#F1B82D`, Deep Gold `#B8860B`, Black `#000`
- Deep red `#B91C1C` is reserved for LAST and dose-exceeded warnings — do not reuse for non-danger UI.
- Fonts: Fraunces (display) + Inter Tight (body) — loaded in `index.html`
- Mobile-first; tap targets ≥44 px; `playsInline` mandatory on every `<video>`
- Page transitions: `.page-enter-forward` / `.page-enter-back` in `index.css`

## Content Source

Initial draft content for all 13 blocks pulled from standard EM/regional refs (NYSORA, ASRA, EM:RAP/Highland) — every dose and volume needs Thiago's final review before public deploy. Note any disputed values in commit messages.
