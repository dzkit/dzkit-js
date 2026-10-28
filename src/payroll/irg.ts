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

export interface Bracket {
  /** Upper bound of the bracket in DA per month (Infinity for the last one). */
  upTo: number;
  rate: number;
}

/** Monthly scale: the annual article-104 scale divided by 12. */
export const IRG_BRACKETS_2022: readonly Bracket[] = Object.freeze([
  { upTo: 20_000, rate: 0 },
  { upTo: 40_000, rate: 0.23 },
  { upTo: 80_000, rate: 0.27 },
  { upTo: 160_000, rate: 0.3 },
  { upTo: 320_000, rate: 0.33 },
  { upTo: Infinity, rate: 0.35 },
]);

export type IrgRegime = 'salaried' | 'retired' | 'disabled';

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
  exemptionThreshold: 30_000,
  abatementRate: 0.4,
  abatementMin: 1_000,
  abatementMax: 1_500,
  salariedSmoothingUpTo: 35_000,
  favourableSmoothingUpTo: 42_500,
});

export interface IrgOptions {
  /** "retired" (régime général) and "disabled" workers get the extended smoothing up to 42 500 DA. */
  regime?: IrgRegime;
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

function floorTenth(x: number): number {
  // The small epsilon absorbs floating-point noise such as 957.8499999.
  return Math.floor(x * 10 + 1e-6) / 10;
}

function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/** IRG from the progressive scale only. */
export function irgFromScale(taxable: number, brackets: readonly Bracket[] = IRG_BRACKETS_2022): number {
  let tax = 0;
  let lower = 0;
  for (const b of brackets) {
    if (taxable <= lower) break;
    tax += (Math.min(taxable, b.upTo) - lower) * b.rate;
    lower = b.upTo;
  }
  return round2(tax);
}

/** Monthly IRG with every step shown. */
export function irgBreakdown(taxable: number, options: IrgOptions = {}): IrgBreakdown {
  if (!Number.isFinite(taxable) || taxable < 0) throw new RangeError(`Expected a non-negative amount, got ${taxable}`);
  const r = options.rules ?? IRG_RULES_2022;
  const regime = options.regime ?? 'salaried';
  const scaleIrg = irgFromScale(taxable, r.brackets);

  if (taxable <= r.exemptionThreshold) {
    return { taxable, scaleIrg, abatement: 0, smoothing: 0, irg: 0, exempt: true };
  }

  const abatement = Math.min(Math.max(scaleIrg * r.abatementRate, r.abatementMin), r.abatementMax);
  const afterFirst = scaleIrg - abatement;
  let irg = afterFirst;

  if (regime === 'salaried' && taxable < r.salariedSmoothingUpTo) {
    irg = (afterFirst * 137) / 51 - 27_925 / 8;
  } else if (regime !== 'salaried' && taxable < r.favourableSmoothingUpTo) {
    irg = (afterFirst * 93) / 61 - 81_213 / 41;
  }

  irg = Math.max(0, floorTenth(irg));
  return {
    taxable,
    scaleIrg,
    abatement: round2(abatement),
    smoothing: round2(Math.max(0, afterFirst - irg)),
    irg,
    exempt: false,
  };
}

/** Monthly IRG to withhold, in DA. */
export function calculateIrg(taxable: number, options?: IrgOptions): number {
  return irgBreakdown(taxable, options).irg;
}
