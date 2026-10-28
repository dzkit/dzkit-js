[English](README.md) | **Français** | [العربية](README.ar.md)

# dzkit 🇩🇿

Les petites fonctions que chaque application algérienne finit par réécrire, testées une fois et partagées :

- **CCP / RIP** : clés Algérie Poste, génération et vérification du RIP
- **Numéros de téléphone** : analyse, validation, formatage, opérateur
- **NIF / NIS** : vérification du format
- **Plaques d'immatriculation** : y compris les nouveaux codes de wilaya 59 à 69
- **69 wilayas** : codes, noms en français et en arabe
- **Montants en lettres** : en dinars, en français et en arabe, pour les factures
- **Paie** : IRG (article 104) et CNAS, brut ↔ net

Aucune dépendance, types TypeScript inclus, Node 20+ et navigateur.

**[Essayer dans le navigateur](https://dzkit.github.io/dzkit-js/)**, sans rien installer.

```bash
npm install dzkit
```

## Exemples

```ts
import {
  ccpToRip, isValidRip, ccpKey,
  parsePhone, isValidNif, parsePlate, getWilaya,
  amountToWords, grossToNet, calculateIrg,
} from 'dzkit';

ccpToRip('23115007');                  // '00799999002311500797'
isValidRip('007 99999 0023115007 97'); // true
ccpKey('1234567890');                  // '45'

parsePhone('0661234567')?.operator;    // 'Mobilis'
isValidNif('408 020 000 150 039');     // true
parsePlate('02639-126-09')?.wilaya.name; // 'Blida'
getWilaya(64)?.name;                   // 'Bou Saâda'

amountToWords(1250.5, 'fr');
// 'mille deux cent cinquante dinars algériens et cinquante centimes'

grossToNet(60_000);
// { cnasEmployee: 5400, taxable: 54600, irg: 7042, net: 47558, cnasEmployer: 15300, ... }
calculateIrg(40_000, { regime: 'retired' }); // 2745.4
```

## Règles appliquées

**RIP** : `007 99999` + numéro CCP sur 10 chiffres + clé. Vérifié sur de vrais RIP, y compris la clé `97`, que beaucoup de calculateurs renvoient à tort comme `00`.

**NIF / NIS** : aucun algorithme de clé n'est publié, seule la forme est vérifiée (NIF : 15 ou 20 chiffres ; NIS : 15 ou 18 chiffres). Pour confirmer qu'un NIF existe : nifenligne.mf.gov.dz.

**Plaques** : les codes 59 à 69 ne sont acceptés qu'à partir du 1er janvier 2027 (option `at` pour une autre date).

**IRG** (article 104 du CIDTA, barème de la LF 2022, inchangé pour les salaires en 2026) :
- exonération jusqu'à 30 000 DA de revenu imposable par mois ;
- abattement de 40 % de l'impôt, entre 1 000 et 1 500 DA ;
- de 30 000 à 35 000 DA : `IRG × 137/51 − 27 925/8` ;
- retraités du régime général et travailleurs handicapés, de 30 000 à 42 500 DA : `IRG × 93/61 − 81 213/41` ;
- arrondi au dixième de dinar inférieur, comme le barème de la DGI.

**CNAS** : 9 % salarié, 25 % + 0,5 % employeur (modifiables).

**Ce n'est pas un conseil fiscal.** Les règles changent avec les lois de finances : vérifiez auprès d'un comptable, et signalez toute différence dans une issue.

## Contribuer

Les issues et pull requests sont les bienvenues, en français, en arabe ou en anglais. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE) © Siroukane
