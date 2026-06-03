import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  localizeImportedRoutineHabit,
  localizeRoutinePack,
  localizeSeedHabit,
  normalizeLanguage,
  translate,
} from '../src/i18n.js';

test('translate returns localized Bangla and Hindi strings with English fallback', () => {
  assert.equal(translate('bn', 'addHabit'), 'অভ্যাস যোগ করুন');
  assert.equal(translate('hi', 'addHabit'), 'आदत जोड़ें');
  assert.equal(translate('unknown', 'addHabit'), 'Add habit');
  assert.equal(translate('en', 'missing.key'), 'missing.key');
});

test('normalizeLanguage only allows supported languages', () => {
  assert.equal(normalizeLanguage('en'), 'en');
  assert.equal(normalizeLanguage('bn'), 'bn');
  assert.equal(normalizeLanguage('hi'), 'hi');
  assert.equal(normalizeLanguage('fr'), 'en');
});

test('localization helpers translate seed habits, routines, and imported routine habits', () => {
  assert.equal(localizeSeedHabit({ id: 'drink-water', title: 'Drink water', category: 'Body' }, 'hi').title, 'पानी पिएं');

  const banglaPack = localizeRoutinePack(
    { id: 'morning-reset', title: 'Morning Reset', tag: 'Self-care', habits: [] },
    'bn',
  );
  assert.equal(banglaPack.title, 'সকালের রিসেট');
  assert.equal(banglaPack.habits[0], 'পানি পান করুন');

  const importedHabit = localizeImportedRoutineHabit(
    { title: 'Drink water', category: 'Self-care', sourceRoutineId: 'morning-reset', sourceRoutineIndex: 1 },
    'hi',
  );
  assert.equal(importedHabit.title, '5 मिनट स्ट्रेच करें');
  assert.equal(importedHabit.category, 'सेल्फ-केयर');
});
