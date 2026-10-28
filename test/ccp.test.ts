import { describe, expect, it } from 'vitest';
import { ccpKey, ccpToRip, formatRip, isValidCcp, isValidRip, parseRip, ripKey } from '../src';

// Real RIP numbers published on public forums, used as reference values.
const REAL_RIPS = [
  '00799999002311500797', // key 97: the edge case most calculators get wrong (they return 00)
  '00799999000633482956',
  '00799999000169242896',
  '00799999001880462576',
  '00799999123456789006',
];

describe('RIP', () => {
  it.each(REAL_RIPS)('validates real RIP %s', (rip) => {
    expect(isValidRip(rip)).toBe(true);
    expect(ripKey(rip.slice(8, 18))).toBe(rip.slice(18));
  });

  it('builds a RIP from a short CCP number', () => {
    expect(ccpToRip('23115007')).toBe('00799999002311500797');
    expect(ccpToRip(6334829)).toBe('00799999000633482956');
  });

  it('rejects a wrong key, wrong prefix or wrong length', () => {
    expect(isValidRip('00799999002311500796')).toBe(false);
    expect(isValidRip('00899999002311500797')).toBe(false);
    expect(isValidRip('0079999900231150079')).toBe(false);
    expect(isValidRip('0079999900231150079a')).toBe(false);
  });

  it('accepts spaces and dashes', () => {
    expect(isValidRip('007 99999 0023115007 97')).toBe(true);
    expect(isValidRip('007-99999-0023115007-97')).toBe(true);
  });

  it('parses and formats', () => {
    expect(parseRip('00799999123456789006')).toEqual({
      bankCode: '007',
      branchCode: '99999',
      account: '1234567890',
      key: '06',
      ccpKey: '45',
    });
    expect(formatRip('00799999002311500797')).toBe('007 99999 0023115007 97');
  });

  it('returns null for an invalid account number, never throws', () => {
    expect(ripKey('12345678901')).toBeNull();
    expect(ccpToRip('abc')).toBeNull();
    expect(ccpToRip(undefined)).toBeNull();
    expect(ccpKey(null)).toBeNull();
    expect(formatRip('123')).toBeNull();
  });

  it('accepts Arabic-Indic digits and an integer account', () => {
    expect(ccpToRip('٢٣١١٥٠٠٧')).toBe('00799999002311500797');
    expect(ccpToRip(23115007)).toBe('00799999002311500797');
    expect(isValidRip('٠٠٧ ٩٩٩٩٩ ٠٠٢٣١١٥٠٠٧ ٩٧')).toBe(true);
  });
});

describe('CCP key', () => {
  it('computes the key printed after the account number', () => {
    expect(ccpKey('1234567890')).toBe('45');
    expect(isValidCcp('1234567890', '45')).toBe(true);
    expect(isValidCcp('1234567890', 45)).toBe(true);
    expect(isValidCcp('1234567890', '44')).toBe(false);
  });

  it('pads short keys and accounts', () => {
    // 0000000001 → 1 × 4 = 4 → "04"
    expect(ccpKey('1')).toBe('04');
    expect(isValidCcp('1', '4')).toBe(true);
  });
});
