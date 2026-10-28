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

const CATEGORY = {
  fr: ['', 'Véhicule de tourisme', 'Camion', 'Camionnette', 'Autocar ou autobus', 'Tracteur routier', 'Autre tracteur', 'Véhicule spécial', 'Remorque ou semi-remorque', 'Motocyclette'],
  ar: ['', 'سيارة سياحية', 'شاحنة', 'شاحنة صغيرة', 'حافلة', 'جرار طريق', 'جرار آخر', 'مركبة خاصة', 'مقطورة أو نصف مقطورة', 'دراجة نارية'],
  en: ['', 'Passenger car', 'Truck', 'Van', 'Coach or bus', 'Road tractor', 'Other tractor', 'Special vehicle', 'Trailer or semi-trailer', 'Motorcycle'],
};

const LOCALE = { fr: 'fr-DZ', ar: 'ar-DZ', en: 'en-GB' };

let lang = 'fr';
const t = (key, ...args) => {
  const v = T[lang][key] ?? T.fr[key];
  return typeof v === 'function' ? v(...args) : v;
};

/* ---------- Helpers ---------- */

const $ = (sel) => document.querySelector(sel);

function money(n) {
  const s = new Intl.NumberFormat(LOCALE[lang], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: 'latn',
  }).format(n);
  return `${s} ${t('da')}`;
}

function setStatus(el, kind, text) {
  el.textContent = text;
  el.className = `status ${kind}`;
}

function facts(el, rows) {
  el.replaceChildren(
    ...rows.flatMap(([k, v, ltr]) => {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      if (ltr) dd.dir = 'ltr';
      return [dt, dd];
    }),
  );
}

function code(el, lines) {
  el.replaceChildren(
    ...lines.flatMap((line, i) => {
      const nodes = [];
      const m = /^(.*?)(\s*\/\/.*)?$/.exec(line);
      nodes.push(document.createTextNode(m[1]));
      if (m[2]) {
        const c = document.createElement('span');
        c.className = 'c';
        c.textContent = m[2];
        nodes.push(c);
      }
      if (i < lines.length - 1) nodes.push(document.createTextNode('\n'));
      return nodes;
    }),
  );
}

const q = (s) => `'${String(s).replace(/'/g, "\\'")}'`;
const parseAmount = (s) => Number(String(s).replace(/\s/g, '').replace(',', '.'));

/* ---------- RIP ---------- */

function renderRip() {
  const raw = $('#rip-input').value;
  const digits = raw.replace(/[\s.\-_/]/g, '');
  const strip = $('#rip-strip');
  const status = $('#rip-status');
  const parts = Object.fromEntries([...strip.querySelectorAll('[data-part]')].map((e) => [e.dataset.part, e]));
  strip.classList.remove('invalid');

  const show = (rip) => {
    parts.bank.textContent = rip.slice(0, 3);
    parts.branch.textContent = rip.slice(3, 8);
    parts.account.textContent = rip.slice(8, 18);
    parts.key.textContent = rip.slice(18, 20);
  };

  if (/^\d{1,10}$/.test(digits)) {
    const rip = ccpToRip(digits);
    show(rip);
    facts($('#rip-facts'), [
      [t('ripAccount'), digits.replace(/^0+(?=\d)/, ''), true],
      [t('ripCcpKey'), ccpKey(digits), true],
      [t('ripKey'), rip.slice(18), true],
    ]);
    code($('#rip-code'), [
      `ccpToRip(${q(digits)});  // ${q(rip)}`,
      `ccpKey(${q(digits)});    // ${q(ccpKey(digits))}`,
    ]);
    setStatus(status, 'ok', t('ripOkBuilt'));
    return;
  }

  if (/^\d{20}$/.test(digits)) {
    show(digits);
    const parsed = parseRip(digits);
    code($('#rip-code'), [`isValidRip(${q(raw.trim())});  // ${parsed !== null}`]);
    if (parsed) {
      facts($('#rip-facts'), [
        [t('ripAccount'), parsed.account.replace(/^0+(?=\d)/, ''), true],
        [t('ripCcpKey'), parsed.ccpKey, true],
      ]);
      setStatus(status, 'ok', t('ripOkValid'));
    } else {
      strip.classList.add('invalid');
      facts($('#rip-facts'), []);
      if (!digits.startsWith('00799999')) setStatus(status, 'bad', t('ripBadPrefix'));
      else setStatus(status, 'bad', t('ripBadKey', ccpToRip(digits.slice(8, 18)).slice(18)));
    }
    return;
  }

  strip.classList.add('invalid');
  show('00799999' + '0'.repeat(12));
  facts($('#rip-facts'), []);
  code($('#rip-code'), [`ccpToRip(${q(raw.trim())});  // TypeError`]);
  setStatus(status, 'bad', t('ripBadFormat'));
}

/* ---------- Phone ---------- */

function renderPhone() {
  const raw = $('#phone-input').value;
  const p = parsePhone(raw);
  const status = $('#phone-status');
  if (!p) {
    $('#phone-big').textContent = raw.trim() || '—';
    facts($('#phone-facts'), []);
    code($('#phone-code'), [`parsePhone(${q(raw.trim())});  // null`]);
    setStatus(status, 'bad', t('phoneBad'));
    return;
  }
  const intl = formatPhone(raw, 'international');
  $('#phone-big').textContent = intl;
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
  setStatus(status, 'ok', t('phoneOk'));
}

/* ---------- Plate ---------- */

const AFTER_REFORM = new Date('2027-06-01');

function renderPlate() {
  const raw = $('#plate-input').value;
  const view = $('#plate-view');
  const status = $('#plate-status');
  const p = parsePlate(raw);
  const later = p ? null : parsePlate(raw, { at: AFTER_REFORM });

  if (p || later) {
    const plate = p ?? later;
    view.classList.toggle('invalid', !p);
    $('#plate-text').textContent = formatPlate(raw, p ? undefined : { at: AFTER_REFORM });
    const name = lang === 'ar' ? plate.wilaya.nameAr : plate.wilaya.name;
    facts($('#plate-facts'), [
      [t('plateWilaya'), `${name} (${String(plate.wilaya.code).padStart(2, '0')})`],
      [t('plateCategory'), `${CATEGORY[lang][plate.category]} (${plate.category})`],
      [t('plateYear'), (Number(plate.year) <= (new Date().getFullYear() % 100) + 1 ? '20' : '19') + plate.year, true],
    ]);
    code($('#plate-code'), [
      `const p = parsePlate(${q(raw.trim())});`,
      ...(p
        ? [`p.wilaya.name;  // ${q(plate.wilaya.name)}`, `p.category;     // ${plate.category}`, `p.year;         // ${q(plate.year)}`]
        : [`// null today; valid from 1 January 2027:`, `parsePlate(${q(raw.trim())}, { at: new Date('2027-01-01') });`]),
    ]);
    if (p) setStatus(status, 'ok', t('plateOk'));
    else setStatus(status, 'bad', t('plateSoon', plate.wilaya.code));
    return;
  }

  view.classList.add('invalid');
  $('#plate-text').textContent = raw.trim() || '00000-000-00';
  facts($('#plate-facts'), []);
  code($('#plate-code'), [`parsePlate(${q(raw.trim())});  // null`]);
  setStatus(status, 'bad', t('plateBad'));
}

/* ---------- Amount in words ---------- */

function renderWords() {
  const raw = $('#words-input').value;
  const n = parseAmount(raw);
  const status = $('#words-status');
  if (!raw.trim() || !Number.isFinite(n) || n < 0 || n > 999_999_999_999) {
    $('#words-fr').textContent = '—';
    $('#words-ar').textContent = '—';
    code($('#words-code'), [`amountToWords(${raw.trim() || 'NaN'});  // RangeError`]);
    setStatus(status, 'bad', t('wordsBad'));
    return;
  }
  const fr = amountToWordsFr(n);
  const ar = amountToWordsAr(n);
  $('#words-fr').textContent = fr;
  $('#words-ar').textContent = ar;
  code($('#words-code'), [`amountToWords(${n}, 'fr');`, `amountToWords(${n}, 'ar');`]);
  setStatus(status, '', '');
}

/* ---------- Salary ---------- */

let salaryMode = 'gross';

function renderSalary() {
  const raw = $('#salary-input').value;
  const n = parseAmount(raw);
  const regime = $('#salary-regime').value;
  const status = $('#salary-status');
  const cells = ['gross', 'cnas', 'taxable', 'irg', 'net'].map((k) => $(`#ps-${k}`));

  if (!raw.trim() || !Number.isFinite(n) || n <= 0 || n > 100_000_000) {
    cells.forEach((c) => (c.textContent = '—'));
    $('#ps-employer').textContent = '';
    code($('#salary-code'), [`grossToNet(${raw.trim() || 'NaN'});  // RangeError`]);
    setStatus(status, 'bad', t('salaryBad'));
    return;
  }

  const opts = regime === 'salaried' ? {} : { regime };
  const r = salaryMode === 'gross' ? grossToNet(n, opts) : netToGross(n, opts);
  const optsCode = regime === 'salaried' ? '' : `, { regime: ${q(regime)} }`;
  const values = [r.gross, -r.cnasEmployee, r.taxable, -r.irg, r.net];
  cells.forEach((c, i) => {
    c.textContent = values[i] < 0 ? `− ${money(-values[i])}` : money(values[i]);
    c.dir = 'ltr';
  });
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

/* ---------- NIF / NIS ---------- */

let idType = 'nif';

function renderIds() {
  const raw = $('#ids-input').value;
  const ok = idType === 'nif' ? isValidNif(raw) : isValidNis(raw);
  $('#ids-big').textContent = compactId(raw) || '—';
  const fn = idType === 'nif' ? 'isValidNif' : 'isValidNis';
  code($('#ids-code'), [`${fn}(${q(raw.trim())});  // ${ok}`]);
  setStatus($('#ids-status'), ok ? 'ok' : 'bad', t(`${idType}${ok ? 'Ok' : 'Bad'}`));
}

function setIdType(type) {
  idType = type;
  document.querySelectorAll('#ids [data-id]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === type)));
  renderIds();
}

/* ---------- Language ---------- */

function renderAll() {
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
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  try {
    localStorage.setItem('dzkit-lang', lang);
  } catch {
    /* storage unavailable: the choice just isn't remembered */
  }
  renderAll();
}

/* ---------- Wiring ---------- */

$('#rip-input').addEventListener('input', renderRip);
$('#phone-input').addEventListener('input', renderPhone);
$('#plate-input').addEventListener('input', renderPlate);
$('#words-input').addEventListener('input', renderWords);
$('#salary-input').addEventListener('input', renderSalary);
$('#salary-regime').addEventListener('change', renderSalary);
$('#ids-input').addEventListener('input', renderIds);
document.querySelectorAll('#salary [data-mode]').forEach((b) => b.addEventListener('click', () => setSalaryMode(b.dataset.mode)));
document.querySelectorAll('#ids [data-id]').forEach((b) => b.addEventListener('click', () => setIdType(b.dataset.id)));
document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

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

let saved = null;
try {
  saved = localStorage.getItem('dzkit-lang');
} catch {
  saved = null;
}
const browser = (navigator.language || 'fr').slice(0, 2);
setLang(saved ?? (T[browser] ? browser : 'fr'));
