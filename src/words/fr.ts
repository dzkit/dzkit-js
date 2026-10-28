/**
 * French number words, traditional spelling (hyphens below 100, as on most invoices).
 * Handles the agreement rules: "quatre-vingts" / "quatre-vingt-un",
 * "deux cents" / "deux cent un", "mille" invariable, "millions" plural.
 */

import { checkAmount, DzkitError } from '../core';

/** Largest whole number written in words: just under 1 000 billion (OPERATIONS.md). */
export const MAX_WORDS_NUMBER = 999_999_999_999;

/** Throws invalid-amount unless n is an integer from 0 to MAX_WORDS_NUMBER. */
export function checkWordsNumber(n: unknown): asserts n is number {
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 0 || n > MAX_WORDS_NUMBER) {
    throw new DzkitError('invalid-amount', `Expected an integer from 0 to ${MAX_WORDS_NUMBER}, got ${String(n)}`);
  }
}

const UNITS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** 0–99. `final` is true when nothing follows in the whole number (for "quatre-vingts"). */
function below100(n: number, final: boolean): string {
  if (n < 20) return UNITS[n] as string;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) {
    const base = t === 7 ? 'soixante' : 'quatre-vingt';
    const rest = 10 + u;
    if (t === 7 && u === 1) return 'soixante et onze';
    return `${base}-${UNITS[rest]}`;
  }
  if (t === 8) {
    if (u === 0) return final ? 'quatre-vingts' : 'quatre-vingt';
    return `quatre-vingt-${UNITS[u]}`;
  }
  const ten = TENS[t] as string;
  if (u === 0) return ten;
  if (u === 1) return `${ten} et un`;
  return `${ten}-${UNITS[u]}`;
}

/** 0–999. `final`: nothing follows except possibly "millions"/"milliards" (which pluralise). */
function below1000(n: number, final: boolean): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h > 0) {
    if (h === 1) parts.push('cent');
    else parts.push(`${UNITS[h]} ${r === 0 && final ? 'cents' : 'cent'}`);
  }
  if (r > 0 || h === 0) parts.push(below100(r, final));
  return parts.join(' ');
}

const SCALES = [
  { value: 1_000_000_000, singular: 'milliard', plural: 'milliards' },
  { value: 1_000_000, singular: 'million', plural: 'millions' },
];

/** Integer to French words, e.g. 1_280_000 → "un million deux cent quatre-vingt mille". */
export function toWordsFr(n: number): string {
  checkWordsNumber(n);
  return wordsFr(n);
}

function wordsFr(n: number): string {
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  let rest = n;
  for (const s of SCALES) {
    const count = Math.floor(rest / s.value);
    rest %= s.value;
    if (count > 0) {
      // million / milliard are nouns, so "deux cents millions", "quatre-vingts millions".
      parts.push(count === 1 ? `un ${s.singular}` : `${wordsFr(count)} ${s.plural}`);
    }
  }
  const thousands = Math.floor(rest / 1000);
  const units = rest % 1000;
  if (thousands > 0) {
    // "mille" is invariable and the number before it never takes the plural "s".
    parts.push(thousands === 1 ? 'mille' : `${below1000(thousands, false)} mille`);
  }
  if (units > 0) parts.push(below1000(units, true));
  return parts.join(' ');
}

export interface FrCurrency {
  singular: string;
  plural: string;
  subSingular: string;
  subPlural: string;
}

export const DINAR_FR: FrCurrency = {
  singular: 'dinar algérien',
  plural: 'dinars algériens',
  subSingular: 'centime',
  subPlural: 'centimes',
};

/** "un million de dinars", "deux millions de dinars", but "un million cent dinars". */
function needsDe(n: number): boolean {
  return n >= 1_000_000 && n % 1_000_000 === 0;
}

/** Amount in DZD to French words: 1250.5 → "mille deux cent cinquante dinars algériens et cinquante centimes". */
export function amountToWordsFr(amount: number, currency: FrCurrency = DINAR_FR): string {
  const { whole, cents } = splitAmount(amount);
  checkWordsNumber(whole);
  const noun = whole >= 2 ? currency.plural : currency.singular;
  let out = `${wordsFr(whole)} ${needsDe(whole) ? 'de ' : ''}${noun}`;
  if (cents > 0) out += ` et ${wordsFr(cents)} ${cents >= 2 ? currency.subPlural : currency.subSingular}`;
  return out;
}

export function splitAmount(amount: number): { whole: number; cents: number } {
  const totalCents = toCents(amount);
  return { whole: Math.floor(totalCents / 100), cents: totalCents % 100 };
}

/**
 * Amount in DA to whole centimes, rounding half up on the amount as written:
 * 1.005 → 101 and 2.675 → 268. Multiplying by 100 first would give 100.49999…
 * for 1.005, because computers store decimals in binary.
 */
export function toCents(amount: number): number {
  checkAmount(amount);
  // The shortest decimal string that represents the number, e.g. "1.005".
  let text = String(amount);
  if (/e/i.test(text)) {
    if (amount >= 1) throw new DzkitError('invalid-amount', `Amount too large: ${amount}`);
    text = amount.toFixed(20);
  }
  const [int = '0', frac = ''] = text.split('.');
  const digits = (frac + '000').slice(0, 3);
  let cents = Number(int) * 100 + Number(digits.slice(0, 2));
  if (Number(digits[2]) >= 5) cents += 1;
  if (!Number.isSafeInteger(cents)) throw new DzkitError('invalid-amount', `Amount too large: ${amount}`);
  return cents;
}
