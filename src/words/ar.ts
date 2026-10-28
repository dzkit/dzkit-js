/**
 * Arabic number words for amounts (nominative case, masculine counted noun such as دينار).
 *
 * Counted-noun rules applied to the last two digits of each number:
 *   1        → singular + واحد            (دينار واحد)
 *   2        → dual                       (ديناران)
 *   3–10     → plural, number in ة form   (ثلاثة دنانير)
 *   11–99    → singular accusative        (أحد عشر دينارا)
 *   00, 01, 02 after hundreds → singular  (مائة دينار)
 * The same rules give ألف / ألفان / آلاف / ألفا, مليون / مليونان / ملايين / مليونا, etc.
 *
 * When a number is directly followed by the noun it counts (إضافة), its last word
 * takes the construct form: the dual loses its ن (مائتا دينار، ألفا دينار) and the
 * accusative ألفا / مليونا becomes ألف / مليون (خمسون ألف دينار). This applies to the
 * scale words inside a number (مائتا ألف) and to the whole number before the currency.
 */

import { checkWordsNumber, toCents } from './fr';

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
const TEENS: Record<number, string> = {
  11: 'أحد عشر',
  12: 'اثنا عشر',
};
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function below100(n: number): string {
  if (n <= 10) return ONES[n] as string;
  if (n < 20) return TEENS[n] ?? `${ONES[n - 10]} عشر`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? (TENS[t] as string) : `${ONES[u]} و${TENS[t]}`;
}

/** 0–999. `construct`: a noun follows directly, so 200 is written مائتا. */
function below1000(n: number, construct = false): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return below100(r);
  if (r === 0) return h === 2 && construct ? 'مائتا' : (HUNDREDS[h] as string);
  return `${HUNDREDS[h]} و${below100(r)}`;
}

export interface ArNoun {
  /** دينار */
  singular: string;
  /** ديناران */
  dual: string;
  /** دنانير (used after 3–10) */
  plural: string;
  /** دينارا (used after 11–99) */
  accusative: string;
}

interface ScaleNoun extends ArNoun {
  /** Dual before a noun: ألفا دينار */
  dualConstruct: string;
}

const SCALES: { value: number; noun: ScaleNoun }[] = [
  {
    value: 1_000_000_000,
    noun: { singular: 'مليار', dual: 'ملياران', plural: 'مليارات', accusative: 'مليارا', dualConstruct: 'مليارا' },
  },
  {
    value: 1_000_000,
    noun: { singular: 'مليون', dual: 'مليونان', plural: 'ملايين', accusative: 'مليونا', dualConstruct: 'مليونا' },
  },
  { value: 1_000, noun: { singular: 'ألف', dual: 'ألفان', plural: 'آلاف', accusative: 'ألفا', dualConstruct: 'ألفا' } },
];

/**
 * "count + scale noun" with the agreement rules above. The count is always followed
 * by the scale noun, so it is written in construct form (مائتا ألف). `construct`:
 * the scale noun itself is followed by another noun (ألفا دينار، خمسون ألف دينار).
 */
function counted(count: number, noun: ScaleNoun, construct: boolean): string {
  if (count === 1) return noun.singular;
  if (count === 2) return construct ? noun.dualConstruct : noun.dual;
  const words = below1000(count, true);
  const last2 = count % 100;
  if (last2 >= 3 && last2 <= 10) return `${words} ${noun.plural}`;
  if (last2 >= 11) return `${words} ${construct ? noun.singular : noun.accusative}`;
  return `${words} ${noun.singular}`;
}

/** Integer to words. `construct`: a noun follows directly (an amount before its currency). */
function wordsAr(n: number, construct: boolean): string {
  if (n === 0) return 'صفر';
  const parts: string[] = [];
  let rest = n;
  for (const s of SCALES) {
    const count = Math.floor(rest / s.value);
    rest %= s.value;
    if (count === 0) continue;
    // The scale noun is in construct only if it is the last word of the number.
    const last = construct && rest === 0;
    if (count >= 1000) parts.push(`${wordsAr(count, true)} ${s.noun.singular}`);
    else parts.push(counted(count, s.noun, last));
  }
  if (rest > 0) parts.push(below1000(rest, construct));
  return parts.join(' و');
}

/** Integer to Arabic words, e.g. 2500 → "ألفان وخمسمائة", 200000 → "مائتا ألف". */
export function toWordsAr(n: number): string {
  checkWordsNumber(n);
  return wordsAr(n, false);
}

export interface ArCurrency {
  noun: ArNoun;
  /** Adjective forms matching the noun: جزائري / جزائريان / جزائرية / جزائريا */
  adjective?: ArNoun;
  subNoun: ArNoun;
}

export const DINAR_AR: ArCurrency = {
  noun: { singular: 'دينار', dual: 'ديناران', plural: 'دنانير', accusative: 'دينارا' },
  adjective: { singular: 'جزائري', dual: 'جزائريان', plural: 'جزائرية', accusative: 'جزائريا' },
  subNoun: { singular: 'سنتيم', dual: 'سنتيمان', plural: 'سنتيمات', accusative: 'سنتيما' },
};

function form(count: number): keyof ArNoun {
  if (count === 1) return 'singular';
  if (count === 2) return 'dual';
  const last2 = count % 100;
  if (last2 >= 3 && last2 <= 10) return 'plural';
  if (last2 >= 11) return 'accusative';
  return 'singular';
}

function amountPart(count: number, noun: ArNoun, adjective?: ArNoun): string {
  const f = form(count);
  const nounWithAdj = adjective ? `${noun[f]} ${adjective[f]}` : noun[f];
  if (count === 0) return `صفر ${nounWithAdj}`;
  if (count === 1) return `${nounWithAdj} واحد`;
  if (count === 2) return nounWithAdj;
  return `${wordsAr(count, true)} ${nounWithAdj}`;
}

/** Amount in DZD to Arabic words: 1250.5 → "ألف ومائتان وخمسون دينارا جزائريا وخمسون سنتيما". */
export function amountToWordsAr(amount: number, currency: ArCurrency = DINAR_AR): string {
  const totalCents = toCents(amount);
  const whole = Math.floor(totalCents / 100);
  checkWordsNumber(whole);
  const cents = totalCents % 100;
  let out = amountPart(whole, currency.noun, currency.adjective);
  if (cents > 0) out += ` و${amountPart(cents, currency.subNoun)}`;
  return out;
}
