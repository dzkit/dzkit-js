/**
 * Business identifiers. No public check-digit algorithm is published for these,
 * so these functions check the format only. To confirm a NIF really exists, use the
 * DGI portal (nifenligne.mf.gov.dz).
 */

import { NIF_LENGTHS, NIS_LENGTHS } from '../generated/spec-data';
import { cleanText } from '../core';

function hasLength(digits: string | null, lengths: readonly number[]): boolean {
  return digits !== null && /^\d+$/.test(digits) && lengths.includes(digits.length);
}

/** Digits with spaces, dots and dashes removed; null if not text. */
function clean(input: unknown): string | null {
  const text = cleanText(input);
  return text === null ? null : text.replace(/[\s.\-]/g, '');
}

/**
 * NIF (numéro d'identification fiscale): 15 digits, or 20 digits for a branch
 * or secondary establishment.
 */
export function isValidNif(input: unknown): boolean {
  return hasLength(clean(input), NIF_LENGTHS);
}

/**
 * NIS (numéro d'identification statistique, issued by the ONS): 15 digits, plus a
 * 3-digit sequence number (18 digits) for a secondary establishment
 * (décret exécutif n° 97-396, articles 4 and 5).
 */
export function isValidNis(input: unknown): boolean {
  return hasLength(clean(input), NIS_LENGTHS);
}

/** Removes spaces, dots and dashes: "408 020 000 150 039" → "408020000150039". Null if not text. */
export function compactId(input: unknown): string | null {
  return clean(input);
}
