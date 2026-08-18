import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEALS_PATH = path.join(ROOT, "deals.json");
const CONFIG_PATH = path.join(ROOT, "deals-config.json");
const VALID_BRANDS = new Set(["skylon", "easton", "victory", "carbon"]);
const VALID_MATERIALS = new Set(["carbon", "alu"]);
const VALID_TIERS = new Set(["eco", "mid", "premium"]);

function normalizeModelKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function csvToDeals(text) {
  const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (rows.length < 2) return [];
  const headers = parseCsvLine(rows[0]).map((value) => value.toLowerCase());
  return rows.slice(1).map((row) => {
    const values = parseCsvLine(row);
    const entry = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    return {
      brand: entry.brand,
      modelKey: normalizeModelKey(entry.modelkey || entry.model || entry.title),
      material: entry.material,
      bowTypes: (entry.bowtypes || "recurve").split("|").map((value) => value.trim()).filter(Boolean),
      tier: entry.tier || "mid",
      title: entry.title,
      price: entry.price,
      url: entry.url,
      shop: entry.shop
    };
  });
}

function isValidDealEntry(entry) {
  return entry
    && typeof entry.brand === "string"
    && typeof entry.modelKey === "string"
    && typeof entry.material === "string"
    && Array.isArray(entry.bowTypes)
    && typeof entry.tier === "string"
    && typeof entry.title === "string"
    && typeof entry.price === "string"
    && typeof entry.url === "string"
    && typeof entry.shop === "string";
}

function normalizeDeals(deals) {
  return deals
    .filter(isValidDealEntry)
    .map((entry) => ({
      brand: entry.brand.trim().toLowerCase(),
      modelKey: normalizeModelKey(entry.modelKey),
      material: entry.material.trim().toLowerCase(),
      bowTypes: entry.bowTypes.map((value) => value.trim().toLowerCase()).filter(Boolean),
      tier: entry.tier.trim().toLowerCase(),
      title: entry.title.trim(),
      price: entry.price.trim(),
      url: entry.url.trim(),
      shop: entry.shop.trim().toLowerCase()
    }));
}

function validateDealsOrThrow(deals) {
  const invalid = deals.filter((entry) => {
    if (!VALID_BRANDS.has(entry.brand)) return true;
    if (!VALID_MATERIALS.has(entry.material)) return true;
    if (!VALID_TIERS.has(entry.tier)) return true;
    if (!entry.modelKey) return true;
    if (!entry.title) return true;
    if (!entry.price) return true;
    if (!entry.url || !entry.url.startsWith("http")) return true;
    if (!entry.shop || !entry.shop.includes(".")) return true;
    if (!entry.bowTypes.length) return true;
    return false;
  });

  if (invalid.length) {
    const sample = invalid.slice(0, 3).map((entry) => JSON.stringify(entry)).join("\n");
    throw new Error(`Remote deals source is malformed. Invalid rows detected:\n${sample}`);
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function resolveRemoteSource() {
  const config = await readJson(CONFIG_PATH);
  const remoteJsonUrl = process.env.DEALS_REMOTE_JSON_URL || config.remoteJsonUrl || "";
  const remoteCsvUrl = process.env.DEALS_REMOTE_CSV_URL || config.remoteCsvUrl || "";

  if (remoteJsonUrl) return { type: "json", url: remoteJsonUrl };
  if (remoteCsvUrl) return { type: "csv", url: remoteCsvUrl };
  return null;
}

async function fetchRemotePayload(source) {
  const response = await fetch(source.url, { headers: { "cache-control": "no-cache" } });
  if (!response.ok) {
    throw new Error(`Remote source failed: ${response.status} ${response.statusText}`);
  }
  if (source.type === "json") {
    const payload = await response.json();
    const deals = normalizeDeals(payload.deals || []);
    validateDealsOrThrow(deals);
    return {
      updatedAt: new Date().toISOString(),
      source: payload.source || "remote-json-sync",
      deals
    };
  }

  const text = await response.text();
  const deals = normalizeDeals(csvToDeals(text));
  validateDealsOrThrow(deals);
  return {
    updatedAt: new Date().toISOString(),
    source: "remote-csv-sync",
    deals
  };
}

async function main() {
  const source = await resolveRemoteSource();
  if (!source) {
    console.log("No remote source configured. Set DEALS_REMOTE_JSON_URL or DEALS_REMOTE_CSV_URL, or update deals-config.json.");
    process.exit(0);
  }

  const nextDealsState = await fetchRemotePayload(source);
  if (!nextDealsState.deals.length) {
    throw new Error("Remote source returned zero valid deals.");
  }

  await fs.writeFile(DEALS_PATH, `${JSON.stringify(nextDealsState, null, 2)}\n`, "utf8");
  console.log(`Updated deals.json with ${nextDealsState.deals.length} offers from ${source.url}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
