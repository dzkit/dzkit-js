import { getWilaya, type Wilaya } from '../data/wilayas';

/**
 * Algerian licence plates: SERIAL-CYY-WW, e.g. "02639-126-09".
 *   SERIAL  1–6 digits, chronological number
 *   C       vehicle category (1 = passenger car … 9 = motorcycle)
 *   YY      last two digits of the year of first registration
 *   WW      wilaya code, 01–69 (59–69 issued from 1 January 2027)
 */

export const VEHICLE_CATEGORIES = Object.freeze({
  1: 'Véhicule de tourisme',
  2: 'Camion',
  3: 'Camionnette',
  4: 'Autocar / autobus',
  5: 'Tracteur routier',
  6: 'Autre tracteur',
  7: 'Véhicule spécial',
  8: 'Remorque / semi-remorque',
  9: 'Motocyclette',
} as const);

export type VehicleCategory = keyof typeof VEHICLE_CATEGORIES;

/** First day plates with wilaya codes 59–69 are issued. */
export const NEW_WILAYA_PLATES_FROM = new Date('2027-01-01T00:00:00+01:00');

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
  const wilaya = getWilaya(ww);
  if (!wilaya) return null;
  const at = options.at ?? new Date();
  if (wilaya.code >= 59 && at < NEW_WILAYA_PLATES_FROM) return null;
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
  return `${p.serial.padStart(5, '0')}-${p.category}${p.year}-${String(p.wilaya.code).padStart(2, '0')}`;
}
