import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMac, FORMATS } from '../src/index.js';

describe('normalizeMac', () => {
  describe('happy path', () => {
    it('normalizes a colon-separated MAC to colon form by default', () => {
      assert.equal(normalizeMac('01:23:45:67:89:AB'), '01:23:45:67:89:ab');
    });

    it('converts colon form to dash form', () => {
      assert.equal(normalizeMac('01:23:45:67:89:AB', FORMATS.DASH), '01-23-45-67-89-ab');
    });

    it('converts colon form to dot form', () => {
      assert.equal(normalizeMac('01:23:45:67:89:AB', FORMATS.DOT), '0123.4567.89ab');
    });

    it('converts colon form to bare form', () => {
      assert.equal(normalizeMac('01:23:45:67:89:AB', FORMATS.BARE), '0123456789ab');
    });

    it('parses dash-separated input', () => {
      assert.equal(normalizeMac('01-23-45-67-89-AB', FORMATS.COLON), '01:23:45:67:89:ab');
    });

    it('parses dot-separated (Cisco) input', () => {
      assert.equal(normalizeMac('0123.4567.89AB', FORMATS.COLON), '01:23:45:67:89:ab');
    });

    it('parses bare hex input', () => {
      assert.equal(normalizeMac('0123456789AB', FORMATS.COLON), '01:23:45:67:89:ab');
    });

    it('lowercases uppercase input', () => {
      assert.equal(normalizeMac('AA:BB:CC:DD:EE:FF', FORMATS.BARE), 'aabbccddeeff');
    });

    it('trims surrounding whitespace before parsing', () => {
      assert.equal(normalizeMac('  01:23:45:67:89:AB  ', FORMATS.COLON), '01:23:45:67:89:ab');
    });
  });

  describe('round-trip stability', () => {
    it('produces identical output when the output form is fed back in', () => {
      const mac = '01:23:45:67:89:ab';
      for (const fmt of Object.values(FORMATS)) {
        const once = normalizeMac(mac, fmt);
        const twice = normalizeMac(once, fmt);
        assert.equal(twice, once);
      }
    });
  });

  describe('error handling', () => {
    it('throws TypeError for non-string input', () => {
      assert.throws(() => normalizeMac(123456), TypeError);
    });

    it('throws for a too-short value', () => {
      assert.throws(() => normalizeMac('01:23:45:67:89'), Error);
    });

    it('throws for a too-long value', () => {
      assert.throws(() => normalizeMac('01:23:45:67:89:AB:CD'), Error);
    });

    it('throws for mixed separators', () => {
      assert.throws(() => normalizeMac('01:23-45:67-89:AB'), Error);
    });

    it('throws for non-hex characters', () => {
      assert.throws(() => normalizeMac('01:23:45:67:89:ZZ'), Error);
    });

    it('throws for an empty string', () => {
      assert.throws(() => normalizeMac(''), Error);
    });
  });
});
