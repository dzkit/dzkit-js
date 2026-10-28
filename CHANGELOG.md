# Changelog

## 0.3.0 — 2026-10-28

Follows [dzkit-spec 0.3.0](https://github.com/dzkit/dzkit-spec/blob/main/CHANGELOG.md) and its new [OPERATIONS.md](https://github.com/dzkit/dzkit-spec/blob/main/OPERATIONS.md): passes all 273 shared test cases.

### Changed — what to check when upgrading

- **Validators, parsers and formatters never throw.** Invalid input, including non-text values such as `undefined` or a number, now gives `false` or `null`:
  - `ccpToRip`, `ccpKey`, `ripKey` return `null` for an invalid account (they threw a `TypeError`);
  - `formatPhone`, `formatPlate`, `formatRip` return `null` for invalid input (they threw a `TypeError`); `formatRip` now also checks the key;
  - `getWilaya` returns `null` instead of `undefined`, and `compactId` returns `null` for non-text input.
  If you relied on the `TypeError`, check for `null` instead.
- **Calculations throw `DzkitError` with a `code`** (`invalid-amount`, `invalid-option`, `no-rule-for-date`) instead of `RangeError`, and in more cases:
  - an **unknown IRG regime** now throws `invalid-option`; it was silently treated as retired, giving a lower tax;
  - a non-number amount (such as the text `"40000"`) throws `invalid-amount`;
  - amounts in words stop at 999 999 999 999.99 DA (`invalid-amount` above), and `amountToWords` with a language other than `fr` or `ar` throws `invalid-option` (it answered in French);
  - `calculateIrg`, `grossToNet` and `netToGross` throw `no-rule-for-date` for a date before 2022, whose IRG scale isn't recorded;
  - `grossToNet` checks that custom rates are between 0 and 1.
- **`getWilaya` is strict and knows dates.** `'16a'`, `'1e1'`, `'16.0'` and `16.5` no longer match a wilaya (`'16a'` gave Alger). With `{ at }`, a wilaya that didn't exist yet isn't found: 49–58 from 11 December 2019, 59–69 from 4 April 2026, none before 1984. Without `at`, today is used, so all 69 are found as before.
- **Payroll is computed with whole numbers.** The IRG scale and CNAS contributions are rounded half up to the centime exactly; floating-point arithmetic rounded some exact halves down. About 0.14 % of incomes change, by 0.01 to 0.1 DA, for example a gross of 777.50 DA: CNAS 69.98 DA (was 69.97). Results now match an exact computation on more than 1,000,000 checked cases.

### Added

- `DzkitError` (with `code`) and `toLatinDigits`.
- **Arabic-Indic digits** (٠١٢… and ۰۱۲…) are accepted by every parser and validator.
- `{ at }` option (a `Date` or `"YYYY-MM-DD"`) on `calculateIrg`, `irgBreakdown`, `grossToNet`, `netToGross` and `getWilaya`; `parsePlate` now also accepts a `"YYYY-MM-DD"` string.
- Wilayas 49–69 carry `parent` and `validFrom`.
- Phone numbers accept `/` as a separator, as in `0771/23/45/67`.
- The public API is listed explicitly and pinned by a test, so internal helpers can't leak into it.

### Fixed

- Playground: an IRG of zero showed as "-0.00 DA"; Arabic-Indic digits now work in the playground too.

### Security

- The release workflow is split in two jobs: one builds and tests without publishing rights, the other only publishes the tested tarball, with no project install and no cache. Every GitHub Action is pinned to a commit, and npm to an exact version.

## 0.2.1 — 2026-10-28

### Fixed

- **Arabic amounts in words: construct form before the currency.** When a number is directly followed by the noun it counts, the dual loses its ن and ألفا / مليونا become ألف / مليون. Round amounts were wrong before: 200 DA is now مائتا دينار جزائري (was مائتان دينار), 2 000 DA ألفا دينار (was ألفان دينار), 50 000 DA خمسون ألف دينار (was خمسون ألفا دينار), 200 000 مائتا ألف (was مائتان ألف). Amounts not ending in a dual or in thousands/millions are unchanged.
- **Rounding to the centime is now half up on the amount as written.** 1.005 DA gave "un dinar" (no centime) because of how computers store decimals; it now gives "un dinar et un centime", like 2.675 DA already gave 68 centimes. About 0.5 % of amounts with three or more decimals change. New export: `toCents`.
- **`netToGross` now returns the smallest gross, to the centime, whose net reaches the target.** It could return a gross whose net was 0.01 DA short (about 3.6 % of cases), or a few centimes more than needed. `netToGross(0)` now returns 0 instead of 0.01.

French amounts, the IRG and gross-to-net are unchanged.

## 0.2.0 — 2026-10-28

### Changed

- The data tables (wilayas, phone blocks, RIP and CCP key parameters, NIF/NIS lengths, plate categories and dates, IRG scale and abatements, CNAS rates) are now generated from [dzkit-spec](https://github.com/dzkit/dzkit-spec) 0.2.0 instead of being typed by hand. Results are identical to 0.1.0 (checked on more than 200,000 inputs), except two plate category names, which now follow the spec: "Autocar ou autobus" and "Remorque ou semi-remorque".
- `SPEC_VERSION` tells which dzkit-spec version the data comes from.

### Tests

- Every rule is now checked against the shared test cases of [dzkit-spec](https://github.com/dzkit/dzkit-spec) 0.2.0 (144 cases, each linked to its source). dzkit-spec is a development dependency only: the published package still has no dependencies.

## 0.1.0 — 2026-10-28

First release, published on npm as `@dzkit/dzkit-js` (npm refused the unscoped name `dzkit` as too close to existing packages).

- CCP key, RIP key, RIP generation, parsing and validation
- Phone number parsing, validation, formatting and operator detection; `allocated` tells whether a number is in a block ARPCE has assigned, and `{ allocatedOnly: true }` makes validation strict; freephone and value-added `08` numbers are recognised (`type: 'service'`)
- NIF and NIS format checks
- Licence plate parsing, with wilaya codes 59–69 from 1 January 2027
- List of the 69 wilayas with French and Arabic names; codes 59–69 follow décret présidentiel 26-206 (25 May 2026)
- DZD amounts in words, French and Arabic
- IRG (article 104, 2022 scale) for salaried, retired and disabled workers; CNAS; gross ↔ net
- Playground at https://dzkit.github.io/dzkit-js/: try every function in French, Arabic or English
