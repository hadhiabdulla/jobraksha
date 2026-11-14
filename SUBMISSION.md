# Build log - AgentFoundry work steps

JobRaksha was built in the AgentFoundry IDE, the official IDE of the Code for a Billion hackathon. This file records how AgentFoundry was actually used, so the "Built using AgentFoundry" confirmation in the submission issue is verifiable.

## What was done in AgentFoundry

1. **Project workspace** - the `jobraksha` project lives in the AgentFoundry workspace; the whole file tree (`index.html`, `engine.js`, `i18n.js`, `sw.js`, `manifest.json`, `functions/`, `tests/`, `icons/`, `data/`) is managed from its file explorer.
2. **Verdict engine** - `engine.js` (the deterministic, fully offline heuristic engine) was authored and iterated in the AgentFoundry editor: signal extraction, language detection (English/Hindi/Malayalam), scoring bands and evidence strings.
3. **Test suite in the integrated terminal** - `node --test tests/engine.test.mjs` was run repeatedly in AgentFoundry's built-in terminal during development. Current state: **17 tests, 17 passing, 0 failing** (scam variants that must be caught, genuine offers that must not be flagged, determinism, junk input, Malayalam text, long inputs).
4. **UI work** - the single-page UI (`index.html`) was edited in the AgentFoundry editor, including the dark glass redesign with the band-coloured animated SVG gauge, evidence chips and emergency-contact chips, and the accuracy pass on the privacy note and score caption ("Heuristic score /100", no probability claims).
5. **PWA and functions** - `sw.js` (offline cache), `manifest.json` and the two Cloudflare Pages Functions (`functions/api/count.js`, `functions/api/feedback.js`, daily-capped counters backed by KV) were authored in the editor.
6. **Docs** - this file and `README.md` are authored and maintained in the AgentFoundry editor.
7. **Verification** - the live deployment at <https://jobraksha.pages.dev> was verified (counter API over HTTP and the live UI) from AgentFoundry's environment after each change; the GitHub repo is synced from the same working tree.

## Why the architecture looks like this

- The verdict is produced entirely on the device (no AI in the verdict path, no network call), so it works on low-end phones with poor connectivity and keeps the user's message private by construction.
- The only backend is two tiny KV-backed counters (total checks, feedback tallies) with daily caps and hashed-IP rate limiting - no message content ever leaves the device.
