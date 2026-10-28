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
 */

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

function below1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return below100(r);
  if (r === 0) return HUNDREDS[h] as string;
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

const SCALES: { value: number; noun: ArNoun }[] = [
  { value: 1_000_000_000, noun: { singular: 'مليار', dual: 'ملياران', plural: 'مليارات', accusative: 'مليارا' } },
  { value: 1_000_000, noun: { singular: 'مليون', dual: 'مليونان', plural: 'ملايين', accusative: 'مليونا' } },
  { value: 1_000, noun: { singular: 'ألف', dual: 'ألفان', plural: 'آلاف', accusative: 'ألفا' } },
];

/** "count + noun" with the agreement rules above. */
function counted(count: number, noun: ArNoun): string {
  if (count === 1) return noun.singular;
  if (count === 2) return noun.dual;
  const words = below1000(count);
  const last2 = count % 100;
  if (last2 >= 3 && last2 <= 10) return `${words} ${noun.plural}`;
  if (last2 >= 11) return `${words} ${noun.accusative}`;
  return `${words} ${noun.singular}`;
}

/** Integer to Arabic words, e.g. 2500 → "ألفان وخمسمائة". */
export function toWordsAr(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(`Expected a non-negative integer, got ${n}`);
  if (n === 0) return 'صفر';
  const parts: string[] = [];
  let rest = n;
  for (const s of SCALES) {
    const count = Math.floor(rest / s.value);
    rest %= s.value;
    if (count === 0) continue;
    if (count >= 1000) parts.push(`${toWordsAr(count)} ${s.noun.singular}`);
    else parts.push(counted(count, s.noun));
  }
  if (rest > 0) parts.push(below1000(rest));
  return parts.join(' و');
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
  return `${toWordsAr(count)} ${nounWithAdj}`;
}

/** Amount in DZD to Arabic words: 1250.5 → "ألف ومائتان وخمسون دينارا جزائريا وخمسون سنتيما". */
export function amountToWordsAr(amount: number, currency: ArCurrency = DINAR_AR): string {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError(`Expected a non-negative amount, got ${amount}`);
  const totalCents = Math.round(amount * 100);
  if (!Number.isSafeInteger(totalCents)) throw new RangeError(`Amount too large: ${amount}`);
  const whole = Math.floor(totalCents / 100);
  const cents = totalCents % 100;
  let out = amountPart(whole, currency.noun, currency.adjective);
  if (cents > 0) out += ` و${amountPart(cents, currency.subNoun)}`;
  return out;
}
