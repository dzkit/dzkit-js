import { WILAYA_DATA, WILAYAS_VALID_FROM } from '../generated/spec-data';
import { cleanText, dayOrNull, type DateInput } from '../core';

export interface Wilaya {
  /** Official code, 1–69 (also used on licence plates). */
  code: number;
  /** Name in French / Latin script. */
  name: string;
  /** Name in Arabic. */
  nameAr: string;
  /** For wilayas created after 1984: the code of the wilaya it was created from. */
  parent?: number;
  /** For wilayas created after 1984: first day it exists, "YYYY-MM-DD". */
  validFrom?: string;
}

// Codes 1–48: loi n° 84-09 (1984) and décret n° 84-79. Codes 49–58: loi n° 19-12
// (11 December 2019) and décret présidentiel n° 21-117. Codes 59–69: loi n° 26-06
// (4 April 2026) and décret présidentiel n° 26-206 (JO n° 40), which fixes their
// names and numbers. Generated from dzkit-spec (rule administrative.wilayas).
export const WILAYAS: readonly Wilaya[] = Object.freeze(WILAYA_DATA.map((w) => Object.freeze({ ...w })));

export interface WilayaOptions {
  /**
   * Day of the lookup (a Date, or "YYYY-MM-DD"). A wilaya that didn't exist yet on that
   * day is not found, e.g. code 60 before 4 April 2026. Defaults to today in Algeria.
   */
  at?: DateInput;
}

/** Code 1–69 from an integer, or from text of 1–3 digits ("9", "09", "016", "٠٩"). */
function toCode(code: unknown): number | null {
  if (typeof code === 'number') return Number.isSafeInteger(code) ? code : null;
  const text = cleanText(code);
  if (text === null || !/^\d{1,3}$/.test(text)) return null;
  return Number(text);
}

/** The wilaya with this code, whatever the date. Used for plates, which have their own dates. */
export function wilayaByCode(code: unknown): Wilaya | null {
  const n = toCode(code);
  if (n === null) return null;
  const w = WILAYAS[n - 1];
  return w?.code === n ? w : null;
}

/**
 * Looks up a wilaya by its official code: an integer, or text of 1–3 digits. Returns
 * null for anything else ("16a", "1e1", 16.5), and for a wilaya that doesn't exist yet
 * on the day given by `at` (today by default).
 */
export function getWilaya(code: unknown, options: WilayaOptions = {}): Wilaya | null {
  const w = wilayaByCode(code);
  if (!w) return null;
  const day = dayOrNull(options.at);
  if (day === null || day < WILAYAS_VALID_FROM) return null;
  if (w.validFrom && day < w.validFrom) return null;
  return w;
}
