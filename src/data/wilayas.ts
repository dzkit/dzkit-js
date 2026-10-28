import { WILAYA_DATA } from '../generated/spec-data';

export interface Wilaya {
  /** Official code, 1–69 (also used on licence plates). */
  code: number;
  /** Name in French / Latin script. */
  name: string;
  /** Name in Arabic. */
  nameAr: string;
}

// Codes 1–58: décret n° 84-79 (1984), completed in 2019.
// Codes 59–69: loi n° 26-06 of 4 April 2026 (69 wilayas) and décret présidentiel
// n° 26-206 of 25 May 2026 (JO n° 40), which fixes their names and numbers.
// The list is generated from dzkit-spec (rule administrative.wilayas), with its sources.
export const WILAYAS: readonly Wilaya[] = Object.freeze(WILAYA_DATA.map((w) => Object.freeze({ ...w })));

/** Look up a wilaya by its official code (1–69). */
export function getWilaya(code: number | string): Wilaya | undefined {
  const n = typeof code === 'string' ? Number.parseInt(code, 10) : code;
  return WILAYAS[n - 1]?.code === n ? WILAYAS[n - 1] : undefined;
}
