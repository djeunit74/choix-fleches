import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEALS_PATH = path.join(ROOT, "deals.json");
const CSV_TEMPLATE_PATH = path.join(ROOT, "google-sheet-deals-template.csv");
const TSV_TEMPLATE_PATH = path.join(ROOT, "google-sheet-deals-template.tsv");

const USER_AGENT = "Mozilla/5.0 (compatible; Assistant-Fleches-Reglages/1.0; +https://djeunit74.github.io/choix-fleches/)";
const MAX_AUTOMATIC_PRICE_DROP_RATIO = 0.5;
const MAX_AUTOMATIC_PRICE_RISE_RATIO = 1.5;

function normalizePriceValue(value) {
  const raw = String(value || "").trim().replace(/\s+/g, "");
  if (!raw) return null;
  const normalized = raw.replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function formatEur(value) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function priceFromDeal(priceLabel) {
  const match = String(priceLabel || "").match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/);
  return match ? normalizePriceValue(match[1]) : null;
}

function uniquePrices(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = value.toFixed(2);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractCandidates(html) {
  const patterns = [
    /product:price:amount["']?\s+content=["'](\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
    /itemprop=["']price["'][^>]*content=["'](\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
    /"price"\s*:\s*"(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})"/gi,
    /price["']?\s*[:=]\s*["']?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})["']/gi,
    /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/gi
  ];

  const values = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const parsed = normalizePriceValue(match[1]);
      if (parsed && parsed >= 1) values.push(parsed);
    }
  }
  return uniquePrices(values);
}

function chooseCandidate(deal, candidates) {
  if (!candidates.length) return null;
  const current = priceFromDeal(deal.price);
  const sorted = [...candidates];
  const first = sorted[0];
  const minFloor = current != null ? Math.max(5, current * 0.6) : 5;
  const maxCeiling = current != null ? current * 1.8 : Number.POSITIVE_INFINITY;
  const firstReasonable = sorted.find((candidate) => candidate >= minFloor && candidate <= maxCeiling);

  if (deal.shop.includes("heraclesarcherie.fr")) {
    if (current == null) return first;
    return sorted.reduce((best, candidate) => Math.abs(candidate - current) < Math.abs(best - current) ? candidate : best, sorted[0]);
  }
  return firstReasonable || first;
}

function priceChangeGuard(deal, selected) {
  const current = priceFromDeal(deal.price);
  if (current == null) return { accepted: true };
  const minAllowed = current * MAX_AUTOMATIC_PRICE_DROP_RATIO;
  const maxAllowed = current * MAX_AUTOMATIC_PRICE_RISE_RATIO;
  if (selected < minAllowed || selected > maxAllowed) {
    return { accepted: false, reason: `Suspicious price change ${formatEur(current)} -> ${formatEur(selected)}` };
  }
  return { accepted: true };
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT, "cache-control": "no-cache" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function toCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
  return text;
}

function dealsToCsv(deals) {
  const header = ["brand", "modelKey", "material", "bowTypes", "tier", "title", "price", "url", "shop"];
  const rows = [header.join(","), ...deals.map((deal) => [deal.brand, deal.modelKey, deal.material, deal.bowTypes.join("|"), deal.tier, deal.title, deal.price, deal.url, deal.shop].map(toCsvCell).join(","))];
  return `${rows.join("\n")}\n`;
}

function dealsToTsv(deals) {
  const header = ["brand", "modelKey", "material", "bowTypes", "tier", "title", "price", "url", "shop"];
  const rows = [header.join("\t"), ...deals.map((deal) => [deal.brand, deal.modelKey, deal.material, deal.bowTypes.join("|"), deal.tier, deal.title, deal.price, deal.url, deal.shop].join("\t"))];
  return `${rows.join("\n")}\n`;
}

async function main() {
  const dealsState = JSON.parse(await fs.readFile(DEALS_PATH, "utf8"));
  const nextDeals = [];
  const changed = [];
  const errors = [];

  for (const deal of dealsState.deals) {
    try {
      const html = await fetchHtml(deal.url);
      const candidates = extractCandidates(html);
      const selected = chooseCandidate(deal, candidates);
      if (!selected) {
        errors.push({ title: deal.title, url: deal.url, reason: "No price candidate found" });
        nextDeals.push(deal);
        continue;
      }
      const guard = priceChangeGuard(deal, selected);
      if (!guard.accepted) {
        errors.push({ title: deal.title, url: deal.url, reason: guard.reason });
        nextDeals.push(deal);
        continue;
      }
      const nextPrice = formatEur(selected);
      const currentPrice = priceFromDeal(deal.price);
      if (currentPrice != null && Math.abs(selected - currentPrice) < 0.05) {
        nextDeals.push(deal);
        continue;
      }
      if (nextPrice !== deal.price) {
        changed.push({ title: deal.title, from: deal.price, to: nextPrice, shop: deal.shop });
        nextDeals.push({ ...deal, price: nextPrice });
      } else nextDeals.push(deal);
    } catch (error) {
      errors.push({ title: deal.title, url: deal.url, reason: error.message });
      nextDeals.push(deal);
    }
  }

  const nextState = { ...dealsState, updatedAt: new Date().toISOString(), deals: nextDeals };
  await fs.writeFile(DEALS_PATH, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
  await fs.writeFile(CSV_TEMPLATE_PATH, dealsToCsv(nextDeals), "utf8");
  await fs.writeFile(TSV_TEMPLATE_PATH, dealsToTsv(nextDeals), "utf8");

  console.log(`Checked ${nextDeals.length} offers.`);
  console.log(`Updated ${changed.length} prices.`);
  changed.slice(0, 20).forEach((entry) => console.log(`- ${entry.title}: ${entry.from} -> ${entry.to}`));
  if (errors.length) {
    console.log(`Skipped ${errors.length} offers with fetch/extraction issues.`);
    errors.slice(0, 10).forEach((entry) => console.log(`- ${entry.title}: ${entry.reason}`));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
