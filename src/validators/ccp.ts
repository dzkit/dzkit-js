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
 */

export const RIP_PREFIX = '00799999';

function digitsOnly(input: string): string {
  return input.replace(/[\s.\-_/]/g, '');
}

function normalizeAccount(account: string | number): string | null {
  const raw = digitsOnly(String(account));
  if (!/^\d{1,10}$/.test(raw)) return null;
  return raw.padStart(10, '0');
}

/**
 * Key printed after the CCP account number ("clé CCP"), e.g. 1234567890 clé 45.
 * Weighted sum of the digits from right to left (weights 4, 5, 6, …, 13), modulo 100.
 */
export function ccpKey(account: string | number): string {
  const acc = normalizeAccount(account);
  if (acc === null) throw new TypeError(`Invalid CCP account number: ${String(account)}`);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(acc[9 - i]) * (i + 4);
  }
  return String(sum % 100).padStart(2, '0');
}

/** Checks a CCP account number together with its key, e.g. isValidCcp('1234567890', '45'). */
export function isValidCcp(account: string | number, key: string | number): boolean {
  if (normalizeAccount(account) === null) return false;
  const k = digitsOnly(String(key));
  if (!/^\d{1,2}$/.test(k)) return false;
  return ccpKey(account) === k.padStart(2, '0');
}

/** RIP key for a CCP account: 97 − ((account × 100 + 85) mod 97), so the key is in 01–97. */
export function ripKey(account: string | number): string {
  const acc = normalizeAccount(account);
  if (acc === null) throw new TypeError(`Invalid CCP account number: ${String(account)}`);
  const key = 97 - ((Number(acc) * 100 + 85) % 97);
  return String(key).padStart(2, '0');
}

/** Builds the full 20-digit RIP from a CCP account number. */
export function ccpToRip(account: string | number): string {
  const acc = normalizeAccount(account);
  if (acc === null) throw new TypeError(`Invalid CCP account number: ${String(account)}`);
  return RIP_PREFIX + acc + ripKey(acc);
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
export function isValidRip(rip: string): boolean {
  return parseRip(rip) !== null;
}

/** Parses and validates a RIP. Returns null when the format or the key is wrong. */
export function parseRip(rip: string): ParsedRip | null {
  const r = digitsOnly(rip);
  if (!/^\d{20}$/.test(r) || !r.startsWith(RIP_PREFIX)) return null;
  const account = r.slice(8, 18);
  const key = r.slice(18);
  if (ripKey(account) !== key) return null;
  return {
    bankCode: r.slice(0, 3),
    branchCode: r.slice(3, 8),
    account,
    key,
    ccpKey: ccpKey(account),
  };
}

/** Formats a RIP as "007 99999 0002311500 97". */
export function formatRip(rip: string): string {
  const r = digitsOnly(rip);
  if (!/^\d{20}$/.test(r)) throw new TypeError(`A RIP has 20 digits: ${rip}`);
  return `${r.slice(0, 3)} ${r.slice(3, 8)} ${r.slice(8, 18)} ${r.slice(18)}`;
}
