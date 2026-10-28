import { describe, expect, it } from 'vitest';
import { amountToWords, amountToWordsAr, amountToWordsFr, DzkitError, toWordsAr, toWordsFr } from '../src';

describe('French', () => {
  it.each([
    [0, 'zéro'],
    [1, 'un'],
    [16, 'seize'],
    [17, 'dix-sept'],
    [21, 'vingt et un'],
    [22, 'vingt-deux'],
    [71, 'soixante et onze'],
    [72, 'soixante-douze'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [91, 'quatre-vingt-onze'],
    [99, 'quatre-vingt-dix-neuf'],
    [100, 'cent'],
    [101, 'cent un'],
    [200, 'deux cents'],
    [201, 'deux cent un'],
    [280, 'deux cent quatre-vingts'],
    [1000, 'mille'],
    [1001, 'mille un'],
    [2000, 'deux mille'],
    [80000, 'quatre-vingt mille'],
    [200000, 'deux cent mille'],
    [1_000_000, 'un million'],
    [2_000_000, 'deux millions'],
    [80_000_000, 'quatre-vingts millions'],
    [200_000_000, 'deux cents millions'],
    [1_280_000, 'un million deux cent quatre-vingt mille'],
    [3_000_000_000, 'trois milliards'],
  ])('%i → %s', (n, words) => expect(toWordsFr(n)).toBe(words));

  it('writes DZD amounts', () => {
    expect(amountToWordsFr(1)).toBe('un dinar algérien');
    expect(amountToWordsFr(1250.5)).toBe('mille deux cent cinquante dinars algériens et cinquante centimes');
    expect(amountToWordsFr(0.01)).toBe('zéro dinar algérien et un centime');
    expect(amountToWordsFr(1_000_000)).toBe('un million de dinars algériens');
    expect(amountToWordsFr(1_000_100)).toBe('un million cent dinars algériens');
  });

  it('rounds to the centime', () => {
    expect(amountToWordsFr(10.999)).toBe('onze dinars algériens');
    expect(amountToWordsFr(0.1 + 0.2)).toBe('zéro dinar algérien et trente centimes');
  });

  it('rejects negative, invalid or too large amounts with DzkitError "invalid-amount"', () => {
    for (const f of [() => amountToWordsFr(-1), () => amountToWordsFr(Number.NaN), () => toWordsFr(1.5), () => toWordsFr(1e12), () => amountToWordsFr(1e12)]) {
      expect(f).toThrow(DzkitError);
      try {
        f();
      } catch (e) {
        expect((e as DzkitError).code).toBe('invalid-amount');
      }
    }
    expect(() => amountToWords(1, 'en' as 'fr')).toThrow(/Unknown language/);
  });
});

describe('Arabic', () => {
  it.each([
    [0, 'صفر'],
    [1, 'واحد'],
    [11, 'أحد عشر'],
    [12, 'اثنا عشر'],
    [13, 'ثلاثة عشر'],
    [21, 'واحد وعشرون'],
    [100, 'مائة'],
    [250, 'مائتان وخمسون'],
    [1000, 'ألف'],
    [2000, 'ألفان'],
    [3000, 'ثلاثة آلاف'],
    [11000, 'أحد عشر ألفا'],
    [100000, 'مائة ألف'],
    [2500, 'ألفان وخمسمائة'],
    [1_000_000, 'مليون'],
    [5_000_000, 'خمسة ملايين'],
    // A count before a scale word is in construct form: the dual loses its ن.
    [200_000, 'مائتا ألف'],
    [200_200, 'مائتا ألف ومائتان'],
    [200_000_000, 'مائتا مليون'],
  ])('%i → %s', (n, words) => expect(toWordsAr(n)).toBe(words));

  it('writes DZD amounts with noun and adjective agreement', () => {
    expect(amountToWordsAr(1)).toBe('دينار جزائري واحد');
    expect(amountToWordsAr(2)).toBe('ديناران جزائريان');
    expect(amountToWordsAr(3)).toBe('ثلاثة دنانير جزائرية');
    expect(amountToWordsAr(15)).toBe('خمسة عشر دينارا جزائريا');
    expect(amountToWordsAr(100)).toBe('مائة دينار جزائري');
    expect(amountToWordsAr(1250.5)).toBe('ألف ومائتان وخمسون دينارا جزائريا وخمسون سنتيما');
  });

  // Before the currency, the number's last word takes the construct form (إضافة):
  // the dual loses its ن and ألفا / مليونا become ألف / مليون.
  it.each([
    [200, 'مائتا دينار جزائري'],
    [1_200, 'ألف ومائتا دينار جزائري'],
    [2_000, 'ألفا دينار جزائري'],
    [11_000, 'أحد عشر ألف دينار جزائري'],
    [45_000, 'خمسة وأربعون ألف دينار جزائري'],
    [50_000, 'خمسون ألف دينار جزائري'],
    [200_000, 'مائتا ألف دينار جزائري'],
    [2_000_000, 'مليونا دينار جزائري'],
    [11_000_000, 'أحد عشر مليون دينار جزائري'],
    [2_000_000_000, 'مليارا دينار جزائري'],
    // Unchanged when something follows the scale word or the form is not dual/accusative.
    [2_500, 'ألفان وخمسمائة دينار جزائري'],
    [3_000, 'ثلاثة آلاف دينار جزائري'],
    [45_250, 'خمسة وأربعون ألفا ومائتان وخمسون دينارا جزائريا'],
    [200.5, 'مائتا دينار جزائري وخمسون سنتيما'],
  ])('amount %d → %s', (amount, words) => expect(amountToWordsAr(amount)).toBe(words));

  it('rounds to the centime half up, as the amount is written', () => {
    expect(amountToWordsAr(1.005)).toBe('دينار جزائري واحد وسنتيم واحد');
    expect(amountToWordsFr(1.005)).toBe('un dinar algérien et un centime');
    expect(amountToWordsFr(2.675)).toBe('deux dinars algériens et soixante-huit centimes');
    expect(amountToWordsFr(0.285)).toBe('zéro dinar algérien et vingt-neuf centimes');
    expect(amountToWordsFr(10.075)).toBe('dix dinars algériens et huit centimes');
    expect(amountToWordsFr(1.004)).toBe('un dinar algérien');
    expect(amountToWordsFr(123_456_789.995)).toBe('cent vingt-trois millions quatre cent cinquante-six mille sept cent quatre-vingt-dix dinars algériens');
  });

  it('amountToWords switches language', () => {
    expect(amountToWords(2, 'fr')).toBe('deux dinars algériens');
    expect(amountToWords(2, 'ar')).toBe('ديناران جزائريان');
  });
});
