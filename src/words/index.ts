import { amountToWordsAr } from './ar';
import { amountToWordsFr } from './fr';

export * from './fr';
export * from './ar';

/** Amount in DZD written out in French ("fr") or Arabic ("ar"). */
export function amountToWords(amount: number, lang: 'fr' | 'ar' = 'fr'): string {
  return lang === 'ar' ? amountToWordsAr(amount) : amountToWordsFr(amount);
}
