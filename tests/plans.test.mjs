import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIGNAL_IDS, analyze } from '../engine.js';

// i18n.js is a classic browser script (no exports); evaluate it to inspect I18N.
const I18N = new Function(readFileSync(new URL('../i18n.js', import.meta.url), 'utf8') + '; return I18N;')();
const LANGS = ['en', 'hi', 'ml'];

for (const lang of LANGS) {
  test(lang + ': every engine signal has a safe verification plan', () => {
    for (const id of SIGNAL_IDS) {
      const steps = I18N[lang]['verify_' + id];
      assert.ok(Array.isArray(steps) && steps.length >= 2, lang + ' verify_' + id + ' missing or too short');
      for (const s of steps) assert.ok(typeof s === 'string' && s.trim().length > 10, lang + ' verify_' + id + ' has an empty step');
    }
  });

  test(lang + ': genuine-offer checklist and plan titles present', () => {
    assert.ok(typeof I18N[lang].verify_title === 'string' && I18N[lang].verify_title.trim().length > 3);
    assert.ok(typeof I18N[lang].genuine_title === 'string' && I18N[lang].genuine_title.trim().length > 5);
    const g = I18N[lang].genuine_steps;
    assert.ok(Array.isArray(g) && g.length >= 4, lang + ' genuine_steps missing or too short');
    for (const s of g) assert.ok(typeof s === 'string' && s.trim().length > 10);
  });

  test(lang + ': every signal still has an explanation string', () => {
    for (const id of SIGNAL_IDS) assert.ok(typeof I18N[lang]['sig_' + id] === 'string' && I18N[lang]['sig_' + id].length > 5, lang + ' sig_' + id + ' missing');
  });
}

test('genuine checklist keeps verify-before-trust advice, never declares offers safe', () => {
  for (const lang of LANGS) {
    const joined = (I18N[lang].genuine_title + ' ' + I18N[lang].genuine_steps.join(' ')).toLowerCase();
    assert.ok(!/genuine|safe to proceed|100% safe|definitely real/.test(joined), lang + ' checklist must not declare offers genuine/safe');
  }
  const en = I18N.en.genuine_steps.join(' ').toLowerCase();
  assert.match(en, /official/);
  assert.match(en, /never pay/);
});

test('clean genuine-style text lands in the band that shows the checklist', () => {
  const r = analyze('We are pleased to offer you the position of Software Engineer at our Kochi office. Your interview schedule is attached. Regards, HR Team.');
  assert.equal(r.band, 'no_signals');
  assert.ok(r.score < 30);
});

test('a flagged offer shows plans instead of the genuine checklist band', () => {
  const r = analyze('Pay a one-time registration fee of Rs 999 via UPI to confirm your slot today. Only 5 slots left! Contact HR on WhatsApp +919999999999');
  assert.ok(r.score >= 30, 'scored ' + r.score);
  for (const id of r.signals) assert.ok(SIGNAL_IDS.includes(id));
});

test('index.html wires the plan and genuine blocks and the array helper', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const needle of ['id="planblock"', 'id="planlist"', 'id="genblock"', 'id="genlist"', "T('verify_title')", "T('genuine_title')", "TA('verify_'", "TA('genuine_steps')"]) {
    assert.ok(html.includes(needle), 'index.html missing ' + needle);
  }
});

test('guidance avoids categorical recovery and blanket claims', () => {
  for (const lang of LANGS) {
    const joined = (SIGNAL_IDS.map(id => (I18N[lang]['verify_' + id] || []).join(' ')).join(' ') + ' ' + I18N[lang].genuine_steps.join(' ')).toLowerCase();
    for (const bad of ['cannot be reversed', 'can never be reversed', 'impossible to recover', 'never be recovered', 'वापस नहीं मिलते', 'തിരിച്ചുപിടിക്കാൻ കഴിയില്ല']) {
      assert.ok(!joined.includes(bad.toLowerCase()), lang + ' contains a categorical claim: ' + bad);
    }
  }
});
