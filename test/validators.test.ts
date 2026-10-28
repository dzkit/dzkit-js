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

  it('numbers the 2025 wilayas as in décret présidentiel 26-206', () => {
    expect(WILAYAS.slice(58).map((w) => w.name)).toEqual([
      'Aflou',
      'Barika',
      'El Kantara',
      'Bir El Ater',
      'El Aricha',
      'Ksar Chellala',
      'Aïn Ouessara',
      'Messaad',
      'Ksar El Boukhari',
      'Bou Saâda',
      'El Abiodh Sidi Cheikh',
    ]);
  });

  it('has a French and an Arabic name for every wilaya', () => {
    for (const w of WILAYAS) {
      expect(w.name.trim()).not.toBe('');
      expect(w.nameAr).toMatch(/^[\u0600-\u06FF\s]+$/);
    }
  });

  it('looks up by number or string', () => {
    expect(getWilaya(16)?.name).toBe('Alger');
    expect(getWilaya('09')?.nameAr).toBe('البليدة');
    expect(getWilaya(69)?.name).toBe('El Abiodh Sidi Cheikh');
    expect(getWilaya(70)).toBeNull();
    expect(getWilaya(0)).toBeNull();
  });

  it('rejects codes that are not exactly digits', () => {
    for (const code of ['16a', '1e1', '16.0', 16.5, '', ' 1 6', null, undefined, true]) expect(getWilaya(code)).toBeNull();
    expect(getWilaya('016')?.name).toBe('Alger');
    expect(getWilaya('٠٩')?.name).toBe('Blida');
  });

  it('knows when each wilaya was created', () => {
    expect(getWilaya(60, { at: '2026-04-03' })).toBeNull();
    expect(getWilaya(60, { at: '2026-04-04' })?.name).toBe('Barika');
    expect(getWilaya(50, { at: '2019-12-10' })).toBeNull();
    expect(getWilaya(50, { at: new Date('2020-06-01') })?.parent).toBe(1);
    expect(getWilaya(16, { at: '1983-12-31' })).toBeNull();
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

  it('tells whether a mobile number is in a block ARPCE has allocated', () => {
    expect(parsePhone('0551234567')?.allocated).toBe(true);
    expect(parsePhone('0541234567')?.allocated).toBe(true);
    expect(parsePhone('0561234567')?.allocated).toBe(true);
    expect(parsePhone('0563234567')?.allocated).toBe(false);
    expect(parsePhone('0655234567')?.allocated).toBe(true);
    expect(parsePhone('0654234567')?.allocated).toBe(false);
    expect(parsePhone('0676234567')?.allocated).toBe(true);
    expect(parsePhone('0685234567')?.allocated).toBe(false);
    expect(parsePhone('0699234567')?.allocated).toBe(true);
    expect(parsePhone('0784234567')?.allocated).toBe(true);
    expect(parsePhone('0785234567')?.allocated).toBe(false);
    expect(parsePhone('0791234567')?.allocated).toBe(true);
  });

  it('only rejects unallocated blocks when asked to', () => {
    expect(isValidMobile('0685234567')).toBe(true);
    expect(isValidMobile('0685234567', { allocatedOnly: true })).toBe(false);
    expect(isValidPhone('0551234567', { type: 'mobile', allocatedOnly: true })).toBe(true);
    expect(isValidPhone('021234567', { allocatedOnly: true })).toBe(true);
  });

  it('recognises freephone, value-added and VoIP numbers', () => {
    expect(parsePhone('0800 12 34 56')).toMatchObject({ type: 'service', freephone: true, allocated: true });
    expect(parsePhone('0803 12 34 56')).toMatchObject({ type: 'service', freephone: false, allocated: true });
    expect(parsePhone('0807 12 34 56')).toMatchObject({ type: 'service', allocated: false });
    expect(parsePhone('0982 12 34 56')).toMatchObject({ type: 'voip', allocated: true });
    expect(parsePhone('0961 12 34 56')).toMatchObject({ type: 'voip', allocated: true });
    expect(parsePhone('0951 12 34 56')).toMatchObject({ type: 'voip', allocated: false });
  });

  it('formats', () => {
    expect(formatPhone('+213551234567')).toBe('0551 23 45 67');
    expect(formatPhone('0551234567', 'international')).toBe('+213 551 23 45 67');
    expect(formatPhone('021234567')).toBe('021 23 45 67');
    expect(formatPhone('123')).toBeNull();
    expect(formatPhone(undefined)).toBeNull();
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
    expect(parsePlate('12345-127-64', after2027)?.wilaya.name).toBe('Ksar Chellala');
  });

  it.each(['12345-126-70', '12345-026-16', '00000-126-16', '1234567-126-16', '12345-12-16'])('rejects %s', (p) =>
    expect(isValidPlate(p, after2027)).toBe(false),
  );

  it('formats with a 5-digit serial', () => {
    expect(formatPlate('2639 126 09', before2027)).toBe('02639-126-09');
  });
});
