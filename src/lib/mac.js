// MAC / OUI lookup against the bundled IEEE MA-L registry (src/data/oui.tsv.gz,
// "ASSIGNMENT\tOrganization" per line). Inflated once, on first use.
import fs from "node:fs";
import zlib from "node:zlib";

let DB = null;
function db() {
  if (DB) return DB;
  const tsv = zlib.gunzipSync(fs.readFileSync(new URL("../data/oui.tsv.gz", import.meta.url))).toString("utf8");
  DB = new Map();
  for (const line of tsv.split("\n")) {
    if (line.charCodeAt(6) === 9) DB.set(line.slice(0, 6), line.slice(7).trim());
  }
  return DB;
}

export function macLookup(mac) {
  const hex = String(mac || "").toUpperCase().replace(/[^0-9A-F]/g, "");
  if (hex.length < 6) return { error: "Give at least the first three octets of a MAC address, e.g. 00:1A:2B or 00-1A-2B-3C-4D-5E." };
  if (hex.length > 12) return { error: `"${mac}" has more than 12 hex digits — that is not a 48-bit MAC.` };
  const oui = hex.slice(0, 6);
  const first = parseInt(oui.slice(0, 2), 16);
  const vendor = db().get(oui) || null;
  return {
    input: String(mac).trim(),
    normalized: hex.length === 12 ? hex.match(/.{2}/g).join(":") : null,
    oui: oui.match(/.{2}/g).join(":"),
    vendor,
    multicast: (first & 0x01) !== 0,
    locally_administered: (first & 0x02) !== 0,
    registry_size: db().size,
  };
}

export function renderMac(r) {
  if (r.error) return r.error;
  const lines = [
    `${r.normalized || r.oui + " (prefix only)"}`,
    ``,
    `  OUI       ${r.oui}`,
    `  Vendor    ${r.vendor || "not in the IEEE MA-L registry"}`,
    `  Cast      ${r.multicast ? "multicast (I/G bit set)" : "unicast"}`,
    `  Admin     ${r.locally_administered ? "locally administered (U/L bit set)" : "globally unique — assigned by the IEEE"}`,
  ];
  if (r.locally_administered && !r.vendor) {
    lines.push(``, `A locally administered address with no vendor is what randomised (privacy) MACs, VMs and containers look like — there is nothing to look up.`);
  } else if (!r.vendor) {
    lines.push(``, `Not in the MA-L block registry. It may be a smaller MA-M/MA-S assignment (28/36-bit prefixes), which this table does not carry.`);
  }
  return lines.join("\n");
}
