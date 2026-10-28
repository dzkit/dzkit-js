import { describe, expect, it } from 'vitest';
import { calculateIrg, DzkitError, grossToNet, irgBreakdown, irgFromScale, netToGross } from '../src';

// Reference values: DGI monthly IRG table as reported by Algérie 360 (16 Oct 2026)
// and Teamed (21 Oct 2026), both read against article 104 of the CIDTA 2026.
describe('IRG', () => {
  it.each([
    [30_000, 0],
    [32_000, 957.8],
    [35_000, 2_070],
    [40_000, 3_100],
    [50_000, 5_800],
    [60_000, 8_500],
    [70_000, 11_200],
    [150_000, 34_900],
    [300_000, 84_100],
  ])('salaried, taxable %i DA → %f DA', (taxable, irg) => {
    expect(calculateIrg(taxable)).toBe(irg);
  });

  it.each([
    [30_000, 0],
    [32_000, 543.9],
    [35_000, 1_175],
    [40_000, 2_745.4],
    [50_000, 5_800],
    [70_000, 11_200],
  ])('retired, taxable %i DA → %f DA', (taxable, irg) => {
    expect(calculateIrg(taxable, { regime: 'retired' })).toBe(irg);
    expect(calculateIrg(taxable, { regime: 'disabled' })).toBe(irg);
  });

  it('is exempt up to 30 000 DA and never negative just above it', () => {
    expect(irgBreakdown(25_000).exempt).toBe(true);
    expect(calculateIrg(30_001)).toBeGreaterThanOrEqual(0);
    expect(calculateIrg(30_001, { regime: 'retired' })).toBeGreaterThanOrEqual(0);
  });

  it('never decreases as income rises', () => {
    let previous = 0;
    for (let t = 29_000; t <= 400_000; t += 50) {
      const irg = calculateIrg(t);
      expect(irg).toBeGreaterThanOrEqual(previous);
      previous = irg;
    }
  });

  it('shows the scale and abatement', () => {
    expect(irgFromScale(40_000)).toBe(4_600);
    expect(irgBreakdown(40_000)).toMatchObject({ scaleIrg: 4_600, abatement: 1_500, irg: 3_100 });
    expect(irgBreakdown(32_000)).toMatchObject({ scaleIrg: 2_760, abatement: 1_104 });
  });
});

describe('gross to net', () => {
  it('matches a published worked example (60 000 DA gross)', () => {
    // CNAS 9 % = 5 400, taxable 54 600, IRG 7 042, net 47 558
    expect(grossToNet(60_000)).toMatchObject({
      cnasEmployee: 5_400,
      taxable: 54_600,
      irg: 7_042,
      net: 47_558,
      cnasEmployer: 15_300,
      employerCost: 75_300,
    });
  });

  it('allows custom rates', () => {
    expect(grossToNet(100_000, { employerRate: 0.26 }).cnasEmployer).toBe(26_000);
  });

  it('net to gross round-trips', () => {
    const r = netToGross(47_558);
    expect(r.net).toBeGreaterThanOrEqual(47_558);
    expect(r.gross).toBeCloseTo(60_000, 0);
  });

  it('net to gross gives the smallest gross, to the centime, reaching the net', () => {
    for (const regime of ['salaried', 'retired'] as const) {
      for (let gross = 20_000; gross <= 120_000; gross += 173.37) {
        const g = Math.round(gross * 100) / 100;
        const { net } = grossToNet(g, { regime });
        const found = netToGross(net, { regime });
        expect(found.net).toBeGreaterThanOrEqual(net);
        expect(found.gross).toBeLessThanOrEqual(g);
        // One centime less no longer reaches the net (checked across the dip at 30 000 DA).
        expect(grossToNet(Math.round(found.gross * 100 - 1) / 100, { regime }).net).toBeLessThan(net);
      }
    }
  });

  it('net to gross of 0 is 0', () => {
    expect(netToGross(0).gross).toBe(0);
  });

  it('throws DzkitError for impossible requests instead of guessing', () => {
    const code = (f: () => unknown) => {
      try {
        f();
      } catch (e) {
        return e instanceof DzkitError ? e.code : 'not a DzkitError';
      }
      return 'no error';
    };
    expect(code(() => calculateIrg(40_000, { regime: 'retraite' as 'retired' }))).toBe('invalid-option');
    expect(code(() => calculateIrg(-1))).toBe('invalid-amount');
    expect(code(() => calculateIrg('40000' as unknown as number))).toBe('invalid-amount');
    expect(code(() => calculateIrg(40_000, { at: '2021-12-31' }))).toBe('no-rule-for-date');
    expect(code(() => calculateIrg(40_000, { at: '31/12/2026' }))).toBe('invalid-option');
    expect(code(() => grossToNet(60_000, { regime: 'x' as 'retired' }))).toBe('invalid-option');
    expect(code(() => grossToNet(60_000, { employeeRate: 9 }))).toBe('invalid-option');
    expect(code(() => netToGross(-5))).toBe('invalid-amount');
  });

  it('applies the rules of the day asked for', () => {
    expect(calculateIrg(40_000, { at: '2022-01-01' })).toBe(3_100);
    expect(calculateIrg(40_000, { at: new Date('2026-10-28') })).toBe(3_100);
  });
});
