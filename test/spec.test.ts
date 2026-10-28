import { describe, expect, it } from 'vitest';
import * as dz from '../src';
import vectors from 'dzkit-spec/dist/vectors.json';

/**
 * Shared test cases from dzkit-spec, the rules registry every dzkit package follows.
 * The version is pinned in package.json (devDependencies); it is only used by the tests
 * and is never installed for users of this package.
 *
 * Each suite names an operation in neutral terms (snake_case fields, no JS types).
 * RUNNERS maps every operation to dzkit-js functions and returns the same shape.
 * A case with `expected: null` must be rejected (null or { valid: false }).
 */

interface Case {
  id: string;
  input: Record<string, any>;
  expected?: Record<string, unknown> | null;
  error?: string;
  source?: string;
}
interface Suite {
  operation: string;
  cases: Case[];
}
interface VectorBundle {
  version: string;
  schema_version: number;
  suites: Suite[];
}

const bundle = vectors as unknown as VectorBundle;

/** The format version this file understands. A new major format needs code changes here. */
const SUPPORTED_SCHEMA = 3;

type Runner = (input: Record<string, any>) => Record<string, unknown> | null;

const RUNNERS: Record<string, Runner> = {
  'rip.validate': ({ rip }) => {
    const p = dz.parseRip(rip);
    return p && { valid: true, account: p.account, key: p.key };
  },
  'rip.from-ccp': ({ account }) => {
    const rip = dz.ccpToRip(account);
    return rip ? { rip, ccp_key: dz.ccpKey(account), rip_key: rip.slice(18) } : null;
  },
  'phone.parse': ({ number }) => {
    const p = dz.parsePhone(number);
    if (!p) return null;
    const out: Record<string, unknown> = { type: p.type, national: p.national, e164: p.e164 };
    if (p.operator) out.operator = p.operator;
    if (p.allocated !== undefined) out.allocated = p.allocated;
    if (p.areaCode) out.area_code = p.areaCode;
    if (p.freephone !== undefined) out.freephone = p.freephone;
    return out;
  },
  'plate.parse': ({ plate, date }) => {
    const p = dz.parsePlate(plate, { at: date });
    return p && { serial: p.serial, category: p.category, year: p.year, wilaya: p.wilaya.code };
  },
  'nif.validate': ({ value }) => ({ valid: dz.isValidNif(value) }),
  'nis.validate': ({ value }) => ({ valid: dz.isValidNis(value) }),
  'irg.calculate': ({ taxable, regime, date }) => ({ irg: dz.calculateIrg(taxable, { regime, at: date }) }),
  'salary.gross-to-net': ({ gross, regime, date }) => {
    const r = dz.grossToNet(gross, { regime, at: date });
    return {
      cnas_employee: r.cnasEmployee,
      taxable: r.taxable,
      irg: r.irg,
      net: r.net,
      cnas_employer: r.cnasEmployer,
    };
  },
  'words.number-fr': ({ number }) => ({ text: dz.toWordsFr(number) }),
  'words.amount-fr': ({ amount }) => ({ text: dz.amountToWordsFr(amount) }),
  'words.number-ar': ({ number }) => ({ text: dz.toWordsAr(number) }),
  'words.amount-ar': ({ amount }) => ({ text: dz.amountToWordsAr(amount) }),
  'wilaya.lookup': ({ code, date }) => {
    const w = dz.getWilaya(code, { at: date });
    return w ? { name_fr: w.name, name_ar: w.nameAr } : null;
  },
};

describe(`dzkit-spec ${bundle.version} shared test cases`, () => {
  it(`uses format version ${SUPPORTED_SCHEMA}`, () => {
    expect(bundle.schema_version).toBe(SUPPORTED_SCHEMA);
  });

  it('has a runner for every operation in the spec', () => {
    const missing = bundle.suites.map((s) => s.operation).filter((op) => !(op in RUNNERS));
    expect(missing).toEqual([]);
  });

  for (const suite of bundle.suites) {
    describe(suite.operation, () => {
      const run = RUNNERS[suite.operation];
      for (const c of suite.cases) {
        const label = c.source ? `${c.id} (${c.source})` : c.id;
        it.skipIf(!run)(label, () => {
          if (c.error !== undefined) {
            // An impossible request: must throw a DzkitError with this code.
            let thrown: unknown;
            try {
              run!(c.input);
            } catch (e) {
              thrown = e;
            }
            expect(thrown, 'expected an error').toBeInstanceOf(dz.DzkitError);
            expect((thrown as dz.DzkitError).code).toBe(c.error);
            return;
          }
          const got = run!(c.input);
          if (c.expected === null) {
            expect(got === null || got.valid === false, `expected rejection, got ${JSON.stringify(got)}`).toBe(true);
            return;
          }
          expect(got).not.toBeNull();
          const expected = c.expected as Record<string, unknown>;
          // Fields set to null in the spec are not pinned yet; only compare the others.
          const pinned = Object.fromEntries(Object.entries(expected).filter(([, v]) => v !== null));
          const actual = Object.fromEntries(Object.keys(pinned).map((k) => [k, got![k]]));
          expect(actual).toEqual(pinned);
        });
      }
    });
  }
});
