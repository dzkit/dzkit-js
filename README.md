**English** | [Français](README.fr.md) | [العربية](README.ar.md)

# dzkit 🇩🇿

[![CI](https://github.com/dzkit/dzkit-js/actions/workflows/ci.yml/badge.svg)](https://github.com/dzkit/dzkit-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/dzkit.svg)](https://www.npmjs.com/package/dzkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

The small things every Algerian app ends up rewriting, tested once and shared:

- **CCP / RIP**: Algérie Poste keys, RIP generation and validation
- **Phone numbers**: parse, validate, format, detect the operator
- **NIF / NIS**: format checks
- **Licence plates**: parse and validate, including the new wilaya codes 59–69
- **69 wilayas**: codes, French and Arabic names
- **Amounts in words**: DZD in French and Arabic, for invoices
- **Payroll**: IRG (article 104) and CNAS, gross ↔ net

Zero dependencies, TypeScript types included, works in Node 20+ and the browser.

**[Try it in your browser](https://dzkit.github.io/dzkit-js/)**, no install needed.

```bash
npm install dzkit
```

## CCP and RIP

```ts
import { ccpToRip, isValidRip, ccpKey, parseRip } from 'dzkit';

ccpToRip('23115007');                 // '00799999002311500797'
isValidRip('007 99999 0023115007 97'); // true
ccpKey('1234567890');                 // '45'  (the key written after the CCP number)
parseRip('00799999123456789006');
// { bankCode: '007', branchCode: '99999', account: '1234567890', key: '06', ccpKey: '45' }
```

Tested against real RIP numbers, including key `97`, which many calculators get wrong (they return `00`).

## Phone numbers

```ts
import { parsePhone, formatPhone, getMobileOperator } from 'dzkit';

parsePhone('+213 551 23 45 67');
// { type: 'mobile', operator: 'Ooredoo', national: '0551234567', e164: '+213551234567', ... }
getMobileOperator('0661234567');          // 'Mobilis'
formatPhone('0771234567', 'international'); // '+213 771 23 45 67'
```

05 = Ooredoo, 06 = Mobilis, 07 = Djezzy, 08 = freephone and value-added services, 09 = VoIP, 02x/03x/04x = landline. The operator comes from the prefix; Algeria has no mobile number portability today.

`allocated` tells you whether the number is in a block ARPCE has actually assigned (for example, Mobilis has 0655–0676 and 0696–0699, so 0685… doesn't exist yet). Validation doesn't require it by default, so a newly assigned block keeps working; pass `{ allocatedOnly: true }` to be strict:

```ts
parsePhone('0685 12 34 56')?.allocated;                // false
isValidMobile('0685 12 34 56', { allocatedOnly: true }); // false
```

## NIF and NIS

```ts
import { isValidNif, isValidNis } from 'dzkit';

isValidNif('408 020 000 150 039'); // true  (15 digits, or 20 for a branch)
isValidNis('098716010002343');     // true  (15 digits, or 18 for a secondary establishment)
```

No public check-digit algorithm exists for these, so this checks the format only. To confirm a NIF exists, use the DGI portal (nifenligne.mf.gov.dz).

## Licence plates

```ts
import { parsePlate, formatPlate } from 'dzkit';

parsePlate('02639-126-09');
// { serial: '02639', category: 1, categoryName: 'Véhicule de tourisme', year: '26', wilaya: { code: 9, name: 'Blida', ... } }

parsePlate('12345-127-64', { at: new Date('2027-03-01') })?.wilaya.name; // 'Ksar Chellala'
```

Codes 59–69 are only accepted from 1 January 2027, when the new wilayas get their plates. Pass `at` to check another date.

## Wilayas

```ts
import { WILAYAS, getWilaya } from 'dzkit';

WILAYAS.length;      // 69
getWilaya(16);       // { code: 16, name: 'Alger', nameAr: 'الجزائر' }
```

Need communes, dairas or postal codes? Use [geoalgeria](https://www.npmjs.com/package/geoalgeria) alongside this package.

## Amounts in words

```ts
import { amountToWords, toWordsFr, toWordsAr } from 'dzkit';

amountToWords(1250.5, 'fr');
// 'mille deux cent cinquante dinars algériens et cinquante centimes'
amountToWords(1250.5, 'ar');
// 'ألف ومائتان وخمسون دينارا جزائريا وخمسون سنتيما'

toWordsFr(80_000_000); // 'quatre-vingts millions'
toWordsAr(3000);       // 'ثلاثة آلاف'
```

French follows the traditional agreement rules (quatre-vingts, deux cents, mille invariable, « un million de dinars »). Arabic applies the counted-noun rules: دينار واحد، ديناران، ثلاثة دنانير، خمسة عشر دينارا، مائة دينار.

## Payroll: IRG and CNAS

```ts
import { grossToNet, calculateIrg, irgBreakdown, netToGross } from 'dzkit';

grossToNet(60_000);
// { gross: 60000, cnasEmployee: 5400, taxable: 54600, irg: 7042, net: 47558,
//   cnasEmployer: 15300, employerCost: 75300 }

calculateIrg(40_000);                        // 3100
calculateIrg(40_000, { regime: 'retired' }); // 2745.4
irgBreakdown(32_000);                        // every step, for payslips
netToGross(47_558).gross;                    // ≈ 60000
```

What it implements (article 104 of the CIDTA, scale from the 2022 finance law, unchanged for salaries in 2026):

| Monthly taxable income (DA) | Rate |
|---|---|
| 0 – 20 000 | 0 % |
| 20 001 – 40 000 | 23 % |
| 40 001 – 80 000 | 27 % |
| 80 001 – 160 000 | 30 % |
| 160 001 – 320 000 | 33 % |
| above 320 000 | 35 % |

- Taxable income up to 30 000 DA: exempt
- 40 % abatement on the tax, bounded between 1 000 and 1 500 DA
- 30 000–35 000 DA: second abatement, `IRG × 137/51 − 27 925/8`
- Retirees (régime général) and disabled workers, 30 000–42 500 DA: `IRG × 93/61 − 81 213/41`
- Rounded down to the tenth of a dinar, like the DGI table
- CNAS: 9 % employee, 25 % + 0.5 % employer (both overridable)

Published reference values from the DGI table are part of the unit tests. Out of scope for now: non-monthly bonuses (10 % flat withholding), exempt allowances, and the training and apprenticeship taxes.

## Sources

Every rule comes from an official text, ranked by the hierarchy of Algerian legal texts. The rules, their sources and the evidence behind each one are kept in [dzkit-spec](https://github.com/dzkit/dzkit-spec), shared by every dzkit package; see its [trust report](https://github.com/dzkit/dzkit-spec/blob/main/TRUST.md).

## Not legal advice

This is reference material, maintained with care and linked to its sources so you can check every value. It is not legal or tax advice. When a value matters, check it against the official text, and please [open an issue](https://github.com/dzkit/dzkit-js/issues) if you find a difference.

## Contributing

Issues and pull requests are welcome in العربية, Français or English. See [CONTRIBUTING.md](CONTRIBUTING.md) and the project's [governance](https://github.com/dzkit/dzkit-spec/blob/main/GOVERNANCE.md).

Especially useful:

- A real example that fails (a RIP, a plate, an IRG amount from a payslip)
- A rule change from a new finance law
- The PHP / Laravel port

## License

[MIT](LICENSE) © Siroukane and the dzkit contributors. Official texts belong to their publishers.
