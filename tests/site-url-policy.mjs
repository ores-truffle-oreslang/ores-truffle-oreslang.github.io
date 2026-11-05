/**
 * Fail-closed URL policy for generated static pages.
 * URLs in HTML attributes are entity-decoded by browsers before navigation:
 * comparing raw HTML strings alone misses dangerous encoded schemes.
 *
 * Relative/local and HTTPS links, plus mailto/tel anchors, remain valid.
 * Executable, inline-data, privileged, and unknown schemes fail the build.
 */
const namedEntities = new Map([
  ["amp", "&"], ["quot", '"'], ["apos", "'"], ["lt", "<"], ["gt", ">"],
  ["colon", ":"], ["Tab", "\t"], ["NewLine", "\n"],
]);

export function decodeUrlAttribute(raw) {
  if (typeof raw !== "string" || raw.length > 8192) {
    throw new Error("Invalid or oversized HTML URL attribute");
  }
  return raw
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));?/giu, (whole, hex, dec) => {
      const point = Number.parseInt(hex ?? dec, hex === undefined ? 10 : 16);
      return Number.isSafeInteger(point) && point > 0 && point <= 0x10ffff
        && !(point >= 0xd800 && point <= 0xdfff)
        ? String.fromCodePoint(point) : "\uFFFD";
    })
    .replace(/&([a-z][a-z0-9]+);/giu, (whole, name) =>
      namedEntities.get(name) ?? whole);
}

export function validatedSiteUrl(raw, base, attribute = "href") {
  const decoded = decodeUrlAttribute(raw);
  if (!decoded || decoded !== decoded.trim()
      || /[\u0000-\u001f\u007f]/u.test(decoded)) {
    throw new Error("Unsafe whitespace or control character in " + attribute + ": " + raw);
  }
  let target;
  try { target = new URL(decoded, base); }
  catch { throw new Error("Malformed URL in " + attribute + ": " + raw); }
  const allowed = attribute === "href"
    ? ["http:", "https:", "mailto:", "tel:"]
    : ["http:", "https:"];
  if (!allowed.includes(target.protocol)) {
    throw new Error("Unsafe or unsupported URL scheme in " + attribute + ": " + raw);
  }
  // Public production pages must not link to insecure HTTP origins.
  // Retain same-origin loopback HTTP for local Astro preview builds.
  if (target.protocol === "http:") {
    const baseUrl = new URL(base);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(baseUrl.hostname.toLowerCase());
    if (!loopback || baseUrl.protocol !== "http:" || target.origin !== baseUrl.origin) {
      throw new Error("Insecure external HTTP URL forbidden in " + attribute + ": " + raw);
    }
  }
  if (target.protocol === "http:" || target.protocol === "https:") {
    if (target.username || target.password) {
      throw new Error("Credential-bearing URL forbidden in " + attribute + ": " + raw);
    }
  }
  return target;
}

export function htmlAttribute(tag, name) {
  const found = tag.match(new RegExp(
    "(?:^|\\s)" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>\"']+))", "iu"));
  return found ? (found[1] ?? found[2] ?? found[3]) : null;
}
