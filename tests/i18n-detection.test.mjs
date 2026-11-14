import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../engine.js';

// Malayalam and Hindi scam texts must be detected, not just tolerated.
// The app promises verdicts in Malayalam and Hindi; these tests hold
// the engine to that promise for the highest-severity signals.

test('malayalam fee demand is flagged', () => {
  const r = analyze('ഉടൻ ജോലി! രജിസ്ട്രേഷൻ ഫീസ് അടയ്ക്കുക');
  assert.ok(r.signals.includes('advance_fee'), JSON.stringify(r.signals));
  assert.ok(r.score >= 30, 'scored ' + r.score);
});

test('hindi fee demand is flagged', () => {
  const r = analyze('नौकरी के लिए रजिस्ट्रेशन फीस 500 रुपये भरें');
  assert.ok(r.signals.includes('advance_fee'), JSON.stringify(r.signals));
  assert.ok(r.score >= 30, 'scored ' + r.score);
});

test('malayalam aadhaar harvesting is flagged', () => {
  const r = analyze('ഓഫർ ലറ്റർ കിട്ടാൻ ആധാർ കാർഡ് അയയ്ക്കുക');
  assert.ok(r.signals.includes('data_harvest'), JSON.stringify(r.signals));
});

test('hindi urgency marker is detected', () => {
  const r = analyze('तुरंत जॉइनिंग, आज ही फीस जमा करें');
  assert.ok(r.signals.includes('urgency'), JSON.stringify(r.signals));
});

// Genuine Malayalam and Hindi texts must not be flagged.
test('malayalam genuine notice is not flagged', () => {
  const r = analyze('കമ്പനിയിൽ ജോലിക്ക് അപേക്ഷിക്കുക. ഇന്റർവ്യൂ ഉണ്ടാകും.');
  assert.equal(r.score, 0, JSON.stringify(r.signals));
});

test('hindi genuine notice is not flagged', () => {
  const r = analyze('कंपनी में नौकरी के लिए आधिकारिक वेबसाइट पर आवेदन करें। साक्षात्कार होगा।');
  assert.equal(r.score, 0, JSON.stringify(r.signals));
});
