import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../engine.js';

// Additional real-world scam variants seen in Indian job-fraud reports.
// Each must be flagged at least "suspicious".
const variants = {
  telegram_recruiter: 'Freshers hiring! Direct joining, no interview. Apply now on Telegram: t.me/hr_jobs_india',
  crypto_task: 'Earn Rs 2,000 daily by completing simple online tasks. Payments settled in USDT every night.',
  upi_documentation_fee: 'Pay the documentation fee of Rs 2,500 via UPI to confirm your interview slot.',
  aadhaar_otp: 'Your application is approved. Share your Aadhaar number and OTP to verify your job application.',
  whatsapp_group_fee: 'Join our WhatsApp group for daily job alerts: chat.whatsapp.com/Jx7kLm. Registration fee of Rs 299 for lifetime access.'
};
for (const [name, text] of Object.entries(variants)) {
  test('flags variant: ' + name, () => {
    const r = analyze(text);
    assert.ok(r.score >= 30, name + ' scored ' + r.score + ' ' + JSON.stringify(r.signals));
    assert.ok(['likely_scam', 'suspicious'].includes(r.band), name + ' band ' + r.band);
  });
}

// Specific signal assertions so coverage does not silently rot.
test('telegram link triggers chat_only_recruiter', () => {
  const r = analyze(variants.telegram_recruiter);
  assert.ok(r.signals.includes('chat_only_recruiter'), JSON.stringify(r.signals));
});
test('USDT settlement triggers payment_rail', () => {
  const r = analyze(variants.crypto_task);
  assert.ok(r.signals.includes('payment_rail'), JSON.stringify(r.signals));
});
test('UPI fee demand triggers advance_fee and payment_rail', () => {
  const r = analyze(variants.upi_documentation_fee);
  assert.ok(r.signals.includes('advance_fee'), JSON.stringify(r.signals));
  assert.ok(r.signals.includes('payment_rail'), JSON.stringify(r.signals));
});

// Genuine hiring that must NOT be flagged as a scam.
const genuine = {
  campus_drive: 'Campus placement drive on 20 November by a leading IT services company. Eligible final-year students should register with the placement cell and carry hall tickets. Selection through written test and interviews.',
  product_company: 'Freshworks is hiring Support Engineers in Chennai. Apply at https://careers.freshworks.com. The process has two technical interviews and one HR round.'
};
for (const [name, text] of Object.entries(genuine)) {
  test('does not flag genuine: ' + name, () => {
    const r = analyze(text);
    assert.ok(r.score < 30, name + ' scored ' + r.score + ' ' + JSON.stringify(r.signals));
  });
}

// Boundary: a genuine company that only mentions WhatsApp as a contact
// channel may score "caution" but must never be called a scam.
test('whatsapp as contact channel alone is at most caution', () => {
  const r = analyze('We are hiring a support associate. Apply at https://loophealth.com/careers. Questions? Message us on WhatsApp +919000000000 after you apply.');
  assert.ok(r.score < 30, 'scored ' + r.score + ' ' + JSON.stringify(r.signals));
});
