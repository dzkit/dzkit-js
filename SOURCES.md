# Sources

Every rule in dzkit comes from a published source. This file lists them, with the date each was checked and how confident we are. If you know a better source, or a rule changes, please [open an issue](https://github.com/dzkit/dzkit-js/issues/new/choose).

**Confidence levels**
- **Official**: taken from, or confirmed against, an official text (Journal officiel, DGI, ARPCE, ONS)
- **Confirmed**: no official text is published, but the rule matches real-world examples
- **Convention**: standard practice, with no single reference

Last full review: 28 October 2026.

---

## Wilayas

| Rule | Source | Level |
|---|---|---|
| 69 wilayas | Loi n° 26-06 of 4 April 2026 on territorial organisation (JO n° 25), adopted by the APN in March 2026 ([Radio Algérie](https://news.radioalgerie.dz/en/node/81251), [Algérie 360](https://www.algerie360.com/organisation-territoriale-lalgerie-passe-officiellement-a-69-wilayas/)) | Official |
| Names and numbers of codes 59–69 | Décret présidentiel n° 26-206 of 25 May 2026 (JO n° 40), completing décret n° 84-79 ([Algérie Eco, 5 June 2026](https://algerie-eco.com/2026/06/05/algerie-les-noms-et-les-numeros-des-nouvelles-wilayas-fixes/), [DZBuild](https://dzbuild.com/blog/algeria-69-wilayas-list-2026)) | Official |
| Names of codes 1–58, French and Arabic | Décret n° 84-79 (1984) and the 2019 reform; cross-checked against [Wikipedia](https://en.wikipedia.org/wiki/Provinces_of_Algeria) and [DZBuild](https://dzbuild.com/blog/algeria-69-wilayas-list-2026) | Confirmed |

**Watch out:** in November 2025, before the decree, a different numbering for 59–69 circulated in the press (quoted from a deputy). Some datasets still use it. The decree's numbering is the one used here: 59 Aflou, 60 Barika, 61 El Kantara, 62 Bir El Ater, 63 El Aricha, 64 Ksar Chellala, 65 Aïn Ouessara, 66 Messaad, 67 Ksar El Boukhari, 68 Bou Saâda, 69 El Abiodh Sidi Cheikh.

Minor spelling variants exist in Arabic (for example آفلو / أفلو, إليزي / اليزي); dzkit uses the most common form.

## Licence plates

| Rule | Source | Level |
|---|---|---|
| Layout: serial, then category + year (3 digits), then wilaya code | Arrêté of 5 May 1988 as amended by the arrêté published in JO n° 03 of 17 January 2023 ([Algérie 360](https://www.algerie360.com/immatriculation-des-vehicules-en-algerie-que-va-t-il-changer/), [TSA](https://www.tsa-algerie.com/plaques-dimmatriculation-automobile-ce-qui-change-en-algerie/)) | Official |
| Serial of up to 6 digits | Same arrêté ([Algérie Eco](https://algerie-eco.com/?p=136105)) | Official |
| Vehicle categories 1–9 | Same arrêté; order from [Algérie Eco](https://algerie-eco.com/?p=136105), confirmed by examples (1 car, 4 bus, 9 motorcycle) on [Wikipedia](https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Algeria) | Confirmed |
| Codes 59–69 issued from 1 January 2027 | Arrêté published in JO n° 50, 2026 ([Algérie Eco, 20 July 2026](https://algerie-eco.com/2026/07/20/immatriculation-des-vehicules-voici-les-codes-des-11-nouvelles-wilayas-qui-entreront-en-vigueur-le-1er-janvier-2027/), [Algérie 360](https://www.algerie360.com/plaques-dimmatriculation-ce-qui-change-des-le-1er-janvier-2027-journal-officiel/)) | Official |
| Unknown year written as 33 (formerly 22) | Same 2023 arrêté | Official |

Not supported yet: diplomatic plates (e.g. `558-66-27`), temporary plates.

## Phone numbers

| Rule | Source | Level |
|---|---|---|
| 10-digit plan (9 digits for landlines), +213 | ARPCE, [national numbering plan](https://www.arpce.dz/en/service/num) (adopted 22 February 2008, page updated 11 March 2025) | Official |
| Mobile blocks per operator | Same page: Wataniya/Ooredoo 0540–0542, 0549, 0550–0562; ATM/Mobilis 0655–0676, 0696–0699; OTA/Djezzy 0770–0784, 0790–0799 | Official |
| 0800 freephone, 0801–0809 value-added, 0982 VoIP, 0961 VSAT | Same page | Official |

ARPCE assigns new blocks from time to time, so validation accepts any 05/06/07 number by default and reports `allocated` separately.

## CCP and RIP

| Rule | Source | Level |
|---|---|---|
| RIP layout `007 99999` + 10-digit account + 2-digit key | [Babalweb RIP checker](https://www.babalweb.net/finance/verificateur-rip-ccp.php) | Confirmed |
| RIP key: 97 − ((account × 100 + 85) mod 97) | Formula shared on [Experts Univers](http://experts-univers.com/rip-ccp-algerie.2.html); checked against 5 real RIP numbers, including key 97, which a widely shared spreadsheet gets wrong ([Excel Downloads](https://excel-downloads.com/threads/calcul-cle-ccp-rip-rib-banques-algeriennes.182912/)) | Confirmed |
| CCP key: digits weighted 4 to 13 from the right, mod 100 | Matches the published example of [mouh2020/algeria](https://github.com/mouh2020/algeria) (1234567890 → 45) | Confirmed |

Algérie Poste does not publish these algorithms. Bank RIBs (BNA, CPA…) are not supported yet: we have no verified examples.

## NIF and NIS

| Rule | Source | Level |
|---|---|---|
| NIF: 15 digits, or 20 for a branch | [python-stdnum](https://arthurdejong.org/python-stdnum/doc/stdnum.dz.nif), which cites the DGI and CNRC pages | Confirmed |
| NIS: 15 digits, or 18 for a secondary establishment | Décret exécutif n° 97-396, articles 4 and 5 ([Legal Doctrine](https://legal-doctrine.com/edition/attribution-du-numero-d-identification-statistique-en-algerie)) | Official |

No check-digit algorithm is published for either, so dzkit checks the format only. To confirm a NIF exists, use the DGI portal (nifenligne.mf.gov.dz).

## IRG on salaries

| Rule | Source | Level |
|---|---|---|
| Monthly scale 0 / 23 / 27 / 30 / 33 / 35 % | Article 104 of the CIDTA, 2026 edition (scale from the 2022 finance law, unchanged for salaries in 2026) ([DGI, via Teamed](https://www.teamed.global/country-hiring-guides/algeria/tax-and-payroll)) | Official |
| Exemption up to 30 000 DA, 40 % abatement bounded to 1 000–1 500 DA | Same article ([Algérie 360, 16 October 2026](https://www.algerie360.com/irg-salaires-exoneration-30000-da-abattements/)) | Official |
| 30 001–35 000 DA: IRG × 137/51 − 27 925/8 | Same article | Official |
| Retirees and disabled workers, 30 001–42 500 DA: IRG × 93/61 − 81 213/41 | Same article | Official |
| Rounded down to the tenth of a dinar | DGI monthly table, as reported by Algérie 360 | Official |

All reference amounts published in those two articles are unit tests (`test/payroll.test.ts`).

## CNAS contributions

| Rule | Source | Level |
|---|---|---|
| Employee 9 %, employer 25 %, social services 0.5 % (total 34.5 %) | [CLEISS](https://www.cleiss.fr/docs/cotisations/algerie.html) (rates at 1 January 2024), consistent with the CNAS employer page as reported by [Teamed](https://www.teamed.global/country-hiring-guides/algeria/tax-and-payroll) | Official |
| No ceiling for employees | Same sources | Official |

dzkit's default employer rate is 25.5 % (25 % + 0.5 %). Some sites round it to 26 %; you can override it with `employerRate`.

## Amounts in words

| Rule | Source | Level |
|---|---|---|
| French spelling and agreement (quatre-vingts, deux cents, mille invariable, « un million de ») | Standard French grammar (traditional spelling) | Convention |
| Arabic counted-noun rules (دينار واحد، ديناران، ثلاثة دنانير، أحد عشر دينارا، مائة دينار) | Standard Arabic grammar | Convention |

Invoice wording varies between companies; please open an issue if your administration requires a different form.
