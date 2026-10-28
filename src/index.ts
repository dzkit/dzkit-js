// The public API, listed explicitly so that internal helpers never leak into it.
// Adding a name is a feature; removing or renaming one is a breaking change
// (see CONTRIBUTING.md, Releasing). test/api.test.ts pins this list.

export { DzkitError, toLatinDigits, type DzkitErrorCode, type DateInput } from './core';
export { SPEC_VERSION } from './generated/spec-data';

// Wilayas
export { WILAYAS, getWilaya, type Wilaya, type WilayaOptions } from './data/wilayas';

// Identifiers
export {
  RIP_PREFIX,
  ccpKey,
  isValidCcp,
  ripKey,
  ccpToRip,
  isValidRip,
  parseRip,
  formatRip,
  type ParsedRip,
} from './validators/ccp';
export {
  MOBILE_BLOCKS,
  parsePhone,
  isValidPhone,
  isValidMobile,
  getMobileOperator,
  formatPhone,
  type PhoneType,
  type MobileOperator,
  type ParsedPhone,
  type PhoneOptions,
} from './validators/phone';
export { isValidNif, isValidNis, compactId } from './validators/business';
export {
  VEHICLE_CATEGORIES,
  NEW_WILAYA_PLATES_FROM,
  parsePlate,
  isValidPlate,
  formatPlate,
  type VehicleCategory,
  type ParsedPlate,
  type PlateOptions,
} from './validators/plate';

// Amounts in words
export {
  MAX_WORDS_NUMBER,
  DINAR_FR,
  toWordsFr,
  amountToWordsFr,
  splitAmount,
  toCents,
  type FrCurrency,
} from './words/fr';
export { DINAR_AR, toWordsAr, amountToWordsAr, type ArNoun, type ArCurrency } from './words/ar';
export { amountToWords } from './words/index';

// Payroll
export {
  IRG_BRACKETS_2022,
  IRG_RULES_2022,
  irgFromScale,
  irgBreakdown,
  calculateIrg,
  type Bracket,
  type IrgRegime,
  type IrgRules,
  type IrgOptions,
  type IrgBreakdown,
} from './payroll/irg';
export { CNAS_RATES, grossToNet, netToGross, type SalaryOptions, type SalaryResult } from './payroll/salary';
