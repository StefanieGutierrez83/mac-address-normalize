# MAC Address Normalize

Parses MAC addresses written in colon, dash, dot, or bare-hex notation and reformats them into a single canonical form.

## Usage

```js
import { normalizeMac, FORMATS } from 'mac-address-normalize';

normalizeMac('01-23-45-67-89-AB');                  // '01:23:45:67:89:ab'
normalizeMac('0123.4567.89AB', FORMATS.DASH);      // '01-23-45-67-89-ab'
normalizeMac('0123456789AB', FORMATS.DOT);         // '0123.4567.89ab'
normalizeMac('01:23:45:67:89:AB', FORMATS.BARE);   // '0123456789ab'
```

## Why

Every operating system and vendor prints MAC addresses differently: Linux uses colons, Windows uses dashes, Cisco IOS uses dot-separated 4-hex groups, and configuration files often store bare hex. This library gives you one function that accepts all four and emits exactly one. The trade-off is strictness: it rejects mixed-separator strings like `01:23-45:67-89:AB` rather than guessing, because those almost always indicate a data-entry mistake worth surfacing.

## Edge cases

- Output is always **lowercase**. IEEE 802 MAC addresses are case-insensitive, and forcing one casing prevents downstream string-comparison bugs.
- Surrounding whitespace is trimmed; internal whitespace is rejected.
- The dot form groups two octets per segment (`0123.4567.89ab`), matching the Cisco convention — not one octet per segment.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

