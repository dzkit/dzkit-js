/**
 * French number words, traditional spelling (hyphens below 100, as on most invoices).
 * Handles the agreement rules: "quatre-vingts" / "quatre-vingt-un",
 * "deux cents" / "deux cent un", "mille" invariable, "millions" plural.
 */

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
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(`Expected a non-negative integer, got ${n}`);
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  let rest = n;
  for (const s of SCALES) {
    const count = Math.floor(rest / s.value);
    rest %= s.value;
    if (count > 0) {
      // million / milliard are nouns, so "deux cents millions", "quatre-vingts millions".
      parts.push(count === 1 ? `un ${s.singular}` : `${toWordsFr(count)} ${s.plural}`);
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
  const noun = whole >= 2 ? currency.plural : currency.singular;
  let out = `${toWordsFr(whole)} ${needsDe(whole) ? 'de ' : ''}${noun}`;
  if (cents > 0) out += ` et ${toWordsFr(cents)} ${cents >= 2 ? currency.subPlural : currency.subSingular}`;
  return out;
}

export function splitAmount(amount: number): { whole: number; cents: number } {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError(`Expected a non-negative amount, got ${amount}`);
  const totalCents = Math.round(amount * 100);
  if (!Number.isSafeInteger(totalCents)) throw new RangeError(`Amount too large: ${amount}`);
  return { whole: Math.floor(totalCents / 100), cents: totalCents % 100 };
}
