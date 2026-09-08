/* Compact invitation code:  ?i=<code>
   Packs guest name + side + family flag into a short base64url string.
   Gujarati letters (U+0A80–U+0AFF) take 1 byte each; other characters are escaped. */
(function () {
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const SPECIAL = { ' ': 0x80, '.': 0x81, '/': 0x82, ',': 0x83, '-': 0x84, '(': 0x85, ')': 0x86 };
  const SPECIAL_REV = Object.fromEntries(Object.entries(SPECIAL).map(([k, v]) => [v, k]));

  function toB64(bytes) {
    let out = '', i = 0;
    for (; i + 2 < bytes.length; i += 3) {
      const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      out += B64[n >> 18] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63];
    }
    if (i < bytes.length) {
      const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8);
      out += B64[n >> 18] + B64[(n >> 12) & 63] + (i + 1 < bytes.length ? B64[(n >> 6) & 63] : '');
    }
    return out;
  }
  function fromB64(s) {
    const bytes = [];
    for (let i = 0; i < s.length; i += 4) {
      const a = B64.indexOf(s[i]), b = B64.indexOf(s[i + 1]), c = B64.indexOf(s[i + 2]), d = B64.indexOf(s[i + 3]);
      if (a < 0 || b < 0) break;
      bytes.push((a << 2) | (b >> 4));
      if (c >= 0) bytes.push(((b & 15) << 4) | (c >> 2));
      if (d >= 0) bytes.push(((c & 3) << 6) | d);
    }
    return bytes;
  }

  function encode({ name = '', side = 'groom', all = true }) {
    const bytes = [(side === 'bride' ? 1 : 0) | (all ? 2 : 0) | (name ? 4 : 0)];
    for (const ch of name) {
      const cp = ch.codePointAt(0);
      if (cp >= 0x0A80 && cp <= 0x0AFF) bytes.push(cp - 0x0A80);
      else if (SPECIAL[ch] !== undefined) bytes.push(SPECIAL[ch]);
      else if (cp < 0x10000) bytes.push(0xFE, cp >> 8, cp & 0xFF);       // escaped BMP char
      else bytes.push(0xFF, (cp >> 16) & 0xFF, (cp >> 8) & 0xFF, cp & 0xFF);
    }
    return toB64(bytes);
  }
  function decode(code) {
    const bytes = fromB64(code || '');
    if (!bytes.length) return null;
    const h = bytes[0];
    let name = '';
    for (let i = 1; i < bytes.length; i++) {
      const b = bytes[i];
      if (b < 0x80) name += String.fromCodePoint(0x0A80 + b);
      else if (SPECIAL_REV[b]) name += SPECIAL_REV[b];
      else if (b === 0xFE) { name += String.fromCodePoint((bytes[i + 1] << 8) | bytes[i + 2]); i += 2; }
      else if (b === 0xFF) { name += String.fromCodePoint((bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]); i += 3; }
    }
    return { side: (h & 1) ? 'bride' : 'groom', all: !!(h & 2), name: (h & 4) ? name : '' };
  }
  window.InviteCode = { encode, decode };
})();
