/**
 * Shared behaviour from dzkit-spec's OPERATIONS.md:
 *   - validators, parsers and formatters accept any value and never throw;
 *   - calculations throw a DzkitError with a code when the request is impossible;
 *   - text input may use Arabic-Indic digits and any Unicode space;
 *   - dates are days in Algeria (UTC+1).
 */

export type DzkitErrorCode = 'invalid-amount' | 'invalid-option' | 'no-rule-for-date';

/** Error thrown by calculations. `code` is the same in every dzkit package. */
export class DzkitError extends Error {
  readonly code: DzkitErrorCode;
  constructor(code: DzkitErrorCode, message: string) {
    super(message);
    this.name = 'DzkitError';
    this.code = code;
  }
}

const ARABIC_INDIC = /[٠-٩۰-۹]/g;

/** Converts ٠–٩ and ۰–۹ to 0–9. */
export function toLatinDigits(text: string): string {
  return text.replace(ARABIC_INDIC, (d) => String((d.charCodeAt(0) - 0x0660) % 0x90));
}

/**
 * Text input as an identifier parser sees it: Latin digits, trimmed. Returns null for
 * anything that isn't a string, so parsers can reject it without throwing.
 */
export function cleanText(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  return toLatinDigits(input).trim();
}

/** A date option: a Date, or an ISO day "YYYY-MM-DD". */
export type DateInput = Date | string;

/** The day, as "YYYY-MM-DD" in Algeria (UTC+1), of a date option; today when omitted. */
export function dayOf(at?: DateInput): string {
  if (at === undefined) return algeriaDay(new Date());
  if (typeof at === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(at) || Number.isNaN(Date.parse(`${at}T00:00:00Z`))) {
      throw new DzkitError('invalid-option', `Expected a date as YYYY-MM-DD, got ${at}`);
    }
    return at;
  }
  if (!(at instanceof Date) || Number.isNaN(at.getTime())) throw new DzkitError('invalid-option', 'Expected a valid date');
  return algeriaDay(at);
}

function algeriaDay(d: Date): string {
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Like dayOf, for validators and parsers: an invalid date gives null instead of throwing. */
export function dayOrNull(at?: DateInput): string | null {
  try {
    return dayOf(at);
  } catch {
    return null;
  }
}

/** Throws invalid-amount unless `amount` is a finite, non-negative number. */
export function checkAmount(amount: unknown, what = 'amount'): asserts amount is number {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    throw new DzkitError('invalid-amount', `Expected a non-negative ${what}, got ${String(amount)}`);
  }
}
