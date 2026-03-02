const form = document.getElementById("spine-form");
const result = document.getElementById("result");
const historyContent = document.getElementById("historyContent");
const unitsNode = document.getElementById("units");
const drawWeightLabel = document.getElementById("drawWeightLabel");
const arrowLengthLabel = document.getElementById("arrowLengthLabel");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const preferredBrandNode = document.getElementById("preferredBrand");
const catalogFileNode = document.getElementById("catalogFile");
const importCatalogBtn = document.getElementById("importCatalogBtn");
const resetCatalogBtn = document.getElementById("resetCatalogBtn");
const catalogStatusNode = document.getElementById("catalogStatus");
const budgetLevelNode = document.getElementById("budgetLevel");
const compoundSpeedWrap = document.getElementById("compoundSpeedWrap");
const compoundSpeedNode = document.getElementById("compoundSpeed");
const bowTypeNode = document.getElementById("bowType");
const profileNode = document.getElementById("profile");

const STORAGE_HISTORY_KEY = "spineHistory";
const STORAGE_CATALOG_KEY = "arrowCatalogCustom";

const spineBands = [
  { max: 300, label: "250" },
  { max: 340, label: "300" },
  { max: 390, label: "340" },
  { max: 440, label: "400" },
  { max: 500, label: "500" },
  { max: 570, label: "600" },
  { max: 700, label: "700" },
  { max: 860, label: "800" },
  { max: 980, label: "900" },
  { max: 1200, label: "1000" },
  { max: Infinity, label: "1200+" }
];

const profiles = {
  generic: { name: "Generique", rawAdjust: 0 },
  easton: { name: "Easton", rawAdjust: -25 },
  victory: { name: "Victory", rawAdjust: 0 },
  carbon: { name: "Carbon Express", rawAdjust: 20 },
  skylon: { name: "Skylon", rawAdjust: 0 }
};

const modelHints = {
  "250": ["Tube chasse/lourde puissance"],
  "300": ["Tubes rigides competition/chasse"],
  "340": ["Profil arc puissant"],
  "400": ["Frequent en compound/recurve lourd"],
  "500": ["Polyvalent cible"],
  "600": ["Recurve intermediaire"],
  "700": ["Allonge/puissance moderee"],
  "800": ["Puissance moyenne-basse"],
  "900": ["Recurve leger"],
  "1000": ["Debutant / faible puissance"],
  "1200+": ["Tres souple, verification imperative"]
};

const defaultCatalog = {
  easton: {
    "250": ["Axis 5mm", "FMJ 5mm"],
    "300": ["Axis 5mm", "6.5 Bowhunter"],
    "340": ["Avance", "6.5 Match Grade"],
    "400": ["Avance", "Jazz"],
    "500": ["Inspire", "Vector"],
    "600": ["Inspire", "Jazz"],
    "700": ["Inspire", "Jazz"],
    "800": ["X10 (recurve)", "A/C/E (recurve)"],
    "900": ["A/C/E (recurve)", "X10 (recurve)"],
    "1000": ["A/C/E (recurve)", "XX75 Platinum Plus"],
    "1200+": ["XX75 Platinum Plus"]
  },
  victory: {
    "250": ["VAP TKO", "RIP TKO"],
    "300": ["RIP TKO", "VAP Sport"],
    "340": ["VAP Sport", "RIP XV"],
    "400": ["VAP Sport", "VForce"],
    "500": ["VForce", "VAP V3"],
    "600": ["VAP V3", "VForce"],
    "700": ["VAP V3", "VForce"],
    "800": ["VAP Target", "VAP V3"],
    "900": ["VAP Target", "VAP V3"],
    "1000": ["VAP Target", "VAP JR"],
    "1200+": ["VAP JR"]
  },
  carbon: {
    "250": ["Maxima RED", "PileDriver"],
    "300": ["Maxima RED", "Hunter XT"],
    "340": ["Hunter XT", "Predator II"],
    "400": ["Predator II", "Trojan"],
    "500": ["Predator II", "Nano-Pro RZ"],
    "600": ["Nano-Pro RZ", "Predator II"],
    "700": ["Nano-Pro RZ", "Predator II"],
    "800": ["Nano-Pro Xtreme", "Nano-Pro RZ"],
    "900": ["Nano-Pro Xtreme", "Medallion XR"],
    "1000": ["Medallion XR", "Nano-Pro Xtreme"],
    "1200+": ["Medallion XR"]
  },
  skylon: {
    "300": ["Bruxx 300", "Empros 300", "Maverick 300"],
    "340": ["Bruxx 350-300", "Empros 350-300", "Maverick 350-300"],
    "400": ["Brixxon R400", "Edge 400-350", "Radius 400"],
    "500": ["Brixxon R550-500", "Edge 600-500", "Maverick 500"],
    "600": ["Brixxon R650-600", "Edge 700-650", "Radius 650-600"],
    "700": ["Brixxon R750-700", "Edge 700-650", "Radius 700-650"],
    "800": ["Brixxon R850-800", "Edge 800-750", "Radius 850-800"],
    "900": ["Brixxon R900-850", "Edge 900-850", "Radius 900"],
    "1000": ["Brixxon R1000-900", "Radius R1000-900"]
  }
};

const skylonGroupGrid = [
  ["Y1", "Y1", "Y2", "Y3", "Y4", "", "", "", "", ""],
  ["Y2", "Y3", "Y4", "A1", "A2", "A3", "A4", "A5", "A6", ""],
  ["", "", "A1", "A2", "A3", "A4", "A5", "A6", "A7", ""],
  ["", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"],
  ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
  ["A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11"],
  ["A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"],
  ["A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13"],
  ["A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", ""],
  ["A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "", ""]
];

const skylonCompoundRanges = {
  lt276: [[29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 76], [76, 82]],
  "276_300": [null, [29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 76]],
  "301_340": [null, null, [29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70]],
  "340_360": [null, null, null, [29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65]]
};

const skylonRecurveRanges = [[16, 19], [20, 23], [24, 29], [30, 35], [36, 40], [41, 45], [46, 50], [51, 55], [56, 60], [61, 65], [66, 70]];

const skylonGroupModels = {
  A1: ["Brixxon R1000/R900", "Radius R900"],
  A2: ["Brixxon R900-850", "Edge 800", "Radius 850-800"],
  A3: ["Brixxon R850-800", "Edge 800-750", "Radius 750-700"],
  A4: ["Brixxon R750-700", "Edge 700-650", "Radius 700-650"],
  A5: ["Brixxon R700-650", "Edge 700-650", "Radius 650-600"],
  A6: ["Brixxon R600-550", "Edge 700-600", "Radius 600-550"],
  A7: ["Brixxon R550-500", "Edge 600-500", "Maverick 500"],
  A8: ["Brixxon R500-450", "Edge 500-400", "Maverick 500-400"],
  A9: ["Brixxon R450-400", "Edge 400-350", "Maverick 400"],
  A10: ["Brixxon R400", "Edge 400-350", "Radius 400"],
  A11: ["Bruxx 350-300", "Empros 350-300", "Maverick 350-300"],
  A12: ["Bruxx 300", "Edge 350-300", "Empros 330"],
  A13: ["Bruxx 300", "Empros 300", "Maverick 300"]
};

const liveDeals = [
  {
    brand: "easton",
    tier: "mid",
    title: "Pack Easton Avance (12 tubes) -5%",
    price: "299,96 EUR",
    url: "https://www.archerie.fr/fr/10691-promo-tubes-easton-avance.html",
    shop: "archerie.fr"
  },
  {
    brand: "victory",
    tier: "premium",
    title: "Victory VAP Target V1 lot de 12",
    price: "159,00 EUR (au lieu de 175,80 EUR)",
    url: "https://www.erhart-sports.com/tubes-nus/2143-443507-victory-vap-target-v1-lot-de-12-tubes.html",
    shop: "erhart-sports.com"
  },
  {
    brand: "victory",
    tier: "mid",
    title: "Victory VAP Gamer V3 (unite)",
    price: "12,50 EUR",
    url: "https://www.erhart-sports.com/tubes-nus/victory-vap-gamer-v3-tube-carbone",
    shop: "erhart-sports.com"
  },
  {
    brand: "skylon",
    tier: "eco",
    title: "Skylon Radius ID4.2 lot de 12 tubes",
    price: "39,95 EUR",
    url: "https://www.archerie.fr/fr/4760-lot-de-12-tubes-skylon-radius-id42-en-carbone.html",
    shop: "archerie.fr"
  },
  {
    brand: "skylon",
    tier: "mid",
    title: "Skylon Carbon Phoric ID6.2",
    price: "82,50 EUR",
    url: "https://www.europearchery.fr/skylon-carbon-arrow-3k-maverick-id6-2-12-pack-1",
    shop: "europearchery.fr"
  },
  {
    brand: "carbon",
    tier: "eco",
    title: "Carbon Express Predator II (pack 12 -5%)",
    price: "5,70 EUR / tube en pack",
    url: "https://www.disport.it/en/product/aste53b505/carbon-express-predator-ii-shaft",
    shop: "disport.it"
  }
];

let arrowCatalog = loadCatalog();

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function pickSpine(value) {
  return spineBands.find((b) => value <= b.max)?.label ?? "N/A";
}

function estimateSpine({ bowType, drawWeight, arrowLength, pointWeight, discipline, profile }) {
  let dynamicLoad = drawWeight;

  if (bowType === "compound") dynamicLoad += 4;

  dynamicLoad += (arrowLength - 28) * 3;
  dynamicLoad += (pointWeight - 100) / 10;

  if (discipline === "field") dynamicLoad += 2;
  if (discipline === "hunting") dynamicLoad += 4;

  dynamicLoad = clamp(dynamicLoad, 15, 100);

  const profileAdjust = profiles[profile]?.rawAdjust ?? 0;
  const rawSpine = Math.round(1300 - dynamicLoad * 13 + profileAdjust);
  const main = pickSpine(rawSpine);

  return {
    rawSpine,
    main,
    softer: pickSpine(rawSpine + 60),
    stiffer: pickSpine(rawSpine - 60),
    dynamicLoad
  };
}

function adviceText(dynamicLoad) {
  if (dynamicLoad < 30) return ["Reglage leger", "ok"];
  if (dynamicLoad < 55) return ["Zone standard", "ok"];
  if (dynamicLoad < 70) return ["Zone exigeante", "warning"];
  return ["Charge elevee: validation armurier conseillee", "warning"];
}

function convertToImperial(units, drawWeight, arrowLength) {
  if (units === "metric") {
    return { drawWeight: drawWeight * 2.20462, arrowLength: arrowLength / 2.54 };
  }
  return { drawWeight, arrowLength };
}

function updateUnitConstraints() {
  const metric = unitsNode.value === "metric";
  const draw = document.getElementById("drawWeight");
  const length = document.getElementById("arrowLength");

  if (metric) {
    drawWeightLabel.firstChild.textContent = "Puissance reelle a l'allonge (kg)";
    arrowLengthLabel.firstChild.textContent = "Longueur de fleche (cm)";
    draw.min = "5";
    draw.max = "46";
    draw.step = "0.2";
    if (Number(draw.value) > 100 || Number(draw.value) < 10) draw.value = "16";
    length.min = "56";
    length.max = "86";
    length.step = "0.5";
    if (Number(length.value) > 34 || Number(length.value) < 22) length.value = "71";
  } else {
    drawWeightLabel.firstChild.textContent = "Puissance reelle a l'allonge (lbs)";
    arrowLengthLabel.firstChild.textContent = "Longueur de fleche (pouces)";
    draw.min = "10";
    draw.max = "100";
    draw.step = "0.5";
    if (Number(draw.value) > 46 || Number(draw.value) < 5) draw.value = "36";
    length.min = "22";
    length.max = "34";
    length.step = "0.25";
    if (Number(length.value) > 86 || Number(length.value) < 56) length.value = "28";
  }
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeHistory(entry) {
  const limited = [entry, ...readHistory()].slice(0, 5);
  localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(limited));
  renderHistory();
}

function renderHistory() {
  const entries = readHistory();
  if (!entries.length) {
    historyContent.innerHTML = "<p>Aucun calcul pour le moment.</p>";
    return;
  }

  const lines = entries
    .map((e) => `<li>${e.date} - ${e.profile} - spine ${e.main} (${e.bowType}, ${e.drawWeight} lbs, ${e.arrowLength}\")</li>`)
    .join("");

  historyContent.innerHTML = `<ul class="history-list">${lines}</ul>`;
}

function normalizeBrandKey(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "custom";
  if (value.includes("easton")) return "easton";
  if (value.includes("victory")) return "victory";
  if (value.includes("carbon")) return "carbon";
  return value.replace(/\s+/g, "_");
}

function brandLabel(key) {
  if (key === "easton") return "Easton";
  if (key === "victory") return "Victory";
  if (key === "carbon") return "Carbon Express";
  if (key === "skylon") return "Skylon";
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

function cloneCatalog(catalog) {
  return JSON.parse(JSON.stringify(catalog));
}

function mergeCatalogWithDefault(catalog) {
  const merged = cloneCatalog(defaultCatalog);

  for (const [brand, spineMap] of Object.entries(catalog || {})) {
    if (!merged[brand]) merged[brand] = {};
    if (!spineMap || typeof spineMap !== "object") continue;

    for (const [spine, models] of Object.entries(spineMap)) {
      const list = Array.isArray(models) ? models : [models];
      const cleaned = list.map((m) => String(m).trim()).filter(Boolean);
      if (!cleaned.length) continue;
      merged[brand][spine] = cleaned;
    }
  }

  return merged;
}

function loadCatalog() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CATALOG_KEY) || "null");
    if (!saved || typeof saved !== "object") return cloneCatalog(defaultCatalog);
    return mergeCatalogWithDefault(saved);
  } catch {
    return cloneCatalog(defaultCatalog);
  }
}

function saveCatalog(catalog) {
  localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
}

function parseCsvLine(line, delimiter) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  out.push(current.trim());
  return out;
}

function parseCatalogCsv(text) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (!rows.length) throw new Error("CSV vide");

  const delimiter = rows[0].includes(";") ? ";" : ",";
  const first = parseCsvLine(rows[0], delimiter).map((v) => v.toLowerCase());
  const hasHeader = first.includes("brand") || first.includes("marque");
  const start = hasHeader ? 1 : 0;

  const catalog = {};

  for (let i = start; i < rows.length; i += 1) {
    const cols = parseCsvLine(rows[i], delimiter);
    if (cols.length < 3) continue;

    const brand = normalizeBrandKey(cols[0]);
    const spine = String(cols[1]).trim();
    const models = cols.slice(2).join(" ").split("|").map((m) => m.trim()).filter(Boolean);

    if (!catalog[brand]) catalog[brand] = {};
    if (!catalog[brand][spine]) catalog[brand][spine] = [];

    for (const model of models) {
      if (!catalog[brand][spine].includes(model)) {
        catalog[brand][spine].push(model);
      }
    }
  }

  if (!Object.keys(catalog).length) {
    throw new Error("CSV invalide: aucune ligne exploitable");
  }

  return catalog;
}

function normalizeCatalogJson(input) {
  if (Array.isArray(input)) {
    const catalog = {};
    for (const row of input) {
      const brand = normalizeBrandKey(row.brand || row.marque);
      const spine = String(row.spine || "").trim();
      const modelValue = row.model || row.modele || row.models;
      const models = Array.isArray(modelValue)
        ? modelValue.map((m) => String(m).trim()).filter(Boolean)
        : String(modelValue || "").split("|").map((m) => m.trim()).filter(Boolean);

      if (!spine || !models.length) continue;
      if (!catalog[brand]) catalog[brand] = {};
      if (!catalog[brand][spine]) catalog[brand][spine] = [];

      for (const model of models) {
        if (!catalog[brand][spine].includes(model)) catalog[brand][spine].push(model);
      }
    }

    if (!Object.keys(catalog).length) throw new Error("JSON invalide");
    return catalog;
  }

  if (input && typeof input === "object") {
    const catalog = {};
    for (const [brandRaw, spineMap] of Object.entries(input)) {
      const brand = normalizeBrandKey(brandRaw);
      if (!spineMap || typeof spineMap !== "object") continue;
      catalog[brand] = {};
      for (const [spine, models] of Object.entries(spineMap)) {
        const list = Array.isArray(models) ? models : [models];
        const cleaned = list.map((m) => String(m).trim()).filter(Boolean);
        if (cleaned.length) catalog[brand][spine] = cleaned;
      }
    }

    if (!Object.keys(catalog).length) throw new Error("JSON invalide");
    return catalog;
  }

  throw new Error("JSON invalide");
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture fichier impossible"));
    reader.readAsText(file);
  });
}

function refreshBrandOptions() {
  const current = preferredBrandNode.value || "all";
  const brands = Object.keys(arrowCatalog).sort((a, b) => brandLabel(a).localeCompare(brandLabel(b), "fr"));

  preferredBrandNode.innerHTML = '<option value="all">Toutes</option>';
  for (const brand of brands) {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brandLabel(brand);
    preferredBrandNode.appendChild(option);
  }

  if (brands.includes(current) || current === "all") {
    preferredBrandNode.value = current;
  }
}

function setCatalogStatus(text) {
  catalogStatusNode.textContent = text;
}

function modelBudgetTier(modelName) {
  const m = String(modelName || "").toLowerCase();
  const premiumKeys = ["x10", "a/c/e", "nano-pro", "vap tko", "rip tko", "maxima red", "fmj", "bruxx", "empros"];
  const ecoKeys = ["jazz", "xx75", "vap jr", "trojan", "radius", "edge", "per/pre/par"];

  if (premiumKeys.some((k) => m.includes(k))) return "premium";
  if (ecoKeys.some((k) => m.includes(k))) return "eco";
  return "mid";
}

function filterModelsByBudget(models, budgetLevel) {
  if (budgetLevel === "all") return models;
  return models.filter((m) => modelBudgetTier(m) === budgetLevel);
}

function suggestModels(spine, preferredBrand, budgetLevel) {
  const brands = preferredBrand === "all" ? Object.keys(arrowCatalog) : [preferredBrand];
  const lines = [];

  for (const brand of brands) {
    const models = filterModelsByBudget(arrowCatalog[brand]?.[spine] || [], budgetLevel);
    if (!models.length) continue;
    lines.push(`<li><strong>${brandLabel(brand)}</strong>: ${models.join(", ")}</li>`);
  }

  if (!lines.length) {
    return "<li>Aucun modele disponible pour ce spine avec ce budget.</li>";
  }

  return lines.join("");
}

function renderDeals(preferredBrand, budgetLevel) {
  const deals = liveDeals.filter((d) => {
    const brandOk = preferredBrand === "all" || d.brand === preferredBrand;
    const budgetOk = budgetLevel === "all" || d.tier === budgetLevel;
    return brandOk && budgetOk;
  });

  if (!deals.length) {
    return "<li>Aucune offre correspondant au filtre actuel.</li>";
  }

  return deals
    .map(
      (d) =>
        `<li><a href="${d.url}" target="_blank" rel="noopener noreferrer">${d.title}</a> - ${d.price} <em>(${d.shop})</em></li>`
    )
    .join("");
}

function findRangeRow(ranges, value) {
  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    if (!range) continue;
    if (value >= range[0] && value <= range[1]) return i;
  }
  return -1;
}

function estimateSkylonGroup({ bowType, drawWeight, arrowLength, compoundSpeed }) {
  const col = Math.round(arrowLength) - 23;
  if (col < 0 || col > 9) {
    return { ok: false, message: "Longueur hors tableau Skylon (23 a 32 pouces)." };
  }

  let row = -1;
  if (bowType === "compound") {
    row = findRangeRow(skylonCompoundRanges[compoundSpeed] || [], drawWeight);
  } else {
    row = findRangeRow(skylonRecurveRanges, drawWeight);
    if (row > 9) row = 9;
  }

  if (row < 0 || row >= skylonGroupGrid.length) {
    return { ok: false, message: "Puissance hors plages du tableau Skylon." };
  }

  const group = skylonGroupGrid[row][col] || "";
  if (!group) {
    return { ok: false, message: "Case vide dans le tableau Skylon pour cette combinaison." };
  }

  return {
    ok: true,
    group,
    models: skylonGroupModels[group] || ["Verifier avec le revendeur Skylon."],
    warning: group.startsWith("Y")
  };
}

function updateCompoundSpeedVisibility() {
  const show = bowTypeNode.value === "compound" || profileNode.value === "skylon";
  compoundSpeedWrap.style.display = show ? "grid" : "none";
}

unitsNode.addEventListener("change", updateUnitConstraints);
bowTypeNode.addEventListener("change", updateCompoundSpeedVisibility);
profileNode.addEventListener("change", updateCompoundSpeedVisibility);
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_HISTORY_KEY);
  renderHistory();
});

importCatalogBtn.addEventListener("click", async () => {
  const file = catalogFileNode.files?.[0];
  if (!file) {
    arrowCatalog = cloneCatalog(defaultCatalog);
    saveCatalog(arrowCatalog);
    refreshBrandOptions();
    setCatalogStatus("Catalogue recommande charge (sans fichier).");
    return;
  }

  try {
    const text = await readFileAsText(file);
    let catalog;

    if (file.name.toLowerCase().endsWith(".json")) {
      catalog = normalizeCatalogJson(JSON.parse(text));
    } else {
      catalog = parseCatalogCsv(text);
    }

    arrowCatalog = catalog;
    saveCatalog(catalog);
    refreshBrandOptions();
    setCatalogStatus(`Import OK (${Object.keys(catalog).length} marque(s)).`);
  } catch (error) {
    setCatalogStatus(`Import echoue: ${error.message}`);
  }
});

resetCatalogBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_CATALOG_KEY);
  arrowCatalog = cloneCatalog(defaultCatalog);
  refreshBrandOptions();
  setCatalogStatus("Base locale restauree.");
});

updateUnitConstraints();
updateCompoundSpeedVisibility();
renderHistory();
refreshBrandOptions();
if (localStorage.getItem(STORAGE_CATALOG_KEY)) {
  setCatalogStatus("Catalogue personnalise charge.");
} else {
  saveCatalog(arrowCatalog);
  setCatalogStatus("Catalogue recommande deja actif.");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const units = document.getElementById("units").value;
  const drawInput = Number(document.getElementById("drawWeight").value);
  const lengthInput = Number(document.getElementById("arrowLength").value);
  const converted = convertToImperial(units, drawInput, lengthInput);

  const data = {
    bowType: document.getElementById("bowType").value,
    profile: document.getElementById("profile").value,
    compoundSpeed: document.getElementById("compoundSpeed").value,
    preferredBrand: document.getElementById("preferredBrand").value,
    budgetLevel: budgetLevelNode.value,
    drawWeight: converted.drawWeight,
    arrowLength: converted.arrowLength,
    pointWeight: Number(document.getElementById("pointWeight").value),
    discipline: document.getElementById("discipline").value
  };

  const isValid =
    Number.isFinite(data.drawWeight) &&
    Number.isFinite(data.arrowLength) &&
    Number.isFinite(data.pointWeight) &&
    data.drawWeight >= 10 && data.drawWeight <= 100 &&
    data.arrowLength >= 22 && data.arrowLength <= 34 &&
    data.pointWeight >= 60 && data.pointWeight <= 250;

  if (!isValid) {
    result.innerHTML = "<h2>Recommandation</h2><p>Veuillez remplir tous les champs correctement.</p>";
    return;
  }

  const out = estimateSpine(data);
  const [advice, level] = adviceText(out.dynamicLoad);
  const profileLabel = profiles[data.profile]?.name ?? "Generique";
  const hints = modelHints[out.main] || ["Verifier un tube equivalent dans le tableau fabricant"];
  let modelList = suggestModels(out.main, data.preferredBrand, data.budgetLevel);
  const dealsList = renderDeals(data.preferredBrand, data.budgetLevel);
  let extraBlock = "";

  if (data.profile === "skylon") {
    const skylon = estimateSkylonGroup(data);
    if (skylon.ok) {
      const filteredSkylonModels = filterModelsByBudget(skylon.models, data.budgetLevel);
      const skylonModelsToShow = filteredSkylonModels.length
        ? filteredSkylonModels
        : ["Aucun modele Skylon dans cette tranche de budget."];
      extraBlock = `
        <p><strong>Tableau Skylon:</strong> groupe ${skylon.group}</p>
        <ul>${skylonModelsToShow.map((m) => `<li>${m}</li>`).join("")}</ul>
      `;
      if (skylon.warning) {
        extraBlock += "<p>Zone Y du tableau: validation armurier recommandee.</p>";
      }
      modelList = `<li><strong>Skylon</strong>: groupe ${skylon.group}</li>`;
    } else {
      extraBlock = `<p><strong>Tableau Skylon:</strong> ${skylon.message}</p>`;
    }
  }

  result.innerHTML = `
    <h2>Recommandation</h2>
    <p>Spine de depart conseille</p>
    <p class="result-value">${out.main}</p>
    <p>Alternatives proches: plus souple <strong>${out.softer}</strong>, plus rigide <strong>${out.stiffer}</strong></p>
    <p>Indice interne calcule: ${out.rawSpine}</p>
    <p>Profil utilise: <strong>${profileLabel}</strong></p>
    <ul>${hints.map((h) => `<li>${h}</li>`).join("")}</ul>
    ${extraBlock}
    <p>Modeles conseilles (tableau charge):</p>
    <ul>${modelList}</ul>
    <p>Offres interessantes du moment (verifiees le 2 mars 2026):</p>
    <ul>${dealsList}</ul>
    <span class="badge ${level === "warning" ? "warning" : ""}">${advice}</span>
  `;

  writeHistory({
    date: new Date().toLocaleString("fr-FR"),
    profile: profileLabel,
    main: out.main,
    bowType: data.bowType,
    drawWeight: data.drawWeight.toFixed(1),
    arrowLength: data.arrowLength.toFixed(2)
  });
});
