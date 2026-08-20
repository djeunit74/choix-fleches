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

function normalizePageText(html) {
  return String(html || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function looksLikeMissingProduct(html) {
  const text = normalizePageText(html);
  return [
    /page que vous cherchez n['’]?a pas ete trouvee/,
    /page introuvable/,
    /produit introuvable/,
    /product not found/,
    /the page you are looking for (?:was not found|does not exist)/,
    /erreur 404/,
    /404 not found/
  ].some((pattern) => pattern.test(text));
}

async function fetchProductPage(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": USER_AGENT, "cache-control": "no-cache" }
  });
  const html = await response.text();
  return { response, html };
}

function withVerification(deal, availability, checkedAt, extra = {}) {
  return {
    ...deal,
    availability,
    lastCheckedAt: checkedAt,
    ...extra
  };
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
  const unavailable = [];
  const errors = [];

  for (const deal of dealsState.deals) {
    const checkedAt = new Date().toISOString();
    try {
      const { response, html } = await fetchProductPage(deal.url);
      if (response.status === 404 || response.status === 410 || looksLikeMissingProduct(html)) {
        unavailable.push({ title: deal.title, url: deal.url, reason: response.status === 404 || response.status === 410 ? `HTTP ${response.status}` : "Soft 404 / product missing page" });
        nextDeals.push(withVerification(deal, "unavailable", checkedAt, { checkReason: response.status === 404 || response.status === 410 ? `http-${response.status}` : "soft-404" }));
        continue;
      }
      if (!response.ok) {
        errors.push({ title: deal.title, url: deal.url, reason: `${response.status} ${response.statusText}` });
        nextDeals.push(withVerification(deal, "unknown", checkedAt, { checkReason: `http-${response.status}` }));
        continue;
      }

      const candidates = extractCandidates(html);
      const selected = chooseCandidate(deal, candidates);
      const verifiedDeal = withVerification(deal, "available", checkedAt, { checkReason: "ok" });
      if (!selected) {
        errors.push({ title: deal.title, url: deal.url, reason: "No price candidate found" });
        nextDeals.push(verifiedDeal);
        continue;
      }
      const guard = priceChangeGuard(deal, selected);
      if (!guard.accepted) {
        errors.push({ title: deal.title, url: deal.url, reason: guard.reason });
        nextDeals.push(verifiedDeal);
        continue;
      }
      const nextPrice = formatEur(selected);
      const currentPrice = priceFromDeal(deal.price);
      if (currentPrice != null && Math.abs(selected - currentPrice) < 0.05) {
        nextDeals.push(verifiedDeal);
        continue;
      }
      if (nextPrice !== deal.price) {
        changed.push({ title: deal.title, from: deal.price, to: nextPrice, shop: deal.shop });
        nextDeals.push({ ...verifiedDeal, price: nextPrice });
      } else {
        nextDeals.push(verifiedDeal);
      }
    } catch (error) {
      errors.push({ title: deal.title, url: deal.url, reason: error.message });
      nextDeals.push(withVerification(deal, "unknown", checkedAt, { checkReason: "fetch-error" }));
    }
  }

  const nextState = { ...dealsState, updatedAt: new Date().toISOString(), deals: nextDeals };
  await fs.writeFile(DEALS_PATH, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
  await fs.writeFile(CSV_TEMPLATE_PATH, dealsToCsv(nextDeals), "utf8");
  await fs.writeFile(TSV_TEMPLATE_PATH, dealsToTsv(nextDeals), "utf8");

  console.log(`Checked ${nextDeals.length} offers.`);
  console.log(`Updated ${changed.length} prices.`);
  console.log(`Marked ${unavailable.length} unavailable offers.`);
  changed.slice(0, 20).forEach((entry) => console.log(`- ${entry.title}: ${entry.from} -> ${entry.to}`));
  unavailable.slice(0, 20).forEach((entry) => console.log(`- unavailable ${entry.title}: ${entry.reason}`));
  if (errors.length) {
    console.log(`Kept ${errors.length} offers with unknown/check issues.`);
    errors.slice(0, 10).forEach((entry) => console.log(`- ${entry.title}: ${entry.reason}`));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
