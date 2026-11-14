# JobRaksha (ജോബ്‌രക്ഷ / जॉबरक्षा)

**Is that job offer real? Check before you pay.**

JobRaksha is a free, no-sign-up web app that checks any job offer - a WhatsApp forward, SMS, email or job posting - for known scam patterns and explains the verdict in plain language in **English, Hindi and Malayalam**.

Live: **https://jobraksha.pages.dev**

## Why

Fake job and internship offers are the front door of cyber fraud in India. Scammers pose as recruiters on WhatsApp, Telegram and fake job portals, promise students and first-time job seekers well-paid roles, then steal "registration fees", identity documents and bank details.

Verified figures:

- A Gujarat cyber-police bust in August 2026 found one gang holding data on more than **33 lakh job seekers**; its 34 linked bank accounts were tied to 113 complaints totalling Rs 33.14 crore across all fraud types, and the job-scam portion was Rs 3.35 crore collected from over 750 victims. ([New Indian Express, 24 Aug 2026](https://www.newindianexpress.com/states/gujarat/2026/Aug/24/33-crore-fraud-33-lakh-job-seekers-gujarat-cyber-cops-bust-pan-India-scam-linked-to-chinese-gang))
- Indians lost **Rs 52,976 crore to cyber scams in six years** (I4C / Union Home Ministry data). ([moneycontrol, 2 Jan 2026](https://www.moneycontrol.com/news/india/india-s-cyber-scam-bill-crosses-rs-52-976-crore-in-6-years-investment-fraud-is-the-big-monster-13754990.html))
- One Delhi work-from-home racket duped **over 30,000 people of Rs 200 crore** (Delhi Police, January 2023). ([Times of India](https://timesofindia.indiatimes.com/city/delhi/scammed-at-home-with-promise-of-rs-15000/day/articleshow/97383778.cms))

## How it works

- **The verdict is deterministic.** Every check runs a transparent rules engine (`engine.js`) - 13 weighted, explainable scam signals (advance fees, UPI/gift-card payment demands, WhatsApp-only recruiters, free-email "HR", unrealistically high salary, no-interview promises, urgency pressure, Aadhaar/OTP harvesting, money-mule recruitment, task scams, suspicious links, vague no-requirement roles, brand impersonation). The same input always gives the same verdict, and every signal is shown with its plain-language explanation.
- **Privacy by design.** Analysis runs entirely in the browser. The message text never leaves the phone. The only server calls are a public usage counter and a yes/no feedback tap; neither stores message content.
- **Honest about limits.** "No signals found" is never presented as proof an offer is genuine - the app always says so and tells the user how to verify on the company's official site.
- **Built for the people scammers target.** No install (PWA), no sign-up, works on low-end phones, Malayalam + Hindi + English, and one-tap reporting guidance to cybercrime.gov.in / helpline 1930.

## AgentFoundry (AF)

JobRaksha's initial build predates our AgentFoundry signup. The project now lives in the AgentFoundry workspace: files are reviewed in its editor, the test suite runs in its integrated terminal (34/34 passing), and ongoing edits are made there. The exact split of what was done where is disclosed in SUBMISSION.md.

## Run it locally

No build step. Any static server works:

```bash
cd jobraksha
python3 -m http.server 8080
# open http://localhost:8080
```

## Tests

```bash
node --test
```

34 tests, 34 passing.

The suite covers scam variants that must be caught (advance fee, mule recruitment, task scams, brand impersonation, data harvesting, urgency + fee, gift cards, unrealistic salary, suspicious links), genuine offers that must not be flagged (TCS careers post, startup role with real domain, DRDO internship notice, personal referral), determinism, junk input, Malayalam text and long inputs.

## Deployment

Static site plus a bundled Cloudflare Pages worker (`_worker.js`, built from the `functions/api/count.js` and `functions/api/feedback.js` sources) backed by a KV namespace `JR_COUNT` for the public usage counter and feedback tallies. No message content is ever sent or stored.

## Impact ledger

Real, verifiable usage and outcomes are recorded in [`data/impact.json`](data/impact.json). It is intentionally empty until real field data exists - we do not claim impact we cannot show.

## License

MIT. Built for the Code for a Billion - Bharat Agentic-AI Hackathon 2026 (Code for India).
