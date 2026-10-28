import { getWilaya, type Wilaya } from '../data/wilayas';
import {
  PLATE_CATEGORY_DATA,
  PLATE_NEW_WILAYAS_FROM,
  PLATE_SERIAL_DISPLAY_DIGITS,
  PLATE_WILAYA_MAX,
  PLATE_WILAYA_MAX_BEFORE,
} from '../generated/spec-data';

/**
 * Algerian licence plates: SERIAL-CYY-WW, e.g. "02639-126-09".
 *   SERIAL  1–6 digits, chronological number
 *   C       vehicle category (1 = passenger car … 9 = motorcycle)
 *   YY      last two digits of the year of first registration
 *   WW      wilaya code, 01–69 (59–69 issued from 1 January 2027)
 */

// Categories and dates are generated from dzkit-spec (rule vehicles.plates).
export const VEHICLE_CATEGORIES = Object.freeze(
  Object.fromEntries(PLATE_CATEGORY_DATA.map((c) => [c.code, c.fr])) as Record<VehicleCategory, string>,
);

export type VehicleCategory = (typeof PLATE_CATEGORY_DATA)[number]['code'];

/** First day plates with wilaya codes 59–69 are issued (midnight, Algeria time). */
export const NEW_WILAYA_PLATES_FROM = new Date(`${PLATE_NEW_WILAYAS_FROM}T00:00:00+01:00`);

export interface ParsedPlate {
  serial: string;
  category: VehicleCategory;
  categoryName: string;
  /** Two-digit year as printed on the plate. */
  year: string;
  wilaya: Wilaya;
}

export interface PlateOptions {
  /**
   * Date to check codes 59–69 against. Plates with those codes are only valid
   * from 1 January 2027. Defaults to today.
   */
  at?: Date;
}

/** Parses a plate written with dashes, spaces or nothing between groups. */
export function parsePlate(input: string, options: PlateOptions = {}): ParsedPlate | null {
  const s = input.trim();
  const m =
    /^(\d{1,6})[\s\-]+([1-9])(\d{2})[\s\-]+(\d{2})$/.exec(s) ??
    /^(\d{5,6})([1-9])(\d{2})(\d{2})$/.exec(s.replace(/\s/g, ''));
  if (!m) return null;
  const [, serial, cat, year, ww] = m as unknown as [string, string, string, string, string];
  if (/^0+$/.test(serial)) return null;
  if (!(Number(cat) in VEHICLE_CATEGORIES)) return null;
  const wilaya = getWilaya(ww);
  if (!wilaya || wilaya.code > PLATE_WILAYA_MAX) return null;
  const at = options.at ?? new Date();
  if (wilaya.code > PLATE_WILAYA_MAX_BEFORE && at < NEW_WILAYA_PLATES_FROM) return null;
  const category = Number(cat) as VehicleCategory;
  return { serial, category, categoryName: VEHICLE_CATEGORIES[category], year, wilaya };
}

export function isValidPlate(input: string, options?: PlateOptions): boolean {
  return parsePlate(input, options) !== null;
}

/** Formats as "02639-126-09" (serial padded to 5 digits). */
export function formatPlate(input: string, options?: PlateOptions): string {
  const p = parsePlate(input, options);
  if (!p) throw new TypeError(`Invalid Algerian licence plate: ${input}`);
  return `${p.serial.padStart(PLATE_SERIAL_DISPLAY_DIGITS, '0')}-${p.category}${p.year}-${String(p.wilaya.code).padStart(2, '0')}`;
}
