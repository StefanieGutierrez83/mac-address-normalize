/**
 * Canonical output formats supported by `normalizeMac`.
 *
 * Each value is the literal separator used between octets in that form.
 * 'BARE' is a sentinel meaning "no separator at all".
 *
 * Keeping the constants as the separator characters themselves (rather than
 * opaque enum values) makes the formatter trivially testable and keeps the
 * public API honest about what each form produces.
 */
export const FORMATS = Object.freeze({
  COLON: ':',
  DASH: '-',
  DOT: '.',
  BARE: '',
});

const HEX = '0-9a-fA-F';

/**
 * Accepts colon, dash, dot, and bare hex MAC notations.
 *
 * We deliberately do NOT support mixed separators (e.g. `01:23-45:67-89:AB`)
 * because real-world MAC strings use exactly one separator style throughout;
 * allowing mixtures would mask genuine data-entry errors rather than catch
 * them. This is a stated design choice, not an oversight.
 */
const PATTERNS = [
  // Six hex octets separated by colons: 01:23:45:67:89:AB
  new RegExp(`^(?:[${HEX}]{2}:){5}[${HEX}]{2}$`),
  // Six hex octets separated by dashes: 01-23-45-67-89-AB
  new RegExp(`^(?:[${HEX}]{2}-){5}[${HEX}]{2}$`),
  // Three 4-hex-digit groups separated by dots (Cisco-style): 0123.4567.89AB
  new RegExp(`^(?:[${HEX}]{4}\.){2}[${HEX}]{4}$`),
  // Twelve bare hex digits: 0123456789AB
  new RegExp(`^[${HEX}]{12}$`),
];

/**
 * Normalize a MAC address into a chosen canonical form.
 *
 * @param {string} input - The MAC address to normalize.
 * @param {string} [format=FORMATS.COLON] - One of the `FORMATS` values.
 * @returns {string} The MAC address rendered in the requested form, lowercase.
 * @throws {TypeError} If `input` is not a string.
 * @throws {Error} If `input` does not match any supported notation.
 *
 * Lowercasing is intentional: IEEE 802 MAC addresses are case-insensitive,
 * and a single canonical casing avoids downstream string-comparison bugs.
 */
export function normalizeMac(input, format = FORMATS.COLON) {
  if (typeof input !== 'string') {
    throw new TypeError(`normalizeMac expected a string, got ${typeof input}`);
  }

  const trimmed = input.trim();

  let matched = false;
  for (const pattern of PATTERNS) {
    if (pattern.test(trimmed)) {
      matched = true;
      break;
    }
  }
  if (!matched) {
    throw new Error(`Unrecognized MAC address: ${JSON.stringify(input)}`);
  }

  // Strip every non-hex character. Safe because we already validated the
  // overall shape, so only separators and hex digits remain.
  const hex = trimmed.replace(/[^0-9a-fA-F]/g, '').toLowerCase();

  const octets = [];
  for (let i = 0; i < hex.length; i += 2) {
    octets.push(hex.slice(i, i + 2));
  }

  if (format === FORMATS.DOT) {
    // Dot notation groups two octets per segment (Cisco convention).
    return [
      octets[0] + octets[1],
      octets[2] + octets[3],
      octets[4] + octets[5],
    ].join('.');
  }

  return octets.join(format);
}
