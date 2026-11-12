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

Weight guidance lives in one string, `DOSING_WEIGHT_HINT` (actual body weight, or lean/ideal body weight if obese), shown under both the LA calculator and the LAST lipid calculator. Change it there, not per page. Do not tell users to dose a thin patient on ideal body weight: in a thin or frail patient ideal weight can exceed actual weight and overstate the ceiling. The LAST page follows the ASRA LAST checklist 2020 (v1.1), which names no weight basis and gives fixed lipid volumes over 70 kg.

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
