import { describe, expect, it } from 'vitest';
import {
  WILAYAS,
  formatPhone,
  formatPlate,
  getMobileOperator,
  getWilaya,
  isValidMobile,
  isValidNif,
  isValidNis,
  isValidPhone,
  isValidPlate,
  parsePhone,
  parsePlate,
} from '../src';

describe('wilayas', () => {
  it('lists 69 wilayas with consecutive codes', () => {
    expect(WILAYAS).toHaveLength(69);
    WILAYAS.forEach((w, i) => expect(w.code).toBe(i + 1));
  });

  it('looks up by number or string', () => {
    expect(getWilaya(16)?.name).toBe('Alger');
    expect(getWilaya('09')?.nameAr).toBe('البليدة');
    expect(getWilaya(69)?.name).toBe('Messaad');
    expect(getWilaya(70)).toBeUndefined();
    expect(getWilaya(0)).toBeUndefined();
  });
});

describe('phone', () => {
  it.each([
    ['0551234567', 'Ooredoo'],
    ['0661234567', 'Mobilis'],
    ['0771234567', 'Djezzy'],
    ['+213 551 23 45 67', 'Ooredoo'],
    ['00213661234567', 'Mobilis'],
    ['213771234567', 'Djezzy'],
    ['+213 0771 23 45 67', 'Djezzy'],
  ])('parses mobile %s', (input, operator) => {
    expect(isValidMobile(input)).toBe(true);
    expect(getMobileOperator(input)).toBe(operator);
  });

  it('parses landline and VoIP', () => {
    expect(parsePhone('021 23 45 67')).toMatchObject({ type: 'landline', areaCode: '21', e164: '+21321234567' });
    expect(parsePhone('0982 12 34 56')).toMatchObject({ type: 'voip' });
    expect(isValidPhone('021234567', 'mobile')).toBe(false);
  });

  it.each(['055123456', '05512345678', '0151234567', '551234567', 'abc', '', '+33612345678'])(
    'rejects %s',
    (input) => expect(isValidPhone(input)).toBe(false),
  );

  it('formats', () => {
    expect(formatPhone('+213551234567')).toBe('0551 23 45 67');
    expect(formatPhone('0551234567', 'international')).toBe('+213 551 23 45 67');
    expect(formatPhone('021234567')).toBe('021 23 45 67');
    expect(() => formatPhone('123')).toThrow(TypeError);
  });
});

describe('NIF / NIS', () => {
  it('checks NIF format (15 or 20 digits)', () => {
    expect(isValidNif('408 020 000 150 039')).toBe(true);
    expect(isValidNif('41201600000606600001')).toBe(true);
    expect(isValidNif('12345')).toBe(false);
    expect(isValidNif('X1600100000000V')).toBe(false);
  });

  it('checks NIS format (15 or 18 digits)', () => {
    expect(isValidNis('098716010002343')).toBe(true);
    expect(isValidNis('098716010002343001')).toBe(true);
    expect(isValidNis('0987160100023430')).toBe(false);
  });
});

describe('licence plates', () => {
  const after2027 = { at: new Date('2027-06-01') };
  const before2027 = { at: new Date('2026-10-28') };

  it('parses a standard plate', () => {
    expect(parsePlate('02639-126-09', before2027)).toMatchObject({
      serial: '02639',
      category: 1,
      categoryName: 'Véhicule de tourisme',
      year: '26',
      wilaya: { code: 9, name: 'Blida' },
    });
  });

  it('accepts spaces or no separators', () => {
    expect(isValidPlate('12345 119 16', before2027)).toBe(true);
    expect(isValidPlate('1234511916', before2027)).toBe(true);
  });

  it('accepts codes 59–69 only from 1 January 2027', () => {
    expect(isValidPlate('12345-127-64', before2027)).toBe(false);
    expect(isValidPlate('12345-127-64', after2027)).toBe(true);
    expect(parsePlate('12345-127-64', after2027)?.wilaya.name).toBe('Bou Saâda');
  });

  it.each(['12345-126-70', '12345-026-16', '00000-126-16', '1234567-126-16', '12345-12-16'])('rejects %s', (p) =>
    expect(isValidPlate(p, after2027)).toBe(false),
  );

  it('formats with a 5-digit serial', () => {
    expect(formatPlate('2639 126 09', before2027)).toBe('02639-126-09');
  });
});
