import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../engine.js';

// --- Scam offers that must score high ---
const scams = {
  fee: 'You are shortlisted for WFH data entry. Pay a one-time registration fee of Rs 999 to confirm your slot.',
  mule: 'Hiring payment agents. Receive payments in your bank account and forward them, keep 5% commission per transaction.',
  task: 'Earn Rs 3,000 daily by liking YouTube videos. Simple online tasks, anyone can apply, no experience needed.',
  impersonator: 'Congratulations! Amazon hiring freshers, no interview. Contact HR on WhatsApp +919887766554. Pay refundable security deposit Rs 1,500.',
  harvest: 'To issue your offer letter, send your Aadhaar card, PAN card and bank account details on this WhatsApp number.',
  urgencyFee: 'Only 3 slots left! Immediate joining. Pay the training fee today to lock your seat.',
  giftcard: 'To activate your employee account buy a Google Play gift card worth Rs 500 and share the code.',
  salary: 'Freshers wanted, no experience. Salary Rs 85,000 per month for simple copy paste work from home.',
  link: 'Apply for the job here: https://bit.ly/3XyzJob. Limited vacancies, no experience required, direct joining.'
};
for (const [name, text] of Object.entries(scams)) {
  test('flags scam: ' + name, () => {
    const r = analyze(text);
    assert.ok(r.score >= 30, name + ' scored ' + r.score + ' ' + JSON.stringify(r.signals));
    assert.ok(['likely_scam','suspicious'].includes(r.band), name + ' band ' + r.band);
  });
}

// --- Genuine offers that must NOT be called a scam ---
const genuine = {
  tcs: 'Tata Consultancy Services invites applications for the role of System Engineer. Apply at https://www.tcs.com/careers. Shortlisted candidates will go through an online test and interview rounds. TCS never charges any fee at any stage of recruitment.',
  startup: 'We are a 12-person startup hiring a junior React developer (0-2 yrs). CTC Rs 4-6 LPA. Two interview rounds. Write to careers@loophealth.com with your GitHub.',
  intern: 'Summer internship at DRDO for final-year BTech students. Apply through the official portal before 30 November. Selection is by academic record and interview.',
  referral: 'Hi, my team at Infosys has an opening for a testing role. If interested, send your resume and we will set up interviews next week.'
};
for (const [name, text] of Object.entries(genuine)) {
  test('does not flag genuine: ' + name, () => {
    const r = analyze(text);
    assert.ok(r.score < 30, name + ' scored ' + r.score + ' ' + JSON.stringify(r.signals));
  });
}

test('deterministic: same input, same output', () => {
  const a = analyze(scams.fee), b = analyze(scams.fee);
  assert.deepEqual(a, b);
});

test('empty and junk input is safe', () => {
  assert.equal(analyze('').band, 'no_signals');
  assert.equal(analyze('asdf qwer zxcv').score, 0);
});

test('malayalam script does not crash the engine', () => {
  const r = analyze('ഉടൻ ജോലി! റെജിസ്ട്രേഷൻ ഫീസ് അടയ്ക്കുക');
  assert.ok(r.score >= 0);
});

test('long input is truncated and stable', () => {
  const r = analyze('registration fee ' + 'word '.repeat(100000));
  assert.ok(r.signals.includes('advance_fee'));
});
