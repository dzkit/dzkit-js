// Generates src/generated/spec-data.ts from dzkit-spec, the rules registry shared by
// every dzkit package. The values come from the spec; the logic stays in src/.
//
//   npm run generate          write the file
//   npm run generate:check    fail if the file is missing or out of date (used in CI)
//
// The dzkit-spec version is pinned in package.json (devDependencies).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'src', 'generated', 'spec-data.ts');
const check = process.argv.includes('--check');

const require = createRequire(import.meta.url);
const spec = require('dzkit-spec/dist/dzkit-spec.json');

const SUPPORTED_SCHEMA = 3;
if (spec.schema_version !== SUPPORTED_SCHEMA) {
  fail(`dzkit-spec ${spec.version} uses format ${spec.schema_version}; this generator understands ${SUPPORTED_SCHEMA}.`);
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function rule(id) {
  const r = spec.rules.find((x) => x.id === id);
  if (!r) fail(`dzkit-spec ${spec.version} has no rule "${id}".`);
  return r;
}

/** The version in force today, or the latest one if several are open-ended. */
function current(id) {
  const r = rule(id);
  const open = r.versions.filter((v) => v.valid_to === null);
  if (open.length !== 1) fail(`Rule "${id}" should have exactly one open-ended version, found ${open.length}.`);
  return open[0];
}

/** Fraction kept as [numerator, denominator] so the code multiplies before dividing, like the DGI. */
const ratio = ([n, d]) => `[${n}, ${d}]`;
const num = (n) => (n === null ? 'Infinity' : Number.isInteger(n) && Math.abs(n) >= 10_000 ? n.toLocaleString('en').replace(/,/g, '_') : String(n));
const str = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const date = (d) => `'${d}'`;

function sourcesComment(version) {
  return version.sources.map((s) => (typeof s === 'string' ? s : s.source)).join(', ');
}

// ---------------------------------------------------------------------------

const wilayas = current('administrative.wilayas');
const plates = rule('vehicles.plates');
const platesNow = current('vehicles.plates');
const phone = current('telecom.phone');
const ccp = current('banking.ccp-rip');
const nif = current('business.nif');
const nis = current('business.nis');
const irg = current('payroll.irg-salary');
const cnas = current('payroll.cnas');

// Plates: the date the widest wilaya range starts (codes 59–69 from 1 January 2027).
const plateRanges = plates.versions.map((v) => ({ from: v.valid_from, to: v.data.wilaya_codes.to }));
const widest = plateRanges.reduce((a, b) => (b.to > a.to ? b : a));
const previous = plateRanges.filter((r) => r.to < widest.to).reduce((a, b) => (b.to > a.to ? b : a), { to: 0 });

const smoothing = (regime) => {
  const s = irg.data.smoothing.find((x) => x.regimes.includes(regime));
  if (!s) fail(`No IRG smoothing for regime "${regime}".`);
  return s;
};
const salaried = smoothing('salaried');
const favourable = smoothing('retired');
if (!smoothing('disabled').regimes.includes('retired')) fail('IRG: retired and disabled workers are expected to share one smoothing formula.');
if (irg.data.rounding.mode !== 'floor') fail(`IRG: unsupported rounding mode "${irg.data.rounding.mode}".`);

const blocks = (list) => list.map(([a, b]) => `[${a}, ${b}]`).join(', ');
const ripKey = ccp.data.rip.key;

const lines = [];
const w = (s = '') => lines.push(s);

w('// Generated from dzkit-spec. Do not edit by hand: run `npm run generate`.');
w('// Each value links back to a rule in https://github.com/dzkit/dzkit-spec, where its');
w('// official sources, verification level and validity dates are recorded.');
w('/* eslint-disable */');
w();
w(`export const SPEC_VERSION = ${str(spec.version)};`);
w();
w(`// administrative.wilayas (valid from ${wilayas.valid_from}; sources: ${sourcesComment(wilayas)})`);
w(`/** First day the list applies (dates before it have no version). */`);
w(`export const WILAYAS_VALID_FROM = ${date(wilayas.valid_from)};`);
w('export const WILAYA_DATA = [');
for (const x of wilayas.data) {
  const extra = x.parent ? `, parent: ${x.parent}, validFrom: ${date(x.valid_from)}` : '';
  w(`  { code: ${x.code}, name: ${str(x.name_fr)}, nameAr: ${str(x.name_ar)}${extra} },`);
}
w('] as const;');
w();
w(`// vehicles.plates (sources: ${sourcesComment(platesNow)})`);
w(`export const PLATE_WILAYA_MAX_BEFORE = ${previous.to};`);
w(`export const PLATE_WILAYA_MAX = ${widest.to};`);
w(`/** First day plates with wilaya codes ${previous.to + 1}–${widest.to} are issued (Algeria time). */`);
w(`export const PLATE_NEW_WILAYAS_FROM = ${date(widest.from)};`);
w('export const PLATE_CATEGORY_DATA = [');
for (const c of platesNow.data.categories) w(`  { code: ${c.code}, fr: ${str(c.fr)}, ar: ${str(c.ar)}, en: ${str(c.en)} },`);
w('] as const;');
w(`export const PLATE_SERIAL_DISPLAY_DIGITS = ${platesNow.data.serial.display_digits};`);
w();
w(`// telecom.phone (valid from ${phone.valid_from}; sources: ${sourcesComment(phone)})`);
w(`export const PHONE_COUNTRY_CODE = ${str(phone.data.country_code)};`);
w('export const PHONE_OPERATORS = {');
for (const o of phone.data.operators) w(`  ${str(o.first_digit)}: ${str(o.operator)},`);
w('} as const;');
w('export const PHONE_MOBILE_BLOCKS = {');
for (const [op, list] of Object.entries(phone.data.mobile_blocks)) w(`  ${op}: [${blocks(list)}],`);
w('} as const;');
w(`export const PHONE_FREEPHONE_BLOCKS = [${blocks(phone.data.allocated_blocks.service.filter((b) => b.use === 'freephone').map((b) => b.range))}] as const;`);
w(`export const PHONE_SERVICE_BLOCKS = [${blocks(phone.data.allocated_blocks.service.map((b) => b.range))}] as const;`);
w(`export const PHONE_VOIP_BLOCKS = [${blocks(phone.data.allocated_blocks.voip.map((b) => b.range))}] as const;`);
w();
w(`// banking.ccp-rip (sources: ${sourcesComment(ccp)})`);
w(`export const RIP_BANK_CODE = ${str(ccp.data.rip.bank_code)};`);
w(`export const RIP_BRANCH_CODE = ${str(ccp.data.rip.branch_code)};`);
w(`export const RIP_ACCOUNT_DIGITS = ${ccp.data.rip.account_digits};`);
w(`export const RIP_KEY = { modulus: ${ripKey.modulus}, multiplier: ${ripKey.multiplier}, offset: ${ripKey.offset} } as const;`);
w(`export const CCP_KEY_WEIGHTS_FROM_RIGHT = [${ccp.data.ccp_key.weights_from_right.join(', ')}] as const;`);
w(`export const CCP_KEY_MODULUS = ${ccp.data.ccp_key.modulus};`);
w();
w(`// business.nif (status ${nif.status}; sources: ${sourcesComment(nif)})`);
w(`export const NIF_LENGTHS = [${nif.data.lengths.join(', ')}] as const;`);
w(`// business.nis (status ${nis.status}; sources: ${sourcesComment(nis)})`);
w(`export const NIS_LENGTHS = [${nis.data.lengths.join(', ')}] as const;`);
w();
w(`// payroll.irg-salary (valid from ${irg.valid_from}; sources: ${sourcesComment(irg)})`);
w(`export const IRG_VALID_FROM = ${date(irg.valid_from)};`);
w(`export const IRG_REGIMES = [${Object.keys(irg.data.regimes).map(str).join(', ')}] as const;`);
w('export const IRG_MONTHLY_BRACKETS = [');
for (const b of irg.data.brackets) w(`  { upTo: ${num(b.up_to)}, rate: ${b.rate} },`);
w('] as const;');
w(`export const IRG_EXEMPTION_THRESHOLD = ${num(irg.data.exemption_threshold)};`);
w(`export const IRG_ABATEMENT = { rate: ${irg.data.abatement.rate}, min: ${num(irg.data.abatement.min)}, max: ${num(irg.data.abatement.max)} } as const;`);
w(`export const IRG_SALARIED_SMOOTHING = { below: ${num(salaried.below)}, multiplier: ${ratio(salaried.multiplier)}, subtract: ${ratio(salaried.subtract)} } as const;`);
w(`export const IRG_FAVOURABLE_SMOOTHING = { below: ${num(favourable.below)}, multiplier: ${ratio(favourable.multiplier)}, subtract: ${ratio(favourable.subtract)} } as const;`);
w(`export const IRG_ROUNDING_STEP = ${irg.data.rounding.step};`);
w();
w(`// payroll.cnas (valid from ${cnas.valid_from}; sources: ${sourcesComment(cnas)})`);
w(`export const CNAS_EMPLOYEE_RATE = ${cnas.data.employee};`);
w(`export const CNAS_EMPLOYER_RATE = ${cnas.data.employer};`);
w(`export const CNAS_SOCIAL_SERVICES_RATE = ${cnas.data.social_services};`);

const content = lines.join('\n') + '\n';

if (check) {
  let existing = '';
  try {
    existing = readFileSync(out, 'utf8');
  } catch {}
  if (existing !== content) fail('src/generated/spec-data.ts is out of date. Run `npm run generate` and commit the result.');
  console.log(`✓ src/generated/spec-data.ts matches dzkit-spec ${spec.version}`);
} else {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
  console.log(`✓ wrote src/generated/spec-data.ts from dzkit-spec ${spec.version}`);
}
