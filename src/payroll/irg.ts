/**
 * IRG (impôt sur le revenu global) withheld monthly on salaries and pensions,
 * article 104 of the Code des impôts directs et taxes assimilées (scale from the 2022
 * finance law, unchanged for salaries in the 2026 finance law).
 *
 * Steps, applied to the monthly taxable income (gross minus the employee's social
 * security contribution):
 *   1. taxable ≤ 30 000 DA                → no IRG
 *   2. apply the monthly scale             → gross IRG
 *   3. subtract 40 % of it, bounded to [1 000, 1 500] DA
 *   4. salaried, 30 000 < taxable < 35 000 → IRG × 137/51 − 27 925/8
 *      retired or disabled worker, 30 000 < taxable < 42 500 → IRG × 93/61 − 81 213/41
 *   5. round down to the tenth of a dinar, as the DGI scale does
 */

import {
  IRG_ABATEMENT,
  IRG_EXEMPTION_THRESHOLD,
  IRG_FAVOURABLE_SMOOTHING,
  IRG_MONTHLY_BRACKETS,
  IRG_ROUNDING_STEP,
  IRG_SALARIED_SMOOTHING,
  IRG_REGIMES,
  IRG_VALID_FROM,
} from '../generated/spec-data';
import { checkAmount, dayOf, DzkitError, type DateInput } from '../core';
import { toCents } from '../words/fr';

export interface Bracket {
  /** Upper bound of the bracket in DA per month (Infinity for the last one). */
  upTo: number;
  rate: number;
}

/** Monthly scale: the annual article-104 scale divided by 12. Generated from dzkit-spec. */
export const IRG_BRACKETS_2022: readonly Bracket[] = Object.freeze(IRG_MONTHLY_BRACKETS.map((b) => Object.freeze({ ...b })));

export type IrgRegime = (typeof IRG_REGIMES)[number];

export interface IrgRules {
  brackets: readonly Bracket[];
  exemptionThreshold: number;
  abatementRate: number;
  abatementMin: number;
  abatementMax: number;
  salariedSmoothingUpTo: number;
  favourableSmoothingUpTo: number;
}

/** Rules in force for salaries since January 2022 (still in force in 2026). */
export const IRG_RULES_2022: IrgRules = Object.freeze({
  brackets: IRG_BRACKETS_2022,
  exemptionThreshold: IRG_EXEMPTION_THRESHOLD,
  abatementRate: IRG_ABATEMENT.rate,
  abatementMin: IRG_ABATEMENT.min,
  abatementMax: IRG_ABATEMENT.max,
  salariedSmoothingUpTo: IRG_SALARIED_SMOOTHING.below,
  favourableSmoothingUpTo: IRG_FAVOURABLE_SMOOTHING.below,
});

export interface IrgOptions {
  /**
   * "salaried" (default), "retired" (régime général) or "disabled". Retired and disabled
   * workers get the extended smoothing up to 42 500 DA. Any other value throws
   * DzkitError "invalid-option".
   */
  regime?: IrgRegime;
  /**
   * Day the salary relates to (a Date, or "YYYY-MM-DD"); today in Algeria by default.
   * Throws DzkitError "no-rule-for-date" before 2022, whose scale isn't recorded yet.
   */
  at?: DateInput;
  /** Custom rules (for simulations). The date is not checked when you pass them. */
  rules?: IrgRules;
}

export interface IrgBreakdown {
  taxable: number;
  /** IRG from the scale, before abatements. */
  scaleIrg: number;
  /** 40 % abatement after bounds. */
  abatement: number;
  /** Second abatement from the smoothing formula (0 when it doesn't apply). */
  smoothing: number;
  /** IRG to withhold. */
  irg: number;
  exempt: boolean;
}

/** Rate as an integer number of millionths (0.23 → 230 000), for exact arithmetic. */
const ppm = (rate: number) => Math.round(rate * 1_000_000);

/** Floor division for integers that may be negative. */
const floorDiv = (a: number, b: number) => Math.floor(a / b);

/**
 * Progressive scale in whole centimes, rounded half up (OPERATIONS.md, irg.calculate).
 * Computed with integers: centimes × millionths, so no floating-point error.
 */
function scaleCents(taxableCents: number, brackets: readonly Bracket[]): number {
  // BigInt: centimes × millionths exceeds 2^53 for very large incomes.
  const t = BigInt(taxableCents);
  let units = 0n;
  let lower = 0n;
  for (const b of brackets) {
    if (t <= lower) break;
    const upper = b.upTo === Infinity ? t : BigInt(Math.round(b.upTo * 100));
    const top = t < upper ? t : upper;
    units += (top - lower) * BigInt(ppm(b.rate));
    lower = upper;
    if (b.upTo === Infinity) break;
  }
  return Number((units + 500_000n) / 1_000_000n);
}

function checkRegime(regime: unknown): IrgRegime {
  if (!(IRG_REGIMES as readonly unknown[]).includes(regime)) {
    throw new DzkitError('invalid-option', `Unknown IRG regime "${String(regime)}"; expected one of ${IRG_REGIMES.join(', ')}`);
  }
  return regime as IrgRegime;
}

/** IRG from the progressive scale only, rounded half up to the centime. */
export function irgFromScale(taxable: number, brackets: readonly Bracket[] = IRG_BRACKETS_2022): number {
  checkAmount(taxable, 'taxable income');
  return scaleCents(toCents(taxable), brackets) / 100;
}

/** Monthly IRG with every step shown. */
export function irgBreakdown(taxable: number, options: IrgOptions = {}): IrgBreakdown {
  checkAmount(taxable, 'taxable income');
  const regime = checkRegime(options.regime ?? 'salaried');
  const day = dayOf(options.at);
  if (!options.rules && day < IRG_VALID_FROM) {
    throw new DzkitError('no-rule-for-date', `No IRG scale is recorded before ${IRG_VALID_FROM} (asked for ${day})`);
  }
  const r = options.rules ?? IRG_RULES_2022;
  const cents = toCents(taxable);
  const scale = scaleCents(cents, r.brackets);
  const scaleIrg = scale / 100;

  if (cents <= Math.round(r.exemptionThreshold * 100)) {
    return { taxable, scaleIrg, abatement: 0, smoothing: 0, irg: 0, exempt: true };
  }

  // From here, amounts are in tenths of a centime (1 DA = 1 000), all integers.
  const scaleT = scale * 10;
  const abatementT = Math.min(Math.max(Math.round(scaleT * r.abatementRate), r.abatementMin * 1000), r.abatementMax * 1000);
  const afterT = scaleT - abatementT;

  // IRG in tenths of a dinar (the DGI rounds down to 0.1 DA).
  let tenths = floorDiv(afterT, 100);
  const smoothing =
    regime === 'salaried' && cents < Math.round(r.salariedSmoothingUpTo * 100)
      ? IRG_SALARIED_SMOOTHING
      : regime !== 'salaried' && cents < Math.round(r.favourableSmoothingUpTo * 100)
        ? IRG_FAVOURABLE_SMOOTHING
        : null;
  if (smoothing) {
    // IRG × a/b − c/d, exactly: (afterT·a·d − 1000·b·c) / (1000·b·d) DA, in tenths.
    const [a, b] = smoothing.multiplier;
    const [c, d] = smoothing.subtract;
    tenths = floorDiv(afterT * a * d - 1000 * b * c, 100 * b * d);
  }
  const irg = Math.max(0, tenths) / 10;
  return {
    taxable,
    scaleIrg,
    abatement: abatementT / 1000,
    smoothing: Math.max(0, Math.round(afterT / 10) / 100 - irg),
    irg,
    exempt: false,
  };
}

/** Monthly IRG to withhold, in DA. */
export function calculateIrg(taxable: number, options?: IrgOptions): number {
  return irgBreakdown(taxable, options).irg;
}
