# Changelog

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
