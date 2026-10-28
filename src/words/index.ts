import { amountToWordsAr } from './ar';
import { amountToWordsFr } from './fr';
import { DzkitError } from '../core';

export * from './fr';
export * from './ar';

/** Amount in DZD written out in French ("fr") or Arabic ("ar"). */
export function amountToWords(amount: number, lang: 'fr' | 'ar' = 'fr'): string {
  if (lang === 'fr') return amountToWordsFr(amount);
  if (lang === 'ar') return amountToWordsAr(amount);
  throw new DzkitError('invalid-option', `Unknown language "${String(lang)}"; expected fr or ar`);
}
