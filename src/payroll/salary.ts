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

/**
 * Smallest gross salary that gives at least `targetNet`, found by bisection.
 * Useful for job offers stated as a net amount.
 */
export function netToGross(targetNet: number, options: SalaryOptions = {}): SalaryResult {
  if (!Number.isFinite(targetNet) || targetNet < 0) throw new RangeError(`Expected a non-negative amount, got ${targetNet}`);
  let lo = targetNet;
  let hi = targetNet * 2 + 10_000;
  while (grossToNet(hi, options).net < targetNet) hi *= 2;
  for (let i = 0; i < 100 && hi - lo > 0.005; i++) {
    const mid = (lo + hi) / 2;
    if (grossToNet(mid, options).net >= targetNet) hi = mid;
    else lo = mid;
  }
  return grossToNet(Math.ceil(hi * 100) / 100, options);
}
