# Build log - AgentFoundry work steps

This file records exactly how AgentFoundry (AF) was used on JobRaksha, so reviewers can verify the "Built using AgentFoundry" confirmation against the real record.

## Actual AgentFoundry usage

The initial JobRaksha build - `engine.js` (verdict engine), `index.html` (UI), `i18n.js`, `sw.js`, `manifest.json`, `functions/api/*.js` and the test suite - was drafted before the team signed up for AgentFoundry, in a plain editor and terminal. We did not start the project inside AF.

After signing up, the project was moved into the AgentFoundry workspace and AF was used for real work on it:

1. **Project workspace** - the whole `jobraksha` tree is managed from the AF file explorer; engine, UI, i18n, PWA and function files were opened and reviewed in the AF editor.
2. **Test suite in the integrated terminal** - `node --test tests/engine.test.mjs` run in AF's built-in terminal: **34 tests, 34 passing, 0 failing** (scam variants that must be caught, genuine offers that must not be flagged, determinism, junk input, Malayalam text, long inputs, and Malayalam/Hindi scam detection).
3. **Documentation** - `README.md` (accuracy correction to this section) and this `SUBMISSION.md` were edited and authored in the AF editor.
4. **Ongoing development** - Malayalam and Hindi scam-signal detection (advance-fee demands, urgency markers, Aadhaar/OTP harvesting) was added to the verdict engine from the AgentFoundry workspace, with six new detection tests, and the full 34-test suite runs green in AF's integrated terminal.

## What this means for eligibility

We disclose the split rather than round it up: the core codebase predates our AF signup, and AF has been used for review, testing, documentation and verification since. Whether that satisfies the hackathon's "Built using AgentFoundry" requirement is for the organizers to judge; this file gives them the accurate picture.

## Why the architecture looks like this

- The verdict is produced entirely on the device (no AI in the verdict path, no network call), so it works on low-end phones with poor connectivity and keeps the user's message private by construction.
- The only backend is two tiny KV-backed counters (total checks, feedback tallies) with daily caps and hashed-IP rate limiting - no message content ever leaves the device.
