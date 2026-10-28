import { expect, it } from 'vitest';
import * as dz from '../src';

// The public API. If this test fails, a name was added, removed or renamed: update the
// list on purpose, and choose the version with the rule in CONTRIBUTING.md (adding is a
// feature; removing or renaming breaks users).
it('exports exactly the public API', () => {
  expect(Object.keys(dz).sort()).toEqual(
    [
      'CNAS_RATES',
      'DINAR_AR',
      'DINAR_FR',
      'DzkitError',
      'IRG_BRACKETS_2022',
      'IRG_RULES_2022',
      'MAX_WORDS_NUMBER',
      'MOBILE_BLOCKS',
      'NEW_WILAYA_PLATES_FROM',
      'RIP_PREFIX',
      'SPEC_VERSION',
      'VEHICLE_CATEGORIES',
      'WILAYAS',
      'amountToWords',
      'amountToWordsAr',
      'amountToWordsFr',
      'calculateIrg',
      'ccpKey',
      'ccpToRip',
      'compactId',
      'formatPhone',
      'formatPlate',
      'formatRip',
      'getMobileOperator',
      'getWilaya',
      'grossToNet',
      'irgBreakdown',
      'irgFromScale',
      'isValidCcp',
      'isValidMobile',
      'isValidNif',
      'isValidNis',
      'isValidPhone',
      'isValidPlate',
      'isValidRip',
      'netToGross',
      'parsePhone',
      'parsePlate',
      'parseRip',
      'ripKey',
      'splitAmount',
      'toCents',
      'toLatinDigits',
      'toWordsAr',
      'toWordsFr',
    ].sort(),
  );
});
