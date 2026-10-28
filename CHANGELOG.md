# Changelog

## Unreleased

- Playground at https://dzkit.github.io/dzkit-js/: try every function in French, Arabic or English

### Fixed

- **Wilaya codes 60–69 now follow décret présidentiel 26-206** (25 May 2026). They previously used a numbering from the press that the decree changed. Only Aflou (59) was right; for example 64 is Ksar Chellala, not Bou Saâda. Plate parsing for these codes changes accordingly.
- "Aïn Oussara" is now spelled "Aïn Ouessara", as in the decree.

### Added

- Phone numbers: `allocated` tells whether a number is in a block ARPCE has assigned, and `{ allocatedOnly: true }` makes validation strict. Freephone and value-added `08` numbers are recognised (`type: 'service'`).
- SOURCES.md: every rule with its source, date and confidence level.
- Playground: says exactly which part of an invalid plate is wrong, and warns about unallocated phone blocks.

## 0.1.0 — 2026-10-28

First release.

- CCP key, RIP key, RIP generation, parsing and validation
- Phone number parsing, validation, formatting and operator detection
- NIF and NIS format checks
- Licence plate parsing, with wilaya codes 59–69 from 1 January 2027
- List of the 69 wilayas with French and Arabic names
- DZD amounts in words, French and Arabic
- IRG (article 104, 2022 scale) for salaried, retired and disabled workers; CNAS; gross ↔ net
