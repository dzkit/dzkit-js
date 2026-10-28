import {
  ccpKey,
  ccpToRip,
  parseRip,
  parsePhone,
  formatPhone,
  parsePlate,
  formatPlate,
  amountToWordsFr,
  amountToWordsAr,
  grossToNet,
  netToGross,
  isValidNif,
  isValidNis,
  compactId,
  toLatinDigits,
} from './dzkit.js';

/* ---------- Translations ---------- */

const T = {
  fr: {
    title: 'Les règles algériennes, prêtes à l’emploi',
    lead: 'Essayez chaque fonction de dzkit ici. Tout se calcule dans votre navigateur : rien n’est envoyé.',
    copy: 'Copier',
    copied: 'Copié',
    ripTitle: 'CCP et RIP',
    ripHint: 'Entrez un numéro de CCP pour obtenir sa clé et son RIP, ou un RIP complet de 20 chiffres pour le vérifier.',
    ripLabel: 'Numéro de CCP ou RIP',
    ripAccount: 'Compte CCP',
    ripCcpKey: 'Clé CCP',
    ripKey: 'Clé RIP',
    ripRip: 'RIP',
    ripOkBuilt: 'RIP calculé à partir du numéro de CCP.',
    ripOkValid: 'RIP valide.',
    ripBadKey: (k) => `Clé incorrecte : pour ce compte, la clé RIP est ${k}.`,
    ripBadPrefix: 'Un RIP CCP commence par 007 99999.',
    ripBadFormat: 'Entrez jusqu’à 10 chiffres pour un CCP, ou 20 chiffres pour un RIP.',
    phoneTitle: 'Téléphone',
    phoneHint: 'Accepte 0551…, +213 551…, 00213… avec ou sans espaces.',
    phoneLabel: 'Numéro de téléphone',
    phoneType: 'Type',
    phoneOperator: 'Opérateur',
    phoneNational: 'Format national',
    phoneIntl: 'Format international',
    phoneArea: 'Indicatif régional',
    mobile: 'Mobile',
    landline: 'Fixe',
    voip: 'VoIP',
    phoneOk: 'Numéro valide.',
    phoneBad: 'Ce n’est pas un numéro algérien valide : un mobile compte 10 chiffres et commence par 05, 06 ou 07.',
    plateTitle: 'Plaque d’immatriculation',
    plateHint: 'Numéro d’ordre, catégorie et année, puis code de la wilaya. Les codes 59 à 69 sont valables à partir du 1er janvier 2027.',
    plateLabel: 'Plaque',
    plateWilaya: 'Wilaya',
    plateCategory: 'Catégorie',
    plateYear: 'Année de mise en circulation',
    plateOk: 'Plaque valide.',
    plateSoon: (w) => `Code ${w} : valable à partir du 1er janvier 2027.`,
    plateBad: 'Format attendu : 02639-126-09 (numéro, catégorie et année, wilaya 01 à 69).',
    wordsTitle: 'Montant en lettres',
    wordsHint: 'Pour les factures et les chèques, en français et en arabe, avec les règles d’accord.',
    wordsLabel: 'Montant en DA',
    wordsFr: 'En français',
    wordsAr: 'En arabe',
    wordsBad: 'Entrez un montant positif, par exemple 1250,50.',
    salaryTitle: 'Salaire net',
    salaryHint: 'IRG selon l’article 104 du CIDTA et cotisations CNAS, pour un salaire mensuel régulier.',
    salaryMode: 'Je connais',
    salaryFromGross: 'Le brut',
    salaryFromNet: 'Le net',
    salaryGrossLabel: 'Salaire brut mensuel en DA',
    salaryNetLabel: 'Salaire net souhaité en DA',
    salaryRegime: 'Régime',
    regimeSalaried: 'Salarié',
    regimeRetired: 'Retraité (régime général)',
    regimeDisabled: 'Travailleur handicapé',
    rowGross: 'Salaire brut',
    rowCnas: 'Retenue CNAS (9 %)',
    rowTaxable: 'Revenu imposable',
    rowIrg: 'IRG',
    rowNet: 'Net à payer',
    employer: (c, t) => `Charges patronales CNAS (25,5 %) : ${c}. Coût total employeur : ${t}.`,
    salaryExempt: 'Revenu imposable inférieur ou égal à 30 000 DA : exonéré d’IRG.',
    salaryBad: 'Entrez un salaire mensuel positif.',
    salaryNote: 'Indicatif : ce n’est pas un conseil fiscal.',
    idsTitle: 'NIF et NIS',
    idsHint: 'Aucune clé de contrôle n’est publiée pour ces numéros : seule la forme est vérifiée. Pour confirmer qu’un NIF existe, utilisez le portail de la DGI.',
    idsLabel: 'Numéro',
    nifOk: 'Format de NIF valide (15 chiffres, ou 20 pour un établissement secondaire).',
    nifBad: 'Un NIF compte 15 chiffres, ou 20 pour un établissement secondaire.',
    nisOk: 'Format de NIS valide (15 chiffres, ou 18 pour un établissement secondaire).',
    nisBad: 'Un NIS compte 15 chiffres, ou 18 pour un établissement secondaire.',
    footer: 'dzkit est open source, sous licence MIT. Une valeur vous semble fausse ? Ouvrez une issue avec un exemple réel anonymisé.',
    reportIssue: 'Signaler un problème',
    da: 'DA',
  },
  ar: {
    title: 'القواعد الجزائرية، جاهزة للاستعمال',
    lead: 'جرّب كل وظائف dzkit هنا. تتم جميع الحسابات في متصفحك ولا يُرسل أي شيء.',
    copy: 'نسخ',
    copied: 'تم النسخ',
    ripTitle: 'الحساب البريدي الجاري والـ RIP',
    ripHint: 'أدخل رقم الحساب البريدي للحصول على مفتاحه ورقم الـ RIP، أو أدخل RIP كاملا من 20 رقما للتحقق منه.',
    ripLabel: 'رقم الحساب البريدي أو الـ RIP',
    ripAccount: 'الحساب البريدي',
    ripCcpKey: 'مفتاح الحساب',
    ripKey: 'مفتاح الـ RIP',
    ripRip: 'RIP',
    ripOkBuilt: 'تم حساب الـ RIP انطلاقا من رقم الحساب.',
    ripOkValid: 'الـ RIP صحيح.',
    ripBadKey: (k) => `المفتاح خاطئ: مفتاح الـ RIP الصحيح لهذا الحساب هو ${k}.`,
    ripBadPrefix: 'يبدأ RIP الحساب البريدي بـ 007 99999.',
    ripBadFormat: 'أدخل 10 أرقام على الأكثر للحساب البريدي، أو 20 رقما للـ RIP.',
    phoneTitle: 'الهاتف',
    phoneHint: 'يقبل الصيغ 0551… و‎+213 551… و00213… بمسافات أو بدونها.',
    phoneLabel: 'رقم الهاتف',
    phoneType: 'النوع',
    phoneOperator: 'المتعامل',
    phoneNational: 'الصيغة الوطنية',
    phoneIntl: 'الصيغة الدولية',
    phoneArea: 'الرمز الجهوي',
    mobile: 'نقال',
    landline: 'ثابت',
    voip: 'هاتف عبر الإنترنت',
    phoneOk: 'الرقم صحيح.',
    phoneBad: 'هذا ليس رقما جزائريا صحيحا: يتكون رقم النقال من 10 أرقام ويبدأ بـ 05 أو 06 أو 07.',
    plateTitle: 'لوحة الترقيم',
    plateHint: 'الرقم التسلسلي، ثم الصنف والسنة، ثم رمز الولاية. الرموز من 59 إلى 69 صالحة ابتداء من 1 جانفي 2027.',
    plateLabel: 'اللوحة',
    plateWilaya: 'الولاية',
    plateCategory: 'الصنف',
    plateYear: 'سنة أول سير',
    plateOk: 'اللوحة صحيحة.',
    plateSoon: (w) => `الرمز ${w}: صالح ابتداء من 1 جانفي 2027.`,
    plateBad: 'الصيغة المنتظرة: 02639-126-09 (الرقم، الصنف والسنة، الولاية من 01 إلى 69).',
    wordsTitle: 'كتابة المبلغ بالحروف',
    wordsHint: 'للفواتير والصكوك، بالعربية والفرنسية، مع مراعاة قواعد التمييز والمطابقة.',
    wordsLabel: 'المبلغ بالدينار',
    wordsFr: 'بالفرنسية',
    wordsAr: 'بالعربية',
    wordsBad: 'أدخل مبلغا موجبا، مثل 1250.50.',
    salaryTitle: 'الأجر الصافي',
    salaryHint: 'الضريبة على الدخل الإجمالي وفق المادة 104 واشتراكات الضمان الاجتماعي، لأجر شهري منتظم.',
    salaryMode: 'أعرف',
    salaryFromGross: 'الأجر الخام',
    salaryFromNet: 'الأجر الصافي',
    salaryGrossLabel: 'الأجر الخام الشهري بالدينار',
    salaryNetLabel: 'الأجر الصافي المطلوب بالدينار',
    salaryRegime: 'الوضعية',
    regimeSalaried: 'أجير',
    regimeRetired: 'متقاعد (النظام العام)',
    regimeDisabled: 'عامل ذو إعاقة',
    rowGross: 'الأجر الخام',
    rowCnas: 'اقتطاع الضمان الاجتماعي (9 %)',
    rowTaxable: 'الدخل الخاضع للضريبة',
    rowIrg: 'الضريبة على الدخل الإجمالي',
    rowNet: 'الصافي للدفع',
    employer: (c, t) => `حصة صاحب العمل في الضمان الاجتماعي (25,5 %): ${c}. التكلفة الإجمالية: ${t}.`,
    salaryExempt: 'الدخل الخاضع للضريبة لا يتجاوز 30 000 دج: معفى من الضريبة.',
    salaryBad: 'أدخل أجرا شهريا موجبا.',
    salaryNote: 'للإرشاد فقط، وليس استشارة جبائية.',
    idsTitle: 'الرقم الجبائي والرقم الإحصائي',
    idsHint: 'لا يوجد مفتاح تحقق منشور لهذه الأرقام، لذا نتحقق من الشكل فقط. للتأكد من وجود رقم جبائي، استعمل بوابة المديرية العامة للضرائب.',
    idsLabel: 'الرقم',
    nifOk: 'شكل الرقم الجبائي صحيح (15 رقما، أو 20 لمؤسسة ثانوية).',
    nifBad: 'يتكون الرقم الجبائي من 15 رقما، أو 20 لمؤسسة ثانوية.',
    nisOk: 'شكل الرقم الإحصائي صحيح (15 رقما، أو 18 لمؤسسة ثانوية).',
    nisBad: 'يتكون الرقم الإحصائي من 15 رقما، أو 18 لمؤسسة ثانوية.',
    footer: 'dzkit مفتوح المصدر بترخيص MIT. هل تبدو لك قيمة خاطئة؟ افتح issue مع مثال حقيقي بعد إخفاء البيانات الشخصية.',
    reportIssue: 'الإبلاغ عن مشكلة',
    da: 'دج',
  },
  en: {
    title: 'Algerian rules, ready to use',
    lead: 'Try every dzkit function here. Everything runs in your browser and nothing is sent anywhere.',
    copy: 'Copy',
    copied: 'Copied',
    ripTitle: 'CCP and RIP',
    ripHint: 'Enter a CCP account number to get its key and RIP, or a full 20-digit RIP to check it.',
    ripLabel: 'CCP account number or RIP',
    ripAccount: 'CCP account',
    ripCcpKey: 'CCP key',
    ripKey: 'RIP key',
    ripRip: 'RIP',
    ripOkBuilt: 'RIP built from the CCP account number.',
    ripOkValid: 'Valid RIP.',
    ripBadKey: (k) => `Wrong key: for this account, the RIP key is ${k}.`,
    ripBadPrefix: 'A CCP RIP starts with 007 99999.',
    ripBadFormat: 'Enter up to 10 digits for a CCP account, or 20 digits for a RIP.',
    phoneTitle: 'Phone number',
    phoneHint: 'Accepts 0551…, +213 551…, 00213…, with or without spaces.',
    phoneLabel: 'Phone number',
    phoneType: 'Type',
    phoneOperator: 'Operator',
    phoneNational: 'National format',
    phoneIntl: 'International format',
    phoneArea: 'Area code',
    mobile: 'Mobile',
    landline: 'Landline',
    voip: 'VoIP',
    phoneOk: 'Valid number.',
    phoneBad: 'Not a valid Algerian number: mobiles have 10 digits and start with 05, 06 or 07.',
    plateTitle: 'Licence plate',
    plateHint: 'Serial number, then category and year, then the wilaya code. Codes 59 to 69 are valid from 1 January 2027.',
    plateLabel: 'Plate',
    plateWilaya: 'Wilaya',
    plateCategory: 'Category',
    plateYear: 'Year of first registration',
    plateOk: 'Valid plate.',
    plateSoon: (w) => `Code ${w}: valid from 1 January 2027.`,
    plateBad: 'Expected format: 02639-126-09 (serial, category and year, wilaya 01 to 69).',
    wordsTitle: 'Amount in words',
    wordsHint: 'For invoices and cheques, in French and Arabic, with the agreement rules applied.',
    wordsLabel: 'Amount in DA',
    wordsFr: 'In French',
    wordsAr: 'In Arabic',
    wordsBad: 'Enter a positive amount, for example 1250.50.',
    salaryTitle: 'Net salary',
    salaryHint: 'IRG under article 104 of the CIDTA and CNAS contributions, for a regular monthly salary.',
    salaryMode: 'I know',
    salaryFromGross: 'Gross',
    salaryFromNet: 'Net',
    salaryGrossLabel: 'Monthly gross salary in DA',
    salaryNetLabel: 'Target net salary in DA',
    salaryRegime: 'Status',
    regimeSalaried: 'Employee',
    regimeRetired: 'Retired (régime général)',
    regimeDisabled: 'Disabled worker',
    rowGross: 'Gross salary',
    rowCnas: 'CNAS contribution (9%)',
    rowTaxable: 'Taxable income',
    rowIrg: 'IRG',
    rowNet: 'Net pay',
    employer: (c, t) => `Employer CNAS contributions (25.5%): ${c}. Total employer cost: ${t}.`,
    salaryExempt: 'Taxable income of 30,000 DA or less: no IRG.',
    salaryBad: 'Enter a positive monthly salary.',
    salaryNote: 'For guidance only, not tax advice.',
    idsTitle: 'NIF and NIS',
    idsHint: 'No check-digit algorithm is published for these numbers, so only the format is checked. To confirm a NIF exists, use the DGI portal.',
    idsLabel: 'Number',
    nifOk: 'Valid NIF format (15 digits, or 20 for a branch).',
    nifBad: 'A NIF has 15 digits, or 20 for a branch.',
    nisOk: 'Valid NIS format (15 digits, or 18 for a secondary establishment).',
    nisBad: 'A NIS has 15 digits, or 18 for a secondary establishment.',
    footer: 'dzkit is open source under the MIT licence. Does a value look wrong? Open an issue with a real, anonymised example.',
    reportIssue: 'Report a problem',
    da: 'DA',
  },
};

// Strings added with the redesign, merged into T above.
const EXTRA = {
  fr: {
    lead: 'Une bibliothèque open source pour vérifier, formater et calculer ce que chaque application algérienne finit par réécrire.',
    skip: 'Aller aux outils',
    plateTitle: 'Plaque',
    omniLabel: 'Collez n’importe quel numéro algérien',
    omniOpen: 'Ouvrir l’outil',
    kindCcp: 'Numéro de CCP',
    kindRip: 'RIP valide',
    kindRipBad: 'RIP avec une clé incorrecte',
    kindPhone: (op) => (op ? `Téléphone mobile, ${op}` : 'Téléphone'),
    kindPlate: 'Plaque d’immatriculation',
    kindPlateSoon: 'Plaque d’une nouvelle wilaya (à partir de 2027)',
    kindAmount: 'Montant en dinars',
    kindNif: 'NIF (format valide)',
    kindNis: 'NIS (format valide)',
    kindUnknown: 'Rien de reconnu pour l’instant',
    unknownDetail: 'Essayez un numéro de téléphone, un CCP ou un RIP, une plaque, un montant ou un NIF.',
    chipWrongKey: 'Clé fausse',
    themeAuto: 'Auto',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    idsCount: (n) => `${n} chiffres`,
    service: 'Numéro de service',
    freephone: 'Numéro vert (gratuit)',
    phoneUnallocated: 'Format valide, mais ce bloc n’est pas encore attribué par l’ARPCE.',
    plateErrMiddle: 'Le groupe du milieu doit avoir 3 chiffres : la catégorie (1 à 9) puis l’année, par exemple 126.',
    plateErrCategory: 'La catégorie (premier chiffre du milieu) va de 1 à 9 : 0 n’existe pas.',
    plateErrWilaya: (w) => `Le code de wilaya ${w} n’existe pas : il va de 01 à 69.`,
    plateErrSerial: 'Le numéro d’ordre (premier groupe) a de 1 à 6 chiffres et ne peut pas être 0.',
  },
  ar: {
    lead: 'مكتبة مفتوحة المصدر للتحقق والتنسيق والحساب، لكل ما يعيد كل تطبيق جزائري كتابته.',
    skip: 'الانتقال إلى الأدوات',
    plateTitle: 'لوحة الترقيم',
    omniLabel: 'الصق أي رقم جزائري',
    omniOpen: 'فتح الأداة',
    kindCcp: 'رقم حساب بريدي جاري',
    kindRip: 'RIP صحيح',
    kindRipBad: 'RIP بمفتاح خاطئ',
    kindPhone: (op) => (op ? `هاتف نقال، ${op}` : 'هاتف'),
    kindPlate: 'لوحة ترقيم',
    kindPlateSoon: 'لوحة ولاية جديدة (ابتداء من 2027)',
    kindAmount: 'مبلغ بالدينار',
    kindNif: 'رقم جبائي (شكل صحيح)',
    kindNis: 'رقم إحصائي (شكل صحيح)',
    kindUnknown: 'لم يتم التعرف على شيء بعد',
    unknownDetail: 'جرّب رقم هاتف، أو حسابا بريديا أو RIP، أو لوحة ترقيم، أو مبلغا، أو رقما جبائيا.',
    chipWrongKey: 'مفتاح خاطئ',
    themeAuto: 'تلقائي',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    idsCount: (n) => `${n} رقما`,
    service: 'رقم خدمة',
    freephone: 'رقم أخضر (مجاني)',
    phoneUnallocated: 'الشكل صحيح، لكن هذه الكتلة لم تمنحها سلطة الضبط بعد.',
    plateErrMiddle: 'يجب أن تتكون المجموعة الوسطى من 3 أرقام: الصنف (من 1 إلى 9) ثم السنة، مثل 126.',
    plateErrCategory: 'الصنف (أول رقم في الوسط) من 1 إلى 9، ولا يوجد صنف 0.',
    plateErrWilaya: (w) => `رمز الولاية ${w} غير موجود: الرموز من 01 إلى 69.`,
    plateErrSerial: 'الرقم التسلسلي (المجموعة الأولى) من 1 إلى 6 أرقام ولا يمكن أن يكون 0.',
  },
  en: {
    lead: 'An open-source library to check, format and calculate the things every Algerian app ends up rewriting.',
    skip: 'Skip to the tools',
    plateTitle: 'Licence plate',
    omniLabel: 'Paste any Algerian number',
    omniOpen: 'Open the tool',
    kindCcp: 'CCP account number',
    kindRip: 'Valid RIP',
    kindRipBad: 'RIP with a wrong key',
    kindPhone: (op) => (op ? `Mobile phone, ${op}` : 'Phone number'),
    kindPlate: 'Licence plate',
    kindPlateSoon: 'Plate from a new wilaya (from 2027)',
    kindAmount: 'Amount in dinars',
    kindNif: 'NIF (valid format)',
    kindNis: 'NIS (valid format)',
    kindUnknown: 'Nothing recognised yet',
    unknownDetail: 'Try a phone number, a CCP or RIP, a licence plate, an amount or a NIF.',
    chipWrongKey: 'Wrong key',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    idsCount: (n) => `${n} digits`,
    service: 'Service number',
    freephone: 'Freephone number',
    phoneUnallocated: 'Valid format, but ARPCE has not allocated this block yet.',
    plateErrMiddle: 'The middle group needs 3 digits: the category (1 to 9) then the year, for example 126.',
    plateErrCategory: 'The category (first middle digit) goes from 1 to 9; 0 doesn’t exist.',
    plateErrWilaya: (w) => `Wilaya code ${w} doesn’t exist: codes go from 01 to 69.`,
    plateErrSerial: 'The serial (first group) has 1 to 6 digits and can’t be 0.',
  },
};
for (const l of Object.keys(T)) Object.assign(T[l], EXTRA[l]);

const CATEGORY = {
  fr: ['', 'Véhicule de tourisme', 'Camion', 'Camionnette', 'Autocar ou autobus', 'Tracteur routier', 'Autre tracteur', 'Véhicule spécial', 'Remorque ou semi-remorque', 'Motocyclette'],
  ar: ['', 'سيارة سياحية', 'شاحنة', 'شاحنة صغيرة', 'حافلة', 'جرار طريق', 'جرار آخر', 'مركبة خاصة', 'مقطورة أو نصف مقطورة', 'دراجة نارية'],
  en: ['', 'Passenger car', 'Truck', 'Van', 'Coach or bus', 'Road tractor', 'Other tractor', 'Special vehicle', 'Trailer or semi-trailer', 'Motorcycle'],
};

const LOCALE = { fr: 'fr-DZ', ar: 'ar-DZ', en: 'en-GB' };
const AFTER_REFORM = new Date('2027-06-01');

let lang = 'fr';
const t = (key, ...args) => {
  const v = T[lang][key] ?? T.fr[key];
  return typeof v === 'function' ? v(...args) : v;
};

/* ---------- Helpers ---------- */

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

function num(n, digits = 2) {
  return new Intl.NumberFormat(LOCALE[lang], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    numberingSystem: 'latn',
  }).format(n);
}

const money = (n) => `${num(n)} ${t('da')}`;

function pop(node) {
  node.classList.remove('pop');
  void node.offsetWidth;
  node.classList.add('pop');
}

function setStatus(node, kind, text) {
  node.textContent = text;
  node.className = `status ${kind}`;
}

function facts(node, rows) {
  node.replaceChildren(
    ...rows.flatMap(([k, v, ltr]) => {
      const dd = el('dd', '', v);
      if (ltr) dd.dir = 'ltr';
      return [el('dt', '', k), dd];
    }),
  );
}

function code(node, lines) {
  node.replaceChildren(
    ...lines.flatMap((line, i) => {
      const m = /^(.*?)(\s*\/\/.*)?$/.exec(line);
      const out = [document.createTextNode(m[1])];
      if (m[2]) out.push(el('span', 'c', m[2]));
      if (i < lines.length - 1) out.push(document.createTextNode('\n'));
      return out;
    }),
  );
}

const q = (s) => `'${String(s).replace(/'/g, "\\'")}'`;
const parseAmount = (s) => Number(toLatinDigits(String(s)).replace(/\s|da|dzd|دج/gi, '').replace(/[,٫]/, '.'));
const plateYear = (yy) => (Number(yy) <= (new Date().getFullYear() % 100) + 1 ? '20' : '19') + yy;
const wilayaName = (w) => (lang === 'ar' ? w.nameAr : w.name);
const list = (...items) => items.join(lang === 'ar' ? '، ' : ', ');

/* ---------- Document renderers (shared by the hero and the tools) ---------- */

function ripStrip(node, rip, state = 'ok') {
  node.className = `rip-strip${state === 'ok' ? '' : ` ${state}`}`;
  node.replaceChildren(
    el('span', 'rip-tag', 'RIP'),
    el('span', '', rip.slice(0, 3)),
    el('span', '', rip.slice(3, 8)),
    el('span', '', rip.slice(8, 18)),
    el('span', 'rip-key', rip.slice(18, 20)),
  );
  return node;
}

function plateDoc(node, text, state = 'ok') {
  node.className = `plate${state === 'ok' ? '' : ` ${state}`}`;
  node.textContent = text;
  return node;
}

/* ---------- Hero: recognise whatever is pasted ---------- */

function detect(raw) {
  const s = toLatinDigits(raw).trim();
  if (!s) return null;
  const digits = s.replace(/[\s.\-_/]/g, '');

  // A plate is written as exactly three groups (12345-126-16), so check it before
  // phone numbers, which a landline in that shape could otherwise match.
  const plate = parsePlate(s) ?? parsePlate(s, { at: AFTER_REFORM });
  if (plate && /^\d{1,6}[\s-]+\d{3}[\s-]+\d{2}$/.test(s)) return { kind: 'plate', plate, soon: !parsePlate(s) };

  const phone = parsePhone(s);
  if (phone) return { kind: 'phone', phone };

  if (/^\d{20}$/.test(digits) && digits.startsWith('00799999')) {
    return { kind: 'rip', rip: digits, valid: parseRip(digits) !== null };
  }

  if (/^\d{15}$|^\d{20}$/.test(digits)) return { kind: 'nif', id: digits };
  if (/^\d{18}$/.test(digits)) return { kind: 'nis', id: digits };

  if (/^\d{1,10}$/.test(digits) && !/[,]|da|دج/i.test(s)) return { kind: 'ccp', ccp: digits };

  const amount = parseAmount(s);
  if (Number.isFinite(amount) && amount >= 0 && amount < 1e12 && /\d/.test(s)) return { kind: 'amount', amount };

  return null;
}

function renderOmni() {
  const raw = $('#omni-input').value;
  const r = detect(raw);
  const kind = $('#omni-kind');
  const doc = $('#omni-doc');
  const detail = $('#omni-detail');
  const open = $('#omni-open');
  kind.className = 'omni-kind';
  open.hidden = false;

  const goTo = (id, value) => {
    open.href = `#${id}`;
    open.onclick = () => {
      const input = $(`#${id}-input`);
      if (input && value !== undefined) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
      }
    };
  };

  if (!r) {
    kind.textContent = t('kindUnknown');
    kind.className = 'omni-kind bad';
    doc.replaceChildren();
    detail.textContent = t('unknownDetail');
    open.hidden = true;
    return;
  }

  if (r.kind === 'phone') {
    kind.textContent = t('kindPhone', r.phone.operator);
    const card = el('div', 'phone-card');
    card.dir = 'ltr';
    card.append(el('span', 'phone-number', formatPhone(raw, 'international')));
    doc.replaceChildren(card);
    detail.textContent = list(formatPhone(raw), r.phone.e164);
    goTo('phone', raw.trim());
  } else if (r.kind === 'rip' || r.kind === 'ccp') {
    const rip = r.kind === 'rip' ? r.rip : ccpToRip(r.ccp);
    kind.textContent = r.kind === 'ccp' ? t('kindCcp') : r.valid ? t('kindRip') : t('kindRipBad');
    if (r.kind === 'rip' && !r.valid) kind.className = 'omni-kind bad';
    const strip = ripStrip(el('div'), rip, r.kind === 'rip' && !r.valid ? 'invalid' : 'ok');
    strip.dir = 'ltr';
    doc.replaceChildren(strip);
    const account = rip.slice(8, 18);
    detail.textContent =
      r.kind === 'rip' && !r.valid
        ? t('ripBadKey', ccpToRip(account).slice(18))
        : list(`${t('ripCcpKey')} ${ccpKey(account)}`, `${t('ripKey')} ${rip.slice(18)}`);
    goTo('rip', r.kind === 'rip' ? r.rip : r.ccp);
  } else if (r.kind === 'plate') {
    kind.textContent = r.soon ? t('kindPlateSoon') : t('kindPlate');
    const p = r.plate;
    const plate = plateDoc(el('div'), formatPlate(raw, { at: AFTER_REFORM }), r.soon ? 'pending' : 'ok');
    plate.dir = 'ltr';
    doc.replaceChildren(plate);
    detail.textContent = list(`${wilayaName(p.wilaya)} (${String(p.wilaya.code).padStart(2, '0')})`, CATEGORY[lang][p.category], plateYear(p.year));
    goTo('plate', raw.trim());
  } else if (r.kind === 'amount') {
    kind.textContent = t('kindAmount');
    const words = el('p', 'omni-words', lang === 'ar' ? amountToWordsAr(r.amount) : amountToWordsFr(r.amount));
    words.style.margin = '0';
    words.style.fontSize = '1.15rem';
    words.style.fontWeight = '400';
    words.lang = lang === 'ar' ? 'ar' : 'fr';
    doc.replaceChildren(words);
    detail.textContent = money(r.amount);
    goTo('words', String(r.amount));
  } else {
    kind.textContent = r.kind === 'nif' ? t('kindNif') : t('kindNis');
    const n = el('span', 'id-number', r.id.replace(/(\d{3})(?=\d)/g, '$1 '));
    n.dir = 'ltr';
    doc.replaceChildren(n);
    detail.textContent = t('idsCount', r.id.length);
    goTo('ids', r.id);
  }
  pop(doc);
}

/* ---------- RIP tool ---------- */

function renderRip() {
  const raw = $('#rip-input').value;
  const digits = toLatinDigits(raw).replace(/[\s.\-_/]/g, '');
  const strip = $('#rip-strip');
  const status = $('#rip-status');

  if (/^\d{1,10}$/.test(digits)) {
    const rip = ccpToRip(digits);
    ripStrip(strip, rip);
    facts($('#rip-facts'), [
      [t('ripAccount'), digits.replace(/^0+(?=\d)/, ''), true],
      [t('ripCcpKey'), ccpKey(digits), true],
      [t('ripKey'), rip.slice(18), true],
    ]);
    code($('#rip-code'), [`ccpToRip(${q(digits)});  // ${q(rip)}`, `ccpKey(${q(digits)});    // ${q(ccpKey(digits))}`]);
    setStatus(status, 'ok', t('ripOkBuilt'));
  } else if (/^\d{20}$/.test(digits)) {
    const parsed = parseRip(digits);
    ripStrip(strip, digits, parsed ? 'ok' : 'invalid');
    code($('#rip-code'), [`isValidRip(${q(raw.trim())});  // ${parsed !== null}`]);
    if (parsed) {
      facts($('#rip-facts'), [
        [t('ripAccount'), parsed.account.replace(/^0+(?=\d)/, ''), true],
        [t('ripCcpKey'), parsed.ccpKey, true],
      ]);
      setStatus(status, 'ok', t('ripOkValid'));
    } else {
      facts($('#rip-facts'), []);
      setStatus(status, 'bad', digits.startsWith('00799999') ? t('ripBadKey', ccpToRip(digits.slice(8, 18)).slice(18)) : t('ripBadPrefix'));
    }
  } else {
    ripStrip(strip, '00799999' + '0'.repeat(12), 'empty');
    facts($('#rip-facts'), []);
    code($('#rip-code'), [`ccpToRip(${q(raw.trim())});  // null`]);
    setStatus(status, 'bad', t('ripBadFormat'));
  }
}

/* ---------- Phone tool ---------- */

function renderPhone() {
  const raw = $('#phone-input').value;
  const p = parsePhone(raw);
  const status = $('#phone-status');
  if (!p) {
    $('#phone-op').textContent = '';
    $('#phone-big').textContent = raw.trim() || '—';
    $('#phone-card').style.opacity = '0.45';
    facts($('#phone-facts'), []);
    code($('#phone-code'), [`parsePhone(${q(raw.trim())});  // null`]);
    setStatus(status, 'bad', t('phoneBad'));
    return;
  }
  $('#phone-card').style.opacity = '';
  $('#phone-op').textContent = p.freephone ? t('freephone') : p.operator ?? t(p.type);
  $('#phone-big').textContent = formatPhone(raw, 'international');
  const rows = [[t('phoneType'), t(p.type)]];
  if (p.operator) rows.push([t('phoneOperator'), p.operator]);
  if (p.areaCode) rows.push([t('phoneArea'), `0${p.areaCode}`, true]);
  rows.push([t('phoneNational'), formatPhone(raw), true], [t('phoneIntl'), p.e164, true]);
  facts($('#phone-facts'), rows);
  code($('#phone-code'), [
    `const p = parsePhone(${q(raw.trim())});`,
    `p.type;      // ${q(p.type)}`,
    ...(p.operator ? [`p.operator;  // ${q(p.operator)}`] : []),
    `p.e164;      // ${q(p.e164)}`,
  ]);
  if (p.allocated === false) setStatus(status, 'bad', t('phoneUnallocated'));
  else setStatus(status, 'ok', t('phoneOk'));
}

/* ---------- Plate tool ---------- */

/** Says which part of an invalid plate is wrong, when the three groups are visible. */
function plateReason(raw) {
  const m = /^(\d+)[\s-]+(\d+)[\s-]+(\d+)$/.exec(raw.trim());
  if (!m) return t('plateBad');
  const [, serial, middle, ww] = m;
  if (serial.length > 6 || /^0+$/.test(serial)) return t('plateErrSerial');
  if (middle.length !== 3) return t('plateErrMiddle');
  if (middle[0] === '0') return t('plateErrCategory');
  if (ww.length !== 2 || Number(ww) < 1 || Number(ww) > 69) return t('plateErrWilaya', ww);
  return t('plateBad');
}

function renderPlate() {
  const raw = $('#plate-input').value;
  const view = $('#plate-view');
  const status = $('#plate-status');
  const p = parsePlate(raw);
  const later = p ? null : parsePlate(raw, { at: AFTER_REFORM });
  const plate = p ?? later;

  if (plate) {
    plateDoc(view, formatPlate(raw, { at: AFTER_REFORM }), p ? 'ok' : 'pending');
    facts($('#plate-facts'), [
      [t('plateWilaya'), `${wilayaName(plate.wilaya)} (${String(plate.wilaya.code).padStart(2, '0')})`],
      [t('plateCategory'), `${CATEGORY[lang][plate.category]} (${plate.category})`],
      [t('plateYear'), plateYear(plate.year), true],
    ]);
    code($('#plate-code'), [
      `const p = parsePlate(${q(raw.trim())});`,
      ...(p
        ? [`p.wilaya.name;  // ${q(plate.wilaya.name)}`, `p.category;     // ${plate.category}`, `p.year;         // ${q(plate.year)}`]
        : ['// null today; valid from 1 January 2027:', `parsePlate(${q(raw.trim())}, { at: new Date('2027-01-01') });`]),
    ]);
    if (p) setStatus(status, 'ok', t('plateOk'));
    else setStatus(status, 'bad', t('plateSoon', plate.wilaya.code));
    return;
  }

  plateDoc(view, raw.trim() || '00000-000-00', 'invalid');
  facts($('#plate-facts'), []);
  code($('#plate-code'), [`parsePlate(${q(raw.trim())});  // null`]);
  setStatus(status, 'bad', plateReason(raw));
}

/* ---------- Amount in words tool ---------- */

function renderWords() {
  const raw = $('#words-input').value;
  const n = parseAmount(raw);
  const status = $('#words-status');
  if (!raw.trim() || !Number.isFinite(n) || n < 0 || n > 999_999_999_999) {
    $('#cheque-amount').textContent = '—';
    $('#words-fr').textContent = '—';
    $('#words-ar').textContent = '—';
    code($('#words-code'), [`amountToWords(${raw.trim() || 'NaN'});  // RangeError`]);
    setStatus(status, 'bad', t('wordsBad'));
    return;
  }
  $('#cheque-amount').textContent = `${num(n)} DA`;
  $('#words-fr').textContent = amountToWordsFr(n);
  $('#words-ar').textContent = amountToWordsAr(n);
  code($('#words-code'), [`amountToWords(${n}, 'fr');`, `amountToWords(${n}, 'ar');`]);
  setStatus(status, '', '');
}

/* ---------- Salary tool ---------- */

let salaryMode = 'gross';

function renderSalary() {
  const raw = $('#salary-input').value;
  const n = parseAmount(raw);
  const regime = $('#salary-regime').value;
  const status = $('#salary-status');
  const cells = ['gross', 'cnas', 'taxable', 'irg', 'net'].map((k) => $(`#ps-${k}`));
  const [segNet, segIrg, segCnas] = ['.seg-net', '.seg-irg', '.seg-cnas'].map((s) => $(s));

  if (!raw.trim() || !Number.isFinite(n) || n <= 0 || n > 100_000_000) {
    cells.forEach((c) => (c.textContent = '—'));
    $('#ps-net-big').textContent = '—';
    [segNet, segIrg, segCnas].forEach((s) => (s.style.width = '0'));
    $('#ps-employer').textContent = '';
    code($('#salary-code'), [`grossToNet(${raw.trim() || 'NaN'});  // DzkitError: invalid-amount`]);
    setStatus(status, 'bad', t('salaryBad'));
    return;
  }

  const opts = regime === 'salaried' ? {} : { regime };
  const r = salaryMode === 'gross' ? grossToNet(n, opts) : netToGross(n, opts);
  const optsCode = regime === 'salaried' ? '' : `, { regime: ${q(regime)} }`;
  const values = [r.gross, -r.cnasEmployee, r.taxable, -r.irg, r.net];
  cells.forEach((c, i) => {
    // `|| 0` turns −0 (a deduction of nothing) into 0, so it isn't shown as "-0.00".
    c.textContent = values[i] < 0 ? `− ${money(-values[i])}` : money(values[i] || 0);
    c.dir = 'ltr';
  });
  $('#ps-net-big').textContent = money(r.net);
  segNet.style.width = `${(r.net / r.gross) * 100}%`;
  segIrg.style.width = `${(r.irg / r.gross) * 100}%`;
  segCnas.style.width = `${(r.cnasEmployee / r.gross) * 100}%`;
  $('#ps-employer').textContent = t('employer', money(r.cnasEmployer), money(r.employerCost));
  code($('#salary-code'), [
    salaryMode === 'gross' ? `grossToNet(${n}${optsCode});` : `netToGross(${n}${optsCode});`,
    `// { gross: ${r.gross}, cnasEmployee: ${r.cnasEmployee},`,
    `//   taxable: ${r.taxable}, irg: ${r.irg}, net: ${r.net} }`,
  ]);
  setStatus(status, '', r.taxable <= 30000 ? t('salaryExempt') : t('salaryNote'));
}

function setSalaryMode(mode) {
  salaryMode = mode;
  document.querySelectorAll('#salary [data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  const label = $('#salary-input-label');
  label.dataset.i18n = mode === 'gross' ? 'salaryGrossLabel' : 'salaryNetLabel';
  label.textContent = t(label.dataset.i18n);
  renderSalary();
}

/* ---------- NIF / NIS tool ---------- */

let idType = 'nif';

function renderIds() {
  const raw = $('#ids-input').value;
  const digits = compactId(raw);
  const ok = idType === 'nif' ? isValidNif(raw) : isValidNis(raw);
  $('#ids-type').textContent = idType.toUpperCase();
  $('#ids-big').textContent = digits ? digits.replace(/(\d{3})(?=\d)/g, '$1 ') : '—';
  $('#ids-count').textContent = /^\d+$/.test(digits) ? t('idsCount', digits.length) : '';
  const fn = idType === 'nif' ? 'isValidNif' : 'isValidNis';
  code($('#ids-code'), [`${fn}(${q(raw.trim())});  // ${ok}`]);
  setStatus($('#ids-status'), ok ? 'ok' : 'bad', t(`${idType}${ok ? 'Ok' : 'Bad'}`));
}

function setIdType(type) {
  idType = type;
  document.querySelectorAll('#ids [data-id]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === type)));
  renderIds();
}

/* ---------- Theme ---------- */

const THEMES = ['auto', 'light', 'dark'];
let theme = 'auto';

function applyTheme(next) {
  theme = THEMES.includes(next) ? next : 'auto';
  if (theme === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  const label = t(`theme${theme[0].toUpperCase()}${theme.slice(1)}`);
  $('#theme-label').textContent = label;
  $('#theme-toggle').setAttribute('aria-label', label);
  try {
    if (theme === 'auto') localStorage.removeItem('dzkit-theme');
    else localStorage.setItem('dzkit-theme', theme);
  } catch {
    /* storage unavailable */
  }
}

/* ---------- Language ---------- */

function renderAll() {
  renderOmni();
  renderRip();
  renderPhone();
  renderPlate();
  renderWords();
  renderSalary();
  renderIds();
}

function setLang(next) {
  lang = T[next] ? next : 'fr';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  try {
    localStorage.setItem('dzkit-lang', lang);
  } catch {
    /* storage unavailable */
  }
  applyTheme(theme);
  renderAll();
}

/* ---------- Wiring ---------- */

$('#omni-input').addEventListener('input', renderOmni);
$('#rip-input').addEventListener('input', () => (renderRip(), pop($('#rip-strip'))));
$('#phone-input').addEventListener('input', renderPhone);
$('#plate-input').addEventListener('input', renderPlate);
$('#words-input').addEventListener('input', renderWords);
$('#salary-input').addEventListener('input', renderSalary);
$('#salary-regime').addEventListener('change', renderSalary);
$('#ids-input').addEventListener('input', renderIds);
document.querySelectorAll('#salary [data-mode]').forEach((b) => b.addEventListener('click', () => setSalaryMode(b.dataset.mode)));
document.querySelectorAll('#ids [data-id]').forEach((b) => b.addEventListener('click', () => setIdType(b.dataset.id)));
document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
$('#theme-toggle').addEventListener('click', () => applyTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]));

// Example chips fill their input (the hero's own input when no target is given).
document.querySelectorAll('.chip[data-fill]').forEach((chip) =>
  chip.addEventListener('click', () => {
    const input = $(chip.dataset.target || '#omni-input');
    input.value = chip.dataset.fill;
    input.dispatchEvent(new Event('input'));
    input.focus();
  }),
);

document.querySelectorAll('[data-copy]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($(btn.dataset.copy).textContent);
      btn.textContent = t('copied');
      setTimeout(() => (btn.textContent = t('copy')), 1500);
    } catch {
      /* clipboard blocked: the command stays selectable */
    }
  }),
);

// Highlight the tool currently on screen in the sticky navigation.
const navLinks = [...document.querySelectorAll('.toolnav a')];
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${entry.target.id}`)));
      const active = navLinks.find((a) => a.hash === `#${entry.target.id}`);
      const bar = active?.parentElement;
      if (bar && document.documentElement.dir === 'ltr' && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: active.offsetLeft - bar.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
document.querySelectorAll('.tool').forEach((s) => observer.observe(s));

let savedLang = null;
let savedTheme = null;
try {
  savedLang = localStorage.getItem('dzkit-lang');
  savedTheme = localStorage.getItem('dzkit-theme');
} catch {
  /* storage unavailable */
}
theme = THEMES.includes(savedTheme) ? savedTheme : 'auto';
const browser = (navigator.language || 'fr').slice(0, 2);
setLang(savedLang ?? (T[browser] ? browser : 'fr'));
