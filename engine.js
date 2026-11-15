// JobRaksha deterministic scam-signal engine.
// Pure ESM, no dependencies. Used by the web app and the test suite.
// The verdict comes only from these rules, never from an AI model,
// so the same input always produces the same, explainable result.

const FREE_MAIL = ['gmail.com','yahoo.com','yahoo.in','outlook.com','hotmail.com','rediffmail.com','proton.me','protonmail.com','icloud.com','zoho.com','aol.com','mail.com','gmx.com','yandex.com'];

const SIGNALS = [
  {
    id: 'advance_fee', weight: 35,
    patterns: [/\b(registration|security|joining|processing|training|verification|documentation|onboarding|enrol+ment|admission|courier|file|activation|slot booking|slot confirmation|confirmation|id card|visa|work permit|medical test|medical|attestation|emigration|air ticket|ticket)\s*(fee|fees|charge|charges|deposit|amount|payment)\b/i,
      /\b(refundable|one[- ]time)\s+(security\s+)?(deposit|fee|payment|amount)\b/i,
      /\bpay\s*(rs|inr|₹)?\s*[\d,]+\s*(for|to)\s*(register|confirm|join|book|activate)/i,
      /\bfee\s+of\s*(rs|inr|₹)/i,
      /\b(gift\s*card|itunes|steam|google play)\b[^.]*\b(code|redeem|share|scratch)/i,
      // Malayalam and Hindi fee demands (fee noun near a pay verb, either order)
      /(ഫീസ്|ഡിപ്പോസിറ്റ്).{0,40}(അടയ്ക്ക|പേയ്‌മെന്റ്)/,
      /(അടയ്ക്ക|പേയ്‌മെന്റ്).{0,40}(ഫീസ്|ഡിപ്പോസിറ്റ്)/,
      /(फीस|शुल्क|डिपॉजिट).{0,40}(भरें|दें|जमा|भुगतान)/,
      /(भरें|जमा करें|भुगतान).{0,40}(फीस|शुल्क|डिपॉजिट)/]
  },
  {
    id: 'payment_rail', weight: 25,
    patterns: [/\bqr\s*code\b/i,
      /\bscan\b[^.\n]{0,20}\b(pay|payment|fee)\b/i,
      /\b(upi|paytm|phonepe|gpay|google pay|bhim)\b.*\b(pay|send|transfer|deposit)/i,
      /\b(gift\s*card|itunes|steam card|google play card)\b/i,
      /\b(bitcoin|btc|usdt|crypto|usdc)\b/i,
      /\b(send|transfer|pay)\b.*\b(upi|wallet|crypto)\b/i]
  },
  {
    id: 'chat_only_recruiter', weight: 15,
    patterns: [/\b(whatsapp|telegram)\s*(only|me|us|on|at)\s*[+@\d:]/i,
      /\b(contact|apply|message|text|ping|dm)\s*(only\s*)?(on|via|through)\s*(whatsapp|telegram)\b/i,
      /\bjoin\s+(our\s+)?(whatsapp|telegram)\s+(group|channel)\b/i,
      /t\.me\/\S+/i, /chat\.whatsapp\.com\/\S+/i, /wa\.me\/\S+/i]
  },
  {
    id: 'free_email_company', weight: 20,
    // Applied in code: an email on a free provider presented as a company/HR contact.
    patterns: []
  },
  {
    id: 'too_good_salary', weight: 20,
    // Applied in code: high pay promised for no-skill / no-experience work.
    patterns: []
  },
  {
    id: 'no_interview', weight: 15,
    patterns: [/\b(no|without|skip)\s+(interview|selection process)\b/i,
      /\bdirect\s+(joining|selection|offer|placement)\b/i,
      /\bselected\s+without\s+(interview|test)\b/i,
      /\boffer\s+letter\b.*\b(without|no)\s+interview\b/i]
  },
  {
    id: 'urgency', weight: 10,
    patterns: [/\b(only\s+\d+\s+(slots|seats|vacancies|positions)\s+(left|remaining))\b/i,
      /\b(limited|few)\s+(slots|seats|vacancies)\b/i,
      /\b(today|tonight)\s+(only|is the last)/i,
      /\blast\s+(date|day)\s+(is\s+)?(today|tomorrow)\b/i,
      /\b(immediate|urgent)\s+(joining|requirement)\b.*\bfee\b/i,
      /\bwithin\s+\d+\s+(hours?|hrs)\b/i,
      // Malayalam and Hindi urgency markers
      /(ഉടൻ|ഉടനടി|അവസാന അവസരം)/,
      /(तुरंत|आज ही|सीमित सीटें|अंतिम तिथि)/]
  },
  {
    id: 'data_harvest', weight: 30,
    patterns: [/\b(aadha?ar|pan\s*card|passport|voter\s*id)\b.*\b(send|share|upload|submit|whatsapp)\b/i,
      /\b(bank\s+(account|details)|account\s+number|ifsc|cvv|otp|one[- ]time\s+password)\b.*\b(send|share|enter|submit|verify)\b/i,
      /\b(send|share|submit|upload)\b.*\b(aadha?ar|pan\s*card|bank\s+details|otp)\b/i,
      // Malayalam and Hindi document/OTP harvesting
      /(ആധാർ|आधार|ओटीपी|ഓടിപി).{0,40}(അയയ്ക്ക|भेजें|साझा|പങ്ക്)/,
      /(भेजें|അയയ്ക്ക).{0,40}(ആധാർ|आधार|ओटीपी|ഓടിപി)/]
  },
  {
    id: 'biometric_harvest', weight: 30,
    // MHA/I4C advisory (May 2026): fake online interviews harvesting face/eye scans.
    patterns: [/\b(face|facial)\s*scan\b/i,
      /\beye\s*scan\b/i,
      /\bliveness\s*(check|test|verification)\b/i,
      /\bbiometric\s*(verification|data|kyc|check|authentication)\b/i,
      /\b(video|online)\s*kyc\b/i,
      /\bkeep your face in the frame\b/i,
      /\bblink your eyes\b/i]
  },
  {
    id: 'money_mule', weight: 30,
    patterns: [/\b(receive|accept|collect)\b.*\b(payment|money|funds|amount)\b.*\b(forward|transfer|send)\b/i,
      /\b(commission|percentage|%)\b.*\b(per|for every|each)\s+(transaction|transfer|payment)\b/i,
      /\b(payment\s+agent|transfer\s+agent|financial\s+agent|money\s+transfer\s+executive)\b/i,
      /\buse\s+your\s+(bank\s+)?account\s+to\s+(receive|process)\b/i]
  },
  {
    id: 'task_scam', weight: 30,
    patterns: [/\b(lik(e|ing)|subscrib(e|ing)|follow(ing)?|review(ing)?|rat(e|ing))\b[^.]*\b(videos?|posts?|apps?|products?)\b[^.]*\b(earn|get paid|paid|income)\b/i,
      /\b(earn|make)\s*(rs|inr|₹)?\s*[\d,]+\s*((per|a|every)\s*)?(day|daily)\b[^.]*\b(lik(e|ing)|rat(e|ing)|review(ing)?|tasks?|orders?|videos?|subscrib(e|ing))\b/i,
      /\b(prepaid|recharge|boost)\s+(task|order)s?\b/i,
      /\bcomplete\s+(simple\s+|easy\s+)?(online\s+)?tasks?\s+(and|to)\s+earn\b/i,
      /\b(optimi[sz]e|grab)\s+orders?\b/i,
      /\b(earn|make)\b[^.\n]{0,25}\b[\d,]{3,}\s*(-|–|to)\s*[\d,]{3,}\s*((per|a|every)\s+)?(day|daily)\b/i]
  },
  {
    id: 'suspicious_link', weight: 15,
    // Applied in code: shortened links, bare IPs, suspicious TLDs.
    patterns: []
  },
  {
    id: 'vague_role', weight: 10,
    patterns: [/\b(work\s+from\s+home|wfh)\b.*\b(no\s+experience|fresher|anyone can|no qualification)\b/i,
      /\b(data\s+entry|copy\s+paste|form\s+filling|ad\s+posting|captcha)\s+(job|work|project)s?\b/i,
      /\b(part[- ]time|full[- ]time)\b.*\b(no\s+experience\s+(needed|required)|no\s+skills?\s+(needed|required))\b/i]
  },
  {
    id: 'impersonation', weight: 20,
    // Applied in code: big-brand name combined with free mail / chat-only contact.
    patterns: []
  },
  {
    id: 'lookalike_domain', weight: 20,
    // Applied in code: a link host carries a big-brand name but is not that brand's official domain.
    patterns: []
  }
];

const SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','cutt.ly','is.gd','rb.gy','shorturl.at','tiny.cc','s.id'];
const RISKY_TLDS = ['.xyz','.top','.icu','.click','.live','.buzz','.rest','.quest','.lol','.cam'];
const BIG_BRANDS = ['amazon','flipkart','google','microsoft','tcs','infosys','wipro','hcl','reliance','tata','accenture','cognizant','tech mahindra','swiggy','zomato','paytm','phonepe','sbi','hdfc','icici','deloitte','kpmg','ernst','ey','ibm','oracle','meta','apple'];

const OFFICIAL_DOMAINS = {
  amazon: ['amazon.in', 'amazon.com', 'amazon.jobs'], flipkart: ['flipkart.com'],
  google: ['google.com', 'careers.google'], microsoft: ['microsoft.com'],
  tcs: ['tcs.com'], infosys: ['infosys.com'], wipro: ['wipro.com'], hcl: ['hcltech.com'],
  reliance: ['ril.com'], tata: ['tata.com'], accenture: ['accenture.com'],
  cognizant: ['cognizant.com'], 'tech mahindra': ['techmahindra.com'],
  swiggy: ['swiggy.com'], zomato: ['zomato.com'], paytm: ['paytm.com'], phonepe: ['phonepe.com'],
  sbi: ['sbi.co.in', 'onlinesbi.sbi'], hdfc: ['hdfcbank.com'], icici: ['icicibank.com'],
  deloitte: ['deloitte.com'], kpmg: ['kpmg.com'], ernst: ['ey.com'], ey: ['ey.com'],
  ibm: ['ibm.com'], oracle: ['oracle.com'], meta: ['meta.com'], apple: ['apple.com']
};
const HIGH_SALARY = /(?:rs|inr|₹)\s*(\d[\d,]{3,})|(\d{2,3})\s*k\b\s*(?:per|a|\/)\s*(?:month|day|week)/i;
function highSalaryAmount(text) {
  const m = text.match(HIGH_SALARY);
  if (!m) return null;
  const n = m[1] ? parseInt(m[1].replace(/,/g, ''), 10) : parseInt(m[2], 10) * 1000;
  return n >= 30000 ? m[0] : null;
}
const LOW_BARRIER = /no\s+(experience|qualification|skills?|interview)|fresher|anyone can apply|10th|12th\s+pass|students? (can|welcome)/i;

export function extractEmails(text) {
  return text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
}
export function extractUrls(text) {
  return text.match(/https?:\/\/[^\s)"']+|(?:^|\s)(?:www\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}[^\s)"']*/g) || [];
}

function hostOf(u) {
  try { return new URL(/^https?:\/\//i.test(u) ? u : 'http://' + u.trim()).hostname.toLowerCase(); }
  catch { return null; }
}

export function analyze(rawText) {
  const text = (rawText || '').slice(0, 20000);
  const hits = [];
  const add = (id, evidence) => {
    const s = SIGNALS.find(x => x.id === id);
    if (s && !hits.some(h => h.id === id)) hits.push({ id, weight: s.weight, evidence });
  };

  for (const s of SIGNALS) {
    for (const re of s.patterns) {
      const m = text.match(re);
      if (m) { add(s.id, m[0].trim().slice(0, 120)); break; }
    }
  }

  const emails = extractEmails(text);
  const urls = extractUrls(text);
  const hosts = urls.map(hostOf).filter(Boolean);

  // free_email_company: free-provider mailbox presented as HR/recruiter/company contact
  const freeMails = emails.filter(e => FREE_MAIL.includes(e.split('@')[1].toLowerCase()));
  if (freeMails.length && /\b(hr|recruit|hiring|placement|company|ltd|limited|pvt|inc|corp|technologies|solutions)\b/i.test(text)) {
    add('free_email_company', freeMails[0]);
  }

  // too_good_salary: high pay + low barrier in the same offer
  const hs = highSalaryAmount(text);
  if (hs && LOW_BARRIER.test(text)) {
    add('too_good_salary', hs);
  }

  // suspicious_link
  for (const h of hosts) {
    if (SHORTENERS.some(s => h === s || h.endsWith('.' + s))) { add('suspicious_link', h); break; }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) { add('suspicious_link', h); break; }
    const tld = '.' + h.split('.').pop();
    if (RISKY_TLDS.includes(tld) && /\b(apply|job|offer|register|join|work|earn|career)/i.test(text)) { add('suspicious_link', h); break; }
  }

  // lookalike_domain: host uses a big-brand name but is not that brand's official site
  for (const h of hosts) {
    for (const b of BIG_BRANDS) {
      const flat = b.replace(/\s+/g, '');
      if (!(h.includes(b) || (flat !== b && h.includes(flat)))) continue;
      const ok = (OFFICIAL_DOMAINS[b] || []).some(d => h === d || h.endsWith('.' + d));
      if (!ok) { add('lookalike_domain', h); break; }
    }
    if (hits.some(x => x.id === 'lookalike_domain')) break;
  }

  // impersonation: big-brand name + (free mail or chat-only or risky link)
  const brand = BIG_BRANDS.find(b => new RegExp('\\b' + b.replace(' ', '\\s+') + '\\b', 'i').test(text));
  if (brand && (hits.some(h => h.id === 'free_email_company' || h.id === 'chat_only_recruiter' || h.id === 'suspicious_link'))) {
    add('impersonation', brand);
  }

  const score = Math.min(100, hits.reduce((a, h) => a + h.weight, 0));
  let band;
  if (score >= 55) band = 'likely_scam';
  else if (score >= 30) band = 'suspicious';
  else if (score >= 12) band = 'caution';
  else band = 'no_signals';

  return {
    score, band,
    signals: hits.map(h => h.id),
    evidence: Object.fromEntries(hits.map(h => [h.id, h.evidence || null])),
    contacts: { emails: emails.slice(0, 5), hosts: hosts.slice(0, 5) }
  };
}
