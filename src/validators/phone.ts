/**
 * Algerian phone numbers (+213).
 *
 * National format:
 *   mobile   0[5|6|7]XXXXXXXX  (10 digits) — 05 Ooredoo, 06 Mobilis, 07 Djezzy
 *   landline 0[2|3|4]XXXXXXX   (9 digits)  — 2-digit area code + 6 digits
 *   VoIP     09XXXXXXXX        (10 digits)
 *
 * The operator is derived from the prefix. Algeria has no mobile number portability
 * today; if it is introduced, the prefix will no longer prove the current operator.
 */

export type PhoneType = 'mobile' | 'landline' | 'voip';
export type MobileOperator = 'Ooredoo' | 'Mobilis' | 'Djezzy';

export interface ParsedPhone {
  type: PhoneType;
  /** Number without country code or leading 0, e.g. "551234567". */
  nationalNumber: string;
  /** "0551234567" */
  national: string;
  /** "+213551234567" */
  e164: string;
  operator?: MobileOperator;
  /** Landline area code, e.g. "21" for Algiers. */
  areaCode?: string;
}

const OPERATORS: Record<string, MobileOperator> = {
  '5': 'Ooredoo',
  '6': 'Mobilis',
  '7': 'Djezzy',
};

function toNationalNumber(input: string): string | null {
  let s = input.trim().replace(/[\s.\-()]/g, '');
  if (s.startsWith('+213')) s = s.slice(4);
  else if (s.startsWith('00213')) s = s.slice(5);
  else if (s.startsWith('213') && (s.length === 11 || s.length === 12)) s = s.slice(3);
  else if (s.startsWith('0')) s = s.slice(1);
  else return null;
  if (s.startsWith('0')) s = s.slice(1); // "+213 0551…" is a common typing mistake
  return /^\d+$/.test(s) ? s : null;
}

/** Parses an Algerian phone number. Accepts 0551…, +213551…, 00213551…, with spaces or dashes. */
export function parsePhone(input: string): ParsedPhone | null {
  const n = toNationalNumber(input);
  if (n === null) return null;
  const base = { nationalNumber: n, national: `0${n}`, e164: `+213${n}` };

  if (/^[567]\d{8}$/.test(n)) {
    return { type: 'mobile', ...base, operator: OPERATORS[n[0] as string] };
  }
  if (/^9\d{8}$/.test(n)) return { type: 'voip', ...base };
  if (/^[234]\d{7}$/.test(n)) return { type: 'landline', ...base, areaCode: n.slice(0, 2) };
  return null;
}

export function isValidPhone(input: string, type?: PhoneType): boolean {
  const p = parsePhone(input);
  return p !== null && (type === undefined || p.type === type);
}

export function isValidMobile(input: string): boolean {
  return isValidPhone(input, 'mobile');
}

export function getMobileOperator(input: string): MobileOperator | null {
  return parsePhone(input)?.operator ?? null;
}

/** Formats as "0551 23 45 67" (national) or "+213 551 23 45 67" (international). */
export function formatPhone(input: string, style: 'national' | 'international' = 'national'): string {
  const p = parsePhone(input);
  if (!p) throw new TypeError(`Invalid Algerian phone number: ${input}`);
  const n = p.nationalNumber;
  const pairs = (s: string) => s.match(/\d{2}/g)?.join(' ') ?? s;
  if (p.type === 'landline') {
    const rest = `${n.slice(0, 2)} ${pairs(n.slice(2))}`;
    return style === 'national' ? `0${rest}` : `+213 ${rest}`;
  }
  const rest = `${n.slice(0, 3)} ${pairs(n.slice(3))}`;
  return style === 'national' ? `0${rest}` : `+213 ${rest}`;
}
