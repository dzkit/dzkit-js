/**
 * Algerian phone numbers (+213), following ARPCE's national numbering plan (PNN, 2008).
 *
 * National format:
 *   mobile   0[5|6|7]XXXXXXXX  (10 digits): 05 Ooredoo, 06 Mobilis, 07 Djezzy
 *   landline 0[2|3|4]XXXXXXX   (9 digits): 2-digit area code + 6 digits
 *   service  08XXXXXXXX        (10 digits): 0800 freephone, 0801–0809 value-added services
 *   VoIP     09XXXXXXXX        (10 digits): 0982 non-geographic VoIP, 0961 VSAT
 *
 * `allocated` tells whether the number falls in a block ARPCE has assigned. Validation
 * does not require it, so a block assigned after this list was written still validates.
 *
 * The operator is derived from the prefix. Algeria has no mobile number portability
 * today; if it is introduced, the prefix will no longer prove the current operator.
 */

import {
  PHONE_FREEPHONE_BLOCKS,
  PHONE_MOBILE_BLOCKS,
  PHONE_OPERATORS,
  PHONE_SERVICE_BLOCKS,
  PHONE_VOIP_BLOCKS,
} from '../generated/spec-data';
import { cleanText } from '../core';

export type PhoneType = 'mobile' | 'landline' | 'service' | 'voip';
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
  /**
   * Mobile, service and VoIP numbers: whether the number is in a block ARPCE has
   * allocated. Not set for landlines.
   */
  allocated?: boolean;
  /** Service numbers: true for 0800 freephone numbers. */
  freephone?: boolean;
}

/**
 * Mobile blocks allocated by ARPCE, as 3-digit prefixes after the leading 0
 * (inclusive ranges). Generated from dzkit-spec (rule telecom.phone).
 */
export const MOBILE_BLOCKS: Readonly<Record<MobileOperator, readonly (readonly [number, number])[]>> =
  Object.freeze(PHONE_MOBILE_BLOCKS);

const OPERATORS: Readonly<Record<string, MobileOperator>> = PHONE_OPERATORS;

function inBlocks(prefix: number, blocks: readonly (readonly [number, number])[]): boolean {
  return blocks.some(([from, to]) => prefix >= from && prefix <= to);
}

function toNationalNumber(input: unknown): string | null {
  const text = cleanText(input);
  if (text === null) return null;
  let s = text.replace(/[\s.\-()/]/g, '');
  if (s.startsWith('+213')) s = s.slice(4);
  else if (s.startsWith('00213')) s = s.slice(5);
  else if (s.startsWith('213') && (s.length === 11 || s.length === 12)) s = s.slice(3);
  else if (s.startsWith('0')) s = s.slice(1);
  else return null;
  if (s.startsWith('0')) s = s.slice(1); // "+213 0551…" is a common typing mistake
  return /^\d+$/.test(s) ? s : null;
}

/**
 * Parses an Algerian phone number. Accepts 0551…, +213551…, 00213551…, 213551…, with
 * spaces, dots, dashes, slashes or parentheses, and Arabic-Indic digits. Returns null
 * for anything else, including non-text values.
 */
export function parsePhone(input: unknown): ParsedPhone | null {
  const n = toNationalNumber(input);
  if (n === null) return null;
  const base = { nationalNumber: n, national: `0${n}`, e164: `+213${n}` };

  if (/^[567]\d{8}$/.test(n)) {
    const operator = OPERATORS[n[0] as string] as MobileOperator;
    return { type: 'mobile', ...base, operator, allocated: inBlocks(Number(n.slice(0, 3)), MOBILE_BLOCKS[operator]) };
  }
  if (/^8\d{8}$/.test(n)) {
    const block = Number(n.slice(0, 3));
    return {
      type: 'service',
      ...base,
      freephone: inBlocks(block, PHONE_FREEPHONE_BLOCKS),
      allocated: inBlocks(block, PHONE_SERVICE_BLOCKS),
    };
  }
  if (/^9\d{8}$/.test(n)) return { type: 'voip', ...base, allocated: inBlocks(Number(n.slice(0, 3)), PHONE_VOIP_BLOCKS) };
  if (/^[234]\d{7}$/.test(n)) return { type: 'landline', ...base, areaCode: n.slice(0, 2) };
  return null;
}

export interface PhoneOptions {
  /** Only accept this type of number. */
  type?: PhoneType;
  /** Also require the number to be in a block ARPCE has allocated (not checked for landlines). */
  allocatedOnly?: boolean;
}

export function isValidPhone(input: unknown, options: PhoneType | PhoneOptions = {}): boolean {
  const opts: PhoneOptions = typeof options === 'string' ? { type: options } : options;
  const p = parsePhone(input);
  if (p === null) return false;
  if (opts.type !== undefined && p.type !== opts.type) return false;
  if (opts.allocatedOnly && p.allocated === false) return false;
  return true;
}

export function isValidMobile(input: unknown, options: Omit<PhoneOptions, 'type'> = {}): boolean {
  return isValidPhone(input, { ...options, type: 'mobile' });
}

export function getMobileOperator(input: unknown): MobileOperator | null {
  return parsePhone(input)?.operator ?? null;
}

/** Formats as "0551 23 45 67" (national) or "+213 551 23 45 67" (international); null if invalid. */
export function formatPhone(input: unknown, style: 'national' | 'international' = 'national'): string | null {
  const p = parsePhone(input);
  if (!p) return null;
  const n = p.nationalNumber;
  const pairs = (s: string) => s.match(/\d{2}/g)?.join(' ') ?? s;
  if (p.type === 'landline') {
    const rest = `${n.slice(0, 2)} ${pairs(n.slice(2))}`;
    return style === 'national' ? `0${rest}` : `+213 ${rest}`;
  }
  const rest = `${n.slice(0, 3)} ${pairs(n.slice(3))}`;
  return style === 'national' ? `0${rest}` : `+213 ${rest}`;
}
