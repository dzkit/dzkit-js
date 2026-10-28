/**
 * Algérie Poste CCP (compte courant postal) and RIP (relevé d'identité postale).
 *
 * RIP layout (20 digits): 007 99999 CCCCCCCCCC KK
 *   007        bank code (CCP)
 *   99999      branch code
 *   CCCCCCCCCC CCP account number, left-padded with zeros to 10 digits
 *   KK         RIP key
 *
 * Both keys were checked against real RIP numbers (see test/ccp.test.ts).
 *
 * Codes and key parameters are generated from dzkit-spec (rule banking.ccp-rip).
 */

import {
  CCP_KEY_MODULUS,
  CCP_KEY_WEIGHTS_FROM_RIGHT,
  RIP_ACCOUNT_DIGITS,
  RIP_BANK_CODE,
  RIP_BRANCH_CODE,
  RIP_KEY,
} from '../generated/spec-data';
import { cleanText } from '../core';

export const RIP_PREFIX = RIP_BANK_CODE + RIP_BRANCH_CODE;

/** Text with whitespace, dots, dashes, underscores and slashes removed; null if not text. */
function digitsOnly(input: unknown): string | null {
  const text = cleanText(input);
  return text === null ? null : text.replace(/[\s.\-_/]/g, '');
}

/** 10-digit account, from text or a non-negative integer; null when it isn't one. */
function normalizeAccount(account: unknown): string | null {
  const raw = typeof account === 'number' ? (Number.isSafeInteger(account) && account >= 0 ? String(account) : null) : digitsOnly(account);
  if (raw === null || raw.length < 1 || raw.length > RIP_ACCOUNT_DIGITS || !/^\d+$/.test(raw)) return null;
  return raw.padStart(RIP_ACCOUNT_DIGITS, '0');
}

/**
 * Key printed after the CCP account number ("clé CCP"), e.g. 1234567890 clé 45.
 * Weighted sum of the digits from right to left (weights 4, 5, 6, …, 13), modulo 100.
 */
export function ccpKey(account: unknown): string | null {
  const acc = normalizeAccount(account);
  if (acc === null) return null;
  let sum = 0;
  CCP_KEY_WEIGHTS_FROM_RIGHT.forEach((weight, i) => {
    sum += Number(acc[acc.length - 1 - i]) * weight;
  });
  return String(sum % CCP_KEY_MODULUS).padStart(2, '0');
}

/** Checks a CCP account number together with its key, e.g. isValidCcp('1234567890', '45'). */
export function isValidCcp(account: unknown, key: unknown): boolean {
  const expected = ccpKey(account);
  const k = typeof key === 'number' ? (Number.isSafeInteger(key) && key >= 0 ? String(key) : null) : digitsOnly(key);
  if (expected === null || k === null || !/^\d{1,2}$/.test(k)) return false;
  return expected === k.padStart(2, '0');
}

/** RIP key for a CCP account: 97 − ((account × 100 + 85) mod 97), so the key is in 01–97. */
export function ripKey(account: unknown): string | null {
  const acc = normalizeAccount(account);
  if (acc === null) return null;
  const { modulus, multiplier, offset } = RIP_KEY;
  const key = modulus - ((Number(acc) * multiplier + offset) % modulus);
  return String(key).padStart(2, '0');
}

/** Builds the full 20-digit RIP from a CCP account number; null if it isn't one. */
export function ccpToRip(account: unknown): string | null {
  const acc = normalizeAccount(account);
  if (acc === null) return null;
  return RIP_PREFIX + acc + (ripKey(acc) as string);
}

export interface ParsedRip {
  bankCode: string;
  branchCode: string;
  account: string;
  key: string;
  /** Key you would write after the CCP number on a cheque or form. */
  ccpKey: string;
}

/** Validates a 20-digit RIP (spaces and dashes allowed). */
export function isValidRip(rip: unknown): boolean {
  return parseRip(rip) !== null;
}

/** Parses and validates a RIP. Returns null when the format or the key is wrong. */
export function parseRip(rip: unknown): ParsedRip | null {
  const r = digitsOnly(rip);
  if (r === null || !/^\d{20}$/.test(r) || !r.startsWith(RIP_PREFIX)) return null;
  const account = r.slice(8, 18);
  const key = r.slice(18);
  if (ripKey(account) !== key) return null;
  return {
    bankCode: r.slice(0, 3),
    branchCode: r.slice(3, 8),
    account,
    key,
    ccpKey: ccpKey(account) as string,
  };
}

/** Formats a valid RIP as "007 99999 0002311500 97"; null if it isn't valid. */
export function formatRip(rip: unknown): string | null {
  const p = parseRip(rip);
  if (!p) return null;
  return `${p.bankCode} ${p.branchCode} ${p.account} ${p.key}`;
}
