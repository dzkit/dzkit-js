/**
 * Business identifiers. No public check-digit algorithm is published for these,
 * so these functions check the format only. To confirm a NIF really exists, use the
 * DGI portal (nifenligne.mf.gov.dz).
 */

function clean(input: string): string {
  return input.replace(/[\s.\-]/g, '');
}

/**
 * NIF (numéro d'identification fiscale): 15 digits, or 20 digits for a branch
 * or secondary establishment.
 */
export function isValidNif(input: string): boolean {
  return /^(\d{15}|\d{20})$/.test(clean(input));
}

/**
 * NIS (numéro d'identification statistique, issued by the ONS): 15 digits, plus a
 * 3-digit sequence number (18 digits) for a secondary establishment
 * (décret exécutif n° 97-396, articles 4 and 5).
 */
export function isValidNis(input: string): boolean {
  return /^(\d{15}|\d{18})$/.test(clean(input));
}

/** Removes spaces, dots and dashes: "408 020 000 150 039" → "408020000150039". */
export function compactId(input: string): string {
  return clean(input);
}
