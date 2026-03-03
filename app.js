const els = {
  form: document.getElementById("spine-form"),
  result: document.getElementById("result"),
  historyContent: document.getElementById("historyContent"),
  drawWeightLabel: document.getElementById("drawWeightLabel"),
  arrowLengthLabel: document.getElementById("arrowLengthLabel"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  preferredBrand: document.getElementById("preferredBrand"),
  budgetLevel: document.getElementById("budgetLevel"),
  compoundSpeedWrap: document.getElementById("compoundSpeedWrap"),
  compoundSpeed: document.getElementById("compoundSpeed"),
  bowType: document.getElementById("bowType"),
  drawWeight: document.getElementById("drawWeight"),
  arrowLength: document.getElementById("arrowLength"),
  pointWeight: document.getElementById("pointWeight"),
  discipline: document.getElementById("discipline")
};

const STORAGE = {
  history: "spineHistory",
};

const BRAND_REFERENCE = {
  generic: { compoundBoost: 4, lengthFactor: 3.0, pointFactor: 0.10, fieldBoost: 2, huntingBoost: 4, rawAdjust: 0 },
  easton: { compoundBoost: 4, lengthFactor: 3.2, pointFactor: 0.11, fieldBoost: 2, huntingBoost: 4, rawAdjust: -20 },
  victory: { compoundBoost: 4, lengthFactor: 2.9, pointFactor: 0.09, fieldBoost: 2, huntingBoost: 4, rawAdjust: 0 },
  carbon: { compoundBoost: 4, lengthFactor: 2.8, pointFactor: 0.09, fieldBoost: 2, huntingBoost: 4, rawAdjust: 20 },
  skylon: { compoundBoost: 4, lengthFactor: 3.0, pointFactor: 0.10, fieldBoost: 2, huntingBoost: 4, rawAdjust: -10 }
};

const SPINE_BANDS = [
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

const DEFAULT_CATALOG = {
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

const SKYLON_GRID = [
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

const SKYLON_COMPOUND_RANGES = {
  lt276: [[29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 76], [76, 82]],
  "276_300": [null, [29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 76]],
  "301_340": [null, null, [29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70]],
  "340_360": [null, null, null, [29, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65]]
};

const SKYLON_RECURVE_RANGES = [[16, 19], [20, 23], [24, 29], [30, 35], [36, 40], [41, 45], [46, 50], [51, 55], [56, 60], [61, 65], [66, 70]];

const SKYLON_GROUP_MODELS = {
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

const LIVE_DEALS = [
  { brand: "skylon", tier: "eco", title: "Skylon Radius ID4.2 lot de 12 (en stock)", price: "39,95 EUR", url: "https://www.archerie.fr/fr/4760-lot-de-12-tubes-skylon-radius-id42-en-carbone.html", shop: "archerie.fr" },
  { brand: "skylon", tier: "eco", title: "Skylon Rove ID6.2 lot de 12 (sur commande)", price: "58,95 EUR", url: "https://www.archerie.fr/fr/4762-lot-de-12-tubes-skylon-rove-id62-en-carbone.html", shop: "archerie.fr" },
  { brand: "skylon", tier: "mid", title: "Skylon Precium ID3.2 lot de 12 (pack promo)", price: "150,73 EUR", url: "https://www.archerie.fr/fr/4615-lot-de-12-tubes-skylon-precium-id-32-en-carbone.html", shop: "archerie.fr" },
  { brand: "easton", tier: "mid", title: "Easton X7 lot de 12 tubes", price: "139,90 EUR", url: "https://www.erhart-sports.com/tubes-nus/easton-x7-lot-de-12-tubes", shop: "erhart-sports.com" },
  { brand: "easton", tier: "premium", title: "Easton X10 Parallel Pro lot de 12", price: "295,00 EUR", url: "https://www.erhart-sports.com/tubes-nus/3643-easton-x10-parallel-pro-pack-de-12.html", shop: "erhart-sports.com" },
  { brand: "easton", tier: "premium", title: "Easton ACE lot de 12 tubes", price: "376,90 EUR", url: "https://www.erhart-sports.com/tubes-nus/3034-easton-ace-lot-de-12-tubes.html", shop: "erhart-sports.com" },
  { brand: "victory", tier: "premium", title: "Victory VAP Target V1 lot de 12", price: "159,00 EUR", url: "https://www.erhart-sports.com/tubes-nus/2143-victory-vap-target-v1-lot-de-12-tubes.html", shop: "erhart-sports.com" },
  { brand: "carbon", tier: "eco", title: "Carbon Express Predator II", price: "49,90 EUR", url: "https://www.archerie.fr/fr/2262-tube-predator-ii-carbon-express.html", shop: "archerie.fr" }
];

let arrowCatalog = cloneCatalog(DEFAULT_CATALOG);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function pickSpine(raw) {
  return SPINE_BANDS.find((band) => raw <= band.max)?.label ?? "N/A";
}

function toImperial(drawWeight, arrowLength) {
  return { drawWeight, arrowLength };
}

function applyUnitConstraints() {
  els.drawWeightLabel.firstChild.textContent = "Puissance reelle a l'allonge (lbs)";
  els.arrowLengthLabel.firstChild.textContent = "Longueur de fleche (pouces)";
  els.drawWeight.min = "10";
  els.drawWeight.max = "100";
  els.drawWeight.step = "0.5";
  els.arrowLength.min = "22";
  els.arrowLength.max = "34";
  els.arrowLength.step = "0.25";
}

function updateVisibility() {
  const showCompoundSpeed = els.bowType.value === "compound";
  els.compoundSpeedWrap.hidden = !showCompoundSpeed;
  els.compoundSpeedWrap.style.display = showCompoundSpeed ? "grid" : "none";
  els.compoundSpeed.disabled = !showCompoundSpeed;
}

function dynamicLoadScore({ bowType, drawWeight, arrowLength, pointWeight, discipline }, refCfg) {
  let load = drawWeight;
  if (bowType === "compound") load += refCfg.compoundBoost;
  load += (arrowLength - 28) * refCfg.lengthFactor;
  load += (pointWeight - 100) * refCfg.pointFactor;
  if (discipline === "field") load += refCfg.fieldBoost;
  if (discipline === "hunting") load += refCfg.huntingBoost;
  return clamp(load, 15, 100);
}

function evaluateConfidence({ referenceBrand, bowType, arrowLength }) {
  if (referenceBrand === "skylon") {
    if (arrowLength < 23 || arrowLength > 32) return "Faible";
    return bowType === "compound" ? "Elevee" : "Moyenne";
  }
  if (arrowLength < 24 || arrowLength > 31) return "Faible";
  return "Moyenne";
}

function getReferenceBrand(input) {
  return input.preferredBrand === "all" ? "generic" : input.preferredBrand;
}

function getBrandSpines(brand) {
  if (!arrowCatalog[brand]) return [];
  return Object.keys(arrowCatalog[brand])
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

function nearestSpine(raw, spineValues) {
  if (!spineValues.length) return { main: pickSpine(raw), softer: pickSpine(raw + 60), stiffer: pickSpine(raw - 60) };
  let bestIndex = 0;
  let bestDelta = Math.abs(spineValues[0] - raw);
  for (let i = 1; i < spineValues.length; i += 1) {
    const delta = Math.abs(spineValues[i] - raw);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = i;
    }
  }
  const main = String(spineValues[bestIndex]);
  const softer = String(spineValues[Math.min(bestIndex + 1, spineValues.length - 1)]);
  const stiffer = String(spineValues[Math.max(bestIndex - 1, 0)]);
  return { main, softer, stiffer };
}

function recommendationForBrand(input, brand) {
  const refCfg = BRAND_REFERENCE[brand] || BRAND_REFERENCE.generic;
  const load = dynamicLoadScore(input, refCfg);
  const raw = Math.round(1300 - load * 13 + refCfg.rawAdjust);
  const spineValues = getBrandSpines(brand);
  const picked = nearestSpine(raw, spineValues);
  return { brand, load, raw, ...picked };
}

function genericRecommendation(input) {
  const referenceBrand = getReferenceBrand(input);
  const picked = recommendationForBrand(input, referenceBrand);

  return {
    mode: "generic",
    referenceBrand,
    main: picked.main,
    raw: picked.raw,
    softer: picked.softer,
    stiffer: picked.stiffer,
    load: picked.load,
    confidence: evaluateConfidence({ referenceBrand, bowType: input.bowType, arrowLength: input.arrowLength }),
    warnings: []
  };
}

function findRangeRow(ranges, value) {
  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    if (!range) continue;
    if (value >= range[0] && value <= range[1]) return i;
  }
  return -1;
}

function skylonRecommendation(input) {
  const col = Math.round(input.arrowLength) - 23;
  if (col < 0 || col > 9) {
    return { ok: false, message: "Longueur hors tableau Skylon (23 a 32 pouces)." };
  }

  let row = -1;
  if (input.bowType === "compound") {
    row = findRangeRow(SKYLON_COMPOUND_RANGES[input.compoundSpeed] || [], input.drawWeight);
  } else {
    row = findRangeRow(SKYLON_RECURVE_RANGES, input.drawWeight);
    if (row > 9) {
      return { ok: false, message: "Plage recurve haute non couverte par la grille integree." };
    }
  }

  if (row < 0 || row >= SKYLON_GRID.length) {
    return { ok: false, message: "Puissance hors plages du tableau Skylon." };
  }

  const group = SKYLON_GRID[row][col] || "";
  if (!group) {
    return { ok: false, message: "Case vide dans le tableau Skylon pour cette combinaison." };
  }

  return {
    ok: true,
    mode: "skylon",
    group,
    models: SKYLON_GROUP_MODELS[group] || ["Verifier avec le revendeur Skylon."],
    warning: group.startsWith("Y"),
    confidence: group.startsWith("Y") ? "Moyenne" : "Elevee"
  };
}

function modelBudgetTier(modelName) {
  const m = String(modelName || "").toLowerCase();
  const premiumKeys = ["x10", "a/c/e", "nano-pro", "vap tko", "rip tko", "maxima red", "fmj", "bruxx", "empros"];
  const ecoKeys = ["jazz", "xx75", "vap jr", "trojan", "radius", "edge", "per/pre/par"];

  if (premiumKeys.some((k) => m.includes(k))) return "premium";
  if (ecoKeys.some((k) => m.includes(k))) return "eco";
  return "mid";
}

function filterByBudget(models, budget) {
  if (budget === "all") return models;
  return models.filter((m) => modelBudgetTier(m) === budget);
}

function suggestModels(spine, preferredBrand, budget) {
  const brands = preferredBrand === "all" ? Object.keys(arrowCatalog) : [preferredBrand];
  const chunks = [];

  for (const brand of brands) {
    const models = filterByBudget(arrowCatalog[brand]?.[spine] || [], budget);
    if (!models.length) continue;
    chunks.push(`<li><strong>${brandLabel(brand)}</strong>: ${models.join(", ")}</li>`);
  }

  return chunks.length ? chunks.join("") : "<li>Aucun modele disponible pour ce spine avec ce budget.</li>";
}

function renderDeals(preferredBrand, budget) {
  const deals = LIVE_DEALS.filter((deal) => {
    const brandOk = preferredBrand === "all" || deal.brand === preferredBrand;
    const budgetOk = budget === "all" || deal.tier === budget;
    return brandOk && budgetOk;
  });

  if (!deals.length) return "<li>Aucune offre correspondant au filtre actuel.</li>";

  return deals
    .map((deal) => `<li><a href="${deal.url}" target="_blank" rel="noopener noreferrer">${deal.title}</a> - ${deal.price} <em>(${deal.shop})</em></li>`)
    .join("");
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

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.history) || "[]");
  } catch {
    return [];
  }
}

function writeHistory(entry) {
  const next = [entry, ...readHistory()].slice(0, 5);
  localStorage.setItem(STORAGE.history, JSON.stringify(next));
  renderHistory();
}

function renderHistory() {
  const entries = readHistory();
  if (!entries.length) {
    els.historyContent.innerHTML = "<p>Aucun calcul pour le moment.</p>";
    return;
  }

  const lines = entries
    .map((e) => `<li>${e.date} - ${e.profile} - ${e.primary} (${e.bowType}, ${e.drawWeight} lbs, ${e.arrowLength}")</li>`)
    .join("");

  els.historyContent.innerHTML = `<ul class="history-list">${lines}</ul>`;
}

function validateInput(input) {
  if (!Number.isFinite(input.drawWeight) || !Number.isFinite(input.arrowLength) || !Number.isFinite(input.pointWeight)) {
    return "Valeurs numeriques invalides.";
  }
  if (input.drawWeight < 10 || input.drawWeight > 100) return "Puissance hors plage (10-100 lbs).";
  if (input.arrowLength < 22 || input.arrowLength > 34) return "Longueur hors plage (22-34 pouces).";
  if (input.pointWeight < 60 || input.pointWeight > 250) return "Poids de pointe hors plage (60-250 grains).";
  return "";
}

function renderRecommendation(input) {
  const generic = genericRecommendation(input);
  const referenceLabel = brandLabel(generic.referenceBrand || "generic");
  const effectiveBrandFilter = input.preferredBrand;
  const modelList = suggestModels(generic.main, effectiveBrandFilter, input.budgetLevel);
  const dealsList = renderDeals(effectiveBrandFilter, input.budgetLevel);
  let comparisonBlock = "";

  let title = "Recommandation";
  let lead = "Spine de depart conseille";
  let primary = generic.main;
  let method = "Methode: estimation dynamique (indicative) avec adaptation marque.";
  let confidence = generic.confidence;
  let details = `
    <p>Alternatives: plus souple <strong>${generic.softer}</strong>, plus rigide <strong>${generic.stiffer}</strong></p>
    <p>Indice de charge: ${generic.load.toFixed(1)} / 100</p>
    <p>Tableau de reference adapte: <strong>${referenceLabel}</strong></p>
  `;
  let specialBlock = "";

  if (input.preferredBrand === "all") {
    const brands = ["easton", "victory", "carbon", "skylon"];
    const lines = brands
      .map((brand) => {
        const rec = recommendationForBrand(input, brand);
        return `<li><strong>${brandLabel(brand)}</strong>: spine ${rec.main} (indice ${rec.raw})</li>`;
      })
      .join("");
    comparisonBlock = `
      <p>Comparaison tableau de reference par marque:</p>
      <ul>${lines}</ul>
    `;
  }

  if (generic.referenceBrand === "skylon") {
    const skylon = skylonRecommendation(input);
    title = "Recommandation Skylon";
    lead = "Groupe recommande";
    method = "Methode: tableau Skylon recopie (plus direct que la formule generique).";

    if (skylon.ok) {
      primary = skylon.group;
      confidence = skylon.confidence;
      const filtered = filterByBudget(skylon.models, input.budgetLevel);
      const skylonModels = filtered.length ? filtered : ["Aucun modele Skylon dans ce budget."];
      specialBlock = `
        <p><strong>Tableau Skylon:</strong> groupe ${skylon.group}</p>
        <ul>${skylonModels.map((m) => `<li>${m}</li>`).join("")}</ul>
      `;
      if (skylon.warning) {
        specialBlock += "<p>Zone Y: prudence, validation au tir et armurier recommandee.</p>";
      }
    } else {
      primary = "N/A";
      confidence = "Faible";
      specialBlock = `<p><strong>Skylon:</strong> ${skylon.message}</p>`;
    }

    details += `<p>Spine generique de comparaison: <strong>${generic.main}</strong></p>`;
  }

  els.result.innerHTML = `
    <h2>${title}</h2>
    <p>${lead}</p>
    <p class="result-value">${primary}</p>
    <p>Marque de reference: <strong>${referenceLabel}</strong></p>
    <p>${method}</p>
    <p>Niveau de confiance: <strong>${confidence}</strong></p>
    ${details}
    ${comparisonBlock}
    ${specialBlock}
    <p>Modeles conseilles:</p>
    <ul>${modelList}</ul>
    <p>Bons plans (mise a jour 3 mars 2026, verification manuelle requise):</p>
    <ul>${dealsList}</ul>
    <p>Budget: filtre indicatif base sur la gamme, pas sur prix temps reel.</p>
  `;

  writeHistory({
    date: new Date().toLocaleString("fr-FR"),
    profile: referenceLabel,
    primary,
    bowType: input.bowType,
    drawWeight: input.drawWeight.toFixed(1),
    arrowLength: input.arrowLength.toFixed(2)
  });
}

els.bowType.addEventListener("change", updateVisibility);
els.preferredBrand.addEventListener("change", updateVisibility);

els.clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE.history);
  renderHistory();
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const converted = toImperial( Number(els.drawWeight.value), Number(els.arrowLength.value));

  const input = {
    bowType: els.bowType.value,
    compoundSpeed: els.compoundSpeed.value,
    preferredBrand: els.preferredBrand.value,
    budgetLevel: els.budgetLevel.value,
    drawWeight: converted.drawWeight,
    arrowLength: converted.arrowLength,
    pointWeight: Number(els.pointWeight.value),
    discipline: els.discipline.value
  };

  const error = validateInput(input);
  if (error) {
    els.result.innerHTML = `<h2>Recommandation</h2><p>${error}</p>`;
    return;
  }

  renderRecommendation(input);
});

applyUnitConstraints();
updateVisibility();
renderHistory();
refreshBrandOptions();



