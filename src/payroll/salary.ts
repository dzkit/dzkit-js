import { CNAS_EMPLOYEE_RATE, CNAS_EMPLOYER_RATE, CNAS_SOCIAL_SERVICES_RATE } from '../generated/spec-data';
import { irgBreakdown, type IrgOptions } from './irg';
import { checkAmount, dayOf, DzkitError } from '../core';
import { toCents } from '../words/fr';

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

/** amountCents × rate, rounded half up to the centime, with integers. */
function percentOf(amountCents: number, rate: number): number {
  const ppm = BigInt(Math.round(rate * 1_000_000));
  return Number((BigInt(amountCents) * ppm + 500_000n) / 1_000_000n);
}

function checkRate(rate: number, name: string): number {
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new DzkitError('invalid-option', `${name} must be a rate between 0 and 1, got ${String(rate)}`);
  }
  return rate;
}

/**
 * Gross-to-net for a regular monthly salary fully subject to CNAS and IRG.
 * Non-monthly bonuses (10 % flat withholding) and exempt allowances are out of scope.
 */
export function grossToNet(gross: number, options: SalaryOptions = {}): SalaryResult {
  checkAmount(gross, 'gross salary');
  const employeeRate = checkRate(options.employeeRate ?? CNAS_RATES.employee, 'employeeRate');
  const employerRate = checkRate(options.employerRate ?? CNAS_RATES.employer + CNAS_RATES.socialServices, 'employerRate');

  const grossCents = toCents(gross);
  const cnasEmployeeCents = percentOf(grossCents, employeeRate);
  const taxableCents = grossCents - cnasEmployeeCents;
  const { irg } = irgBreakdown(taxableCents / 100, options);
  const cnasEmployerCents = percentOf(grossCents, employerRate);

  return {
    gross,
    cnasEmployee: cnasEmployeeCents / 100,
    taxable: taxableCents / 100,
    irg,
    net: (taxableCents - Math.round(irg * 100)) / 100,
    cnasEmployer: cnasEmployerCents / 100,
    employerCost: (grossCents + cnasEmployerCents) / 100,
  };
}

/**
 * Largest drop of net pay when gross goes up, in DA. Measured at every centime of gross
 * from 30 000 to 60 000 DA: 1.49 DA (salaried) where taxable income passes 30 000 DA,
 * because the law's smoothing formula starts at about 1.5 DA of IRG; 0.1 DA elsewhere,
 * because the IRG is rounded down to 0.1 DA. 2 DA leaves a margin.
 */
const MAX_NET_DIP = 2;

/**
 * Smallest gross salary, to the centime, whose net is at least `targetNet`.
 * Useful for job offers stated as a net amount.
 */
export function netToGross(targetNet: number, options: SalaryOptions = {}): SalaryResult {
  checkAmount(targetNet, 'net salary');
  // Resolve the date once instead of on every step.
  const opts: SalaryOptions = { ...options, at: dayOf(options.at) };
  if (targetNet === 0) return grossToNet(0, opts);
  const netAt = (cents: number) => grossToNet(cents / 100, opts).net;
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
  // Once the net is more than MAX_NET_DIP below the target, no lower gross can reach it.
  let best = hi;
  for (let c = hi - 1; c >= 0; c--) {
    const net = netAt(c);
    if (net >= targetNet) best = c;
    else if (net < targetNet - MAX_NET_DIP) break;
  }
  return grossToNet(best / 100, opts);
}
