/**
 * Public entry point for the MAC address normalization library.
 *
 * Re-exports the formatter and the canonical-form constants so consumers
 * can import everything from one place.
 */
export { normalizeMac, FORMATS } from './core.js';
