import { CNAS_EMPLOYEE_RATE, CNAS_EMPLOYER_RATE, CNAS_SOCIAL_SERVICES_RATE } from '../generated/spec-data';
import { irgBreakdown, type IrgOptions } from './irg';

/**
 * CNAS social security contributions (CNAS employer page):
 *   employee 9 %, employer 25 % + 0.5 % for social services (œuvres sociales).
 * The base is gross pay; there is no ceiling, and it may not fall below the SNMG.
 * Rates are generated from dzkit-spec (rule payroll.cnas).
 */
export const CNAS_RATES = Object.freeze({
  employee: CNAS_EMPLOYEE_RATE,
  employer: CNAS_EMPLOYER_RATE,
  socialServices: CNAS_SOCIAL_SERVICES_RATE,
});

export interface SalaryOptions extends IrgOptions {
  employeeRate?: number;
  /** Total employer rate, defaults to 25 % + 0.5 %. */
  employerRate?: number;
}

export interface SalaryResult {
  gross: number;
  cnasEmployee: number;
  /** Gross minus the employee's CNAS contribution: the base for IRG. */
  taxable: number;
  irg: number;
  net: number;
  cnasEmployer: number;
  /** Gross plus the employer's contributions (training and apprenticeship taxes not included). */
  employerCost: number;
}

function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/**
 * Gross-to-net for a regular monthly salary fully subject to CNAS and IRG.
 * Non-monthly bonuses (10 % flat withholding) and exempt allowances are out of scope.
 */
export function grossToNet(gross: number, options: SalaryOptions = {}): SalaryResult {
  if (!Number.isFinite(gross) || gross < 0) throw new RangeError(`Expected a non-negative amount, got ${gross}`);
  const employeeRate = options.employeeRate ?? CNAS_RATES.employee;
  const employerRate = options.employerRate ?? CNAS_RATES.employer + CNAS_RATES.socialServices;

  const cnasEmployee = round2(gross * employeeRate);
  const taxable = round2(gross - cnasEmployee);
  const { irg } = irgBreakdown(taxable, options);
  const cnasEmployer = round2(gross * employerRate);

  return {
    gross,
    cnasEmployee,
    taxable,
    irg,
    net: round2(taxable - irg),
    cnasEmployer,
    employerCost: round2(gross + cnasEmployer),
  };
}

/** How far below the found gross to look, in centimes (net dips last well under 20 DA). */
const NET_DIP_WINDOW = 2_000;

/**
 * Smallest gross salary, to the centime, whose net is at least `targetNet`.
 * Useful for job offers stated as a net amount.
 */
export function netToGross(targetNet: number, options: SalaryOptions = {}): SalaryResult {
  if (!Number.isFinite(targetNet) || targetNet < 0) throw new RangeError(`Expected a non-negative amount, got ${targetNet}`);
  if (targetNet === 0) return grossToNet(0, options);
  const netAt = (cents: number) => grossToNet(cents / 100, options).net;
  // Search whole centimes. Net is never above gross, so any gross below the target
  // gives too little: `lo` always fails and `hi` always succeeds.
  let lo = Math.ceil(targetNet * 100) - 1;
  let hi = Math.max(lo + 1, lo * 2);
  while (netAt(hi) < targetNet) {
    lo = hi;
    hi *= 2;
  }
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (netAt(mid) >= targetNet) hi = mid;
    else lo = mid;
  }
  // Net is not strictly increasing at the centime: the IRG is rounded down to 0.1 DA
  // and jumps by about 1.5 DA when taxable income passes 30 000 DA. A slightly lower
  // gross can still reach the target, so look a little below the one found.
  let best = hi;
  for (let c = hi - 1; c >= Math.max(0, hi - NET_DIP_WINDOW); c--) if (netAt(c) >= targetNet) best = c;
  return grossToNet(best / 100, options);
}
