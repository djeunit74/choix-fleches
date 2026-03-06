const els = {
  form: document.getElementById("spine-form"),
  result: document.getElementById("result"),
  historyContent: document.getElementById("historyContent"),
  drawWeightLabel: document.getElementById("drawWeightLabel"),
  arrowLengthLabel: document.getElementById("arrowLengthLabel"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  bowTypeWrap: document.getElementById("bowTypeWrap"),
  preferredBrand: document.getElementById("preferredBrand"),
  shootingProfile: document.getElementById("shootingProfile"),
  shootingEnvironmentWrap: document.getElementById("shootingEnvironmentWrap"),
  shootingEnvironment: document.getElementById("shootingEnvironment"),
  shaftMaterial: document.getElementById("shaftMaterial"),
  budgetLevel: document.getElementById("budgetLevel"),
  compoundSpeedWrap: document.getElementById("compoundSpeedWrap"),
  compoundSpeed: document.getElementById("compoundSpeed"),
  bowType: document.getElementById("bowType"),
  drawWeight: document.getElementById("drawWeight"),
  arrowLength: document.getElementById("arrowLength"),
  pointWeight: document.getElementById("pointWeight"),
  disciplineWrap: document.getElementById("disciplineWrap"),
  discipline: document.getElementById("discipline"),
  tuningFeedbackWrap: document.getElementById("tuningFeedbackWrap"),
  tuningFeedback: document.getElementById("tuningFeedback")
};

const STORAGE = { history: "spineHistory" };
const VALID_COMPOUND_SPEEDS = ["lt276", "276_300", "301_340", "340_360"];
const BRAND_ORDER = ["easton", "victory", "carbon", "skylon"];
const BOW_LIMITS = {
  recurve: { minDrawWeight: 12, maxDrawWeight: 70, minArrowLength: 22, maxArrowLength: 34 },
  compound: { minDrawWeight: 20, maxDrawWeight: 100, minArrowLength: 22, maxArrowLength: 34 }
};

const SHOOTING_PROFILES = {
  recurve_outdoor: { bowType: "recurve", shootingEnvironment: "outdoor", shaftMaterial: "carbon", discipline: "target" },
  recurve_indoor: { bowType: "recurve", shootingEnvironment: "indoor", shaftMaterial: "alu", discipline: "target" },
  compound_target: { bowType: "compound", shootingEnvironment: "outdoor", shaftMaterial: "carbon", discipline: "target" },
  field_3d: { bowType: "recurve", shootingEnvironment: "outdoor", shaftMaterial: "carbon", discipline: "field" }
};

const BRAND_REFERENCE = {
  easton: { compoundBoost: 4, lengthFactor: 3.2, pointFactor: 0.11, fieldBoost: 2, huntingBoost: 4, indoorBoost: -1, outdoorBoost: 1, rawAdjust: -20 },
  victory: { compoundBoost: 4, lengthFactor: 2.9, pointFactor: 0.09, fieldBoost: 2, huntingBoost: 4, indoorBoost: 0, outdoorBoost: 1, rawAdjust: 0 },
  carbon: { compoundBoost: 4, lengthFactor: 2.8, pointFactor: 0.09, fieldBoost: 2, huntingBoost: 5, indoorBoost: 0, outdoorBoost: 1, rawAdjust: 20 },
  skylon: { compoundBoost: 4, lengthFactor: 3.0, pointFactor: 0.10, fieldBoost: 2, huntingBoost: 4, indoorBoost: 0, outdoorBoost: 1, rawAdjust: -10 }
};

const DEFAULT_CATALOG = {
  easton: { "300": ["Axis 5mm"], "340": ["Avance"], "400": ["Avance", "Jazz"], "500": ["Inspire", "Vector"], "600": ["Inspire", "Jazz"], "700": ["Inspire", "Jazz"], "800": ["X10 (recurve)", "A/C/E (recurve)"], "900": ["A/C/E (recurve)", "X10 (recurve)"], "1000": ["A/C/E (recurve)", "XX75 Platinum Plus"] },
  victory: { "300": ["RIP TKO", "VAP Sport"], "340": ["VAP Sport", "RIP XV"], "400": ["VAP Sport", "VForce"], "500": ["VForce", "VAP V3"], "600": ["VAP V3", "VForce"], "700": ["VAP V3", "VForce"], "800": ["VAP Target", "VAP V3"], "900": ["VAP Target", "VAP V3"], "1000": ["VAP Target", "VAP JR"] },
  carbon: { "300": ["Maxima RED", "Hunter XT"], "340": ["Hunter XT", "Predator II"], "400": ["Predator II", "Trojan"], "500": ["Predator II", "Nano-Pro RZ"], "600": ["Nano-Pro RZ", "Predator II"], "700": ["Nano-Pro RZ", "Predator II"], "800": ["Nano-Pro Xtreme", "Nano-Pro RZ"], "900": ["Nano-Pro Xtreme", "Medallion XR"], "1000": ["Medallion XR", "Nano-Pro Xtreme"] },
  skylon: { "300": ["Bruxx 300", "Empros 300", "Maverick 300"], "340": ["Bruxx 350-300", "Empros 350-300", "Maverick 350-300"], "400": ["Brixxon R400", "Edge 400-350", "Radius 400"], "500": ["Brixxon R550-500", "Edge 600-500", "Maverick 500"], "600": ["Brixxon R650-600", "Edge 700-650", "Radius 650-600"], "700": ["Brixxon R750-700", "Edge 700-650", "Radius 700-650"], "800": ["Brixxon R850-800", "Edge 800-750", "Radius 850-800"], "900": ["Brixxon R900-850", "Edge 900-850", "Radius 900"], "1000": ["Brixxon R1000-900", "Radius R1000-900"] }
};

const MODEL_METADATA = {
  "avance": { material: "carbon", diameters: ["thin"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Tube fin exterieur." },
  "jazz": { material: "alu", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 120], note: "Reference salle recurve." },
  "inspire": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 110], note: "Option club accessible." },
  "vector": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["polyvalent", "performance"], pointRange: [90, 120], note: "Plus cible exterieure." },
  "x10": { material: "hybrid", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["competition"], pointRange: [100, 120], note: "Reference competition exterieure." },
  "a/c/e": { material: "hybrid", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Classique exterieur recurve." },
  "xx75 platinum plus": { material: "alu", diameters: ["large"], environments: ["indoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [100, 150], note: "Tube salle classique." },
  "vap sport": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [90, 120], note: "Fine et accessible." },
  "vforce": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Polyvalent club/exterieur." },
  "vap v3": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["performance"], pointRange: [90, 120], note: "Profil vent." },
  "vap target": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["performance", "competition"], pointRange: [100, 120], note: "Cible exterieure." },
  "vap jr": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club"], pointRange: [70, 100], note: "Petites puissances." },
  "predator ii": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Budget polyvalent." },
  "nano-pro rz": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Tube fin exterieur." },
  "nano-pro xtreme": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["competition"], pointRange: [100, 120], note: "Competition exterieure." },
  "medallion xr": { material: "carbon", diameters: ["large"], environments: ["indoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["performance", "competition"], pointRange: [100, 150], note: "Gros diametre salle." },
  "radius 400": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [100, 120], note: "Tube club coherent." },
  "radius 650-600": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Tube club coherent." },
  "radius 700-650": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Tube club coherent." },
  "radius 850-800": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [80, 110], note: "Tube club coherent." },
  "edge 400-350": { material: "carbon", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [100, 150], note: "Profil salle." },
  "edge 600-500": { material: "carbon", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [100, 150], note: "Profil salle." },
  "edge 700-650": { material: "carbon", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [100, 150], note: "Profil salle." },
  "maverick 300": { material: "carbon", diameters: ["standard"], environments: ["mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Option club." },
  "maverick 350-300": { material: "carbon", diameters: ["standard"], environments: ["mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Option club." },
  "bruxx 300": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["competition"], pointRange: [100, 120], note: "Competition recurve." },
  "empros 300": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["competition"], pointRange: [100, 120], note: "Competition recurve." }
};

const SKYLON_GRID = [["Y1","Y1","Y2","Y3","Y4","","","","",""],["Y2","Y3","Y4","A1","A2","A3","A4","A5","A6",""],["","","A1","A2","A3","A4","A5","A6","A7",""],["","A1","A2","A3","A4","A5","A6","A7","A8","A9"],["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10"],["A2","A3","A4","A5","A6","A7","A8","A9","A10","A11"],["A3","A4","A5","A6","A7","A8","A9","A10","A11","A12"],["A4","A5","A6","A7","A8","A9","A10","A11","A12","A13"],["A5","A6","A7","A8","A9","A10","A11","A12","A13",""],["A6","A7","A8","A9","A10","A11","A12","A13","",""]];
const SKYLON_COMPOUND_RANGES = { lt276: [[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,76],[76,82]], "276_300": [null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,76]], "301_340": [null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70]], "340_360": [null,null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65]] };
const SKYLON_RECURVE_RANGES = [[16,19],[20,23],[24,29],[30,35],[36,40],[41,45],[46,50],[51,55],[56,60],[61,65],[66,70]];
const SKYLON_GROUP_MODELS = { A1: ["Brixxon R1000/R900","Radius R900"], A2: ["Brixxon R900-850","Edge 800","Radius 850-800"], A3: ["Brixxon R850-800","Edge 800-750","Radius 750-700"], A4: ["Brixxon R750-700","Edge 700-650","Radius 700-650"], A5: ["Brixxon R700-650","Edge 700-650","Radius 650-600"], A6: ["Brixxon R600-550","Edge 700-600","Radius 600-550"], A7: ["Brixxon R550-500","Edge 600-500","Maverick 500"], A8: ["Brixxon R500-450","Edge 500-400","Maverick 500-400"], A9: ["Brixxon R450-400","Edge 400-350","Maverick 400"], A10: ["Brixxon R400","Edge 400-350","Radius 400"], A11: ["Bruxx 350-300","Empros 350-300","Maverick 350-300"], A12: ["Bruxx 300","Edge 350-300","Empros 330"], A13: ["Bruxx 300","Empros 300","Maverick 300"] };

const LIVE_DEALS = [
  { brand: "skylon", material: "carbon", bowTypes: ["recurve", "compound"], tier: "eco", title: "Skylon Radius ID4.2 lot de 12 (en stock)", price: "39,95 EUR", url: "https://www.archerie.fr/fr/4760-lot-de-12-tubes-skylon-radius-id42-en-carbone.html", shop: "archerie.fr" },
  { brand: "skylon", material: "carbon", bowTypes: ["recurve", "compound"], tier: "mid", title: "Skylon Precium ID3.2 lot de 12 (pack promo)", price: "150,73 EUR", url: "https://www.archerie.fr/fr/4615-lot-de-12-tubes-skylon-precium-id-32-en-carbone.html", shop: "archerie.fr" },
  { brand: "easton", material: "alu", bowTypes: ["recurve", "compound"], tier: "mid", title: "Easton X7 lot de 12 tubes", price: "139,90 EUR", url: "https://www.erhart-sports.com/tubes-nus/easton-x7-lot-de-12-tubes", shop: "erhart-sports.com" },
  { brand: "easton", material: "hybrid", bowTypes: ["recurve"], tier: "premium", title: "Easton ACE lot de 12 tubes", price: "376,90 EUR", url: "https://www.erhart-sports.com/tubes-nus/3034-easton-ace-lot-de-12-tubes.html", shop: "erhart-sports.com" },
  { brand: "victory", material: "carbon", bowTypes: ["recurve", "compound"], tier: "premium", title: "Victory VAP Target V1 lot de 12", price: "159,00 EUR", url: "https://www.erhart-sports.com/tubes-nus/2143-victory-vap-target-v1-lot-de-12-tubes.html", shop: "erhart-sports.com" },
  { brand: "carbon", material: "carbon", bowTypes: ["recurve", "compound"], tier: "eco", title: "Carbon Express Predator II", price: "49,90 EUR", url: "https://www.archerie.fr/fr/2262-tube-predator-ii-carbon-express.html", shop: "archerie.fr" }
];

let arrowCatalog = cloneCatalog(DEFAULT_CATALOG);

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function toImperial(drawWeight, arrowLength) { return { drawWeight, arrowLength }; }
function normalizeModelKey(modelName) { return String(modelName || "").toLowerCase().replace(/\s*\([^)]*\)/g, "").trim(); }
function getModelMetadata(modelName) { return MODEL_METADATA[normalizeModelKey(modelName)] || null; }
function brandLabel(key) { return key === "carbon" ? "Carbon Express" : key.charAt(0).toUpperCase() + key.slice(1); }
function materialLabel(key) { return key === "alu" ? "Alu" : key === "hybrid" ? "Alu / carbone" : "Carbone"; }
function diameterLabel(key) { return key === "large" ? "Large / salle" : key === "thin" ? "Fin / vent" : "Standard"; }
function environmentLabel(key) { return key === "indoor" ? "Interieur / salle" : key === "mixed" ? "Polyvalent" : "Exterieur"; }
function disciplineLabel(key) { return key === "field" ? "Campagne / 3D" : key === "hunting" ? "Chasse" : "Cible"; }
function profileLabel(key) {
  if (key === "recurve_outdoor") return "Recurve exterieur";
  if (key === "recurve_indoor") return "Recurve salle";
  if (key === "compound_target") return "Compound cible";
  if (key === "field_3d") return "Campagne / 3D";
  return "Personnalise";
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
  const showCustomContext = els.shootingProfile.value === "custom";
  els.bowTypeWrap.hidden = !showCustomContext;
  els.bowTypeWrap.style.display = showCustomContext ? "grid" : "none";
  els.compoundSpeedWrap.hidden = !showCompoundSpeed;
  els.compoundSpeedWrap.style.display = showCompoundSpeed ? "grid" : "none";
  els.compoundSpeed.disabled = !showCompoundSpeed;
  els.shootingEnvironmentWrap.hidden = !showCustomContext;
  els.shootingEnvironmentWrap.style.display = showCustomContext ? "grid" : "none";
  els.disciplineWrap.hidden = !showCustomContext;
  els.disciplineWrap.style.display = showCustomContext ? "grid" : "none";
  els.tuningFeedbackWrap.hidden = true;
  els.tuningFeedbackWrap.style.display = "none";
}

function applyProfileDefaults() {
  const profile = SHOOTING_PROFILES[els.shootingProfile.value];
  if (profile) {
    els.bowType.value = profile.bowType;
    els.shootingEnvironment.value = profile.shootingEnvironment;
    els.shaftMaterial.value = profile.shaftMaterial;
    els.discipline.value = profile.discipline;
  }
  updateVisibility();
}

function pickSpine(raw) {
  if (raw <= 300) return "250";
  if (raw <= 340) return "300";
  if (raw <= 390) return "340";
  if (raw <= 440) return "400";
  if (raw <= 500) return "500";
  if (raw <= 570) return "600";
  if (raw <= 700) return "700";
  if (raw <= 860) return "800";
  if (raw <= 980) return "900";
  return "1000";
}

function getBrandSpines(brand) {
  return Object.keys(arrowCatalog[brand] || {}).map((key) => Number(key)).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
}

function nearestSpine(raw, spineValues) {
  if (!spineValues.length) return { main: pickSpine(raw), softer: pickSpine(raw + 60), stiffer: pickSpine(raw - 60) };
  let bestIndex = 0;
  let bestDelta = Math.abs(spineValues[0] - raw);
  for (let index = 1; index < spineValues.length; index += 1) {
    const delta = Math.abs(spineValues[index] - raw);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  }
  return { main: String(spineValues[bestIndex]), softer: String(spineValues[Math.min(bestIndex + 1, spineValues.length - 1)]), stiffer: String(spineValues[Math.max(bestIndex - 1, 0)]) };
}

function dynamicLoadScore(input, refCfg) {
  let load = input.drawWeight;
  if (input.bowType === "compound") load += refCfg.compoundBoost;
  load += (input.arrowLength - 28) * refCfg.lengthFactor;
  load += (input.pointWeight - 100) * refCfg.pointFactor;
  if (input.discipline === "field") load += refCfg.fieldBoost;
  if (input.discipline === "hunting") load += refCfg.huntingBoost;
  if (input.shootingEnvironment === "indoor") load += refCfg.indoorBoost;
  if (input.shootingEnvironment === "outdoor") load += refCfg.outdoorBoost;
  return clamp(load, 15, 100);
}

function recommendationForBrand(input, brand) {
  const refCfg = BRAND_REFERENCE[brand] || BRAND_REFERENCE.easton;
  const load = dynamicLoadScore(input, refCfg);
  const raw = Math.round(1300 - load * 13 + refCfg.rawAdjust);
  return { brand, raw, load, ...nearestSpine(raw, getBrandSpines(brand)) };
}

function deriveTargetProfile(input) {
  let preferredMaterial = input.shaftMaterial;
  if (preferredMaterial === "all") {
    if (input.discipline === "hunting") preferredMaterial = "carbon";
    else if (input.shootingEnvironment === "indoor" && input.bowType === "recurve" && input.discipline === "target") preferredMaterial = "alu";
    else if (input.shootingEnvironment === "outdoor" && input.preferredBrand === "easton") preferredMaterial = "hybrid";
    else preferredMaterial = "carbon";
  }

  let preferredDiameter = "standard";
  if (input.shootingEnvironment === "indoor" && input.discipline === "target") preferredDiameter = "large";
  if (input.shootingEnvironment === "outdoor" && input.discipline !== "hunting") preferredDiameter = "thin";

  let pointRange = [90, 120];
  if (input.discipline === "field") pointRange = [100, 120];
  if (input.discipline === "hunting") pointRange = [100, input.bowType === "compound" ? 150 : 125];
  if (input.shootingEnvironment === "indoor" && input.discipline === "target") pointRange = [input.bowType === "compound" ? 120 : 100, input.bowType === "compound" ? 150 : 120];

  return { preferredMaterial, preferredDiameter, pointRange };
}

function scoreModel(modelName, input, profile) {
  const meta = getModelMetadata(modelName);
  if (!meta) return { score: -1000, meta: null };
  if (!meta.bowTypes.includes(input.bowType)) return { score: -1000, meta };
  if (input.shaftMaterial !== "all" && meta.material !== input.shaftMaterial) return { score: -1000, meta };

  let score = 0;
  if (meta.environments.includes(input.shootingEnvironment)) score += 4;
  if (meta.disciplines.includes(input.discipline)) score += 4;
  if (meta.material === profile.preferredMaterial) score += 3;
  if (meta.diameters.includes(profile.preferredDiameter)) score += 2;
  if (meta.pointRange && input.pointWeight >= meta.pointRange[0] && input.pointWeight <= meta.pointRange[1]) score += 2;
  return { score, meta };
}

function rankModels(models, input, profile) {
  return models
    .map((model) => {
      const scored = scoreModel(model, input, profile);
      return { model, score: scored.score, meta: scored.meta };
    })
    .filter((entry) => entry.score > -1000)
    .sort((a, b) => b.score - a.score);
}

function modelBudgetTier(modelName) {
  const name = normalizeModelKey(modelName);
  const premiumKeys = ["x10", "a/c/e", "nano-pro", "bruxx", "empros"];
  const ecoKeys = ["jazz", "xx75", "vap jr", "predator ii", "radius", "edge", "maverick", "brixxon", "inspire"];
  if (premiumKeys.some((key) => name.includes(key))) return "premium";
  if (ecoKeys.some((key) => name.includes(key))) return "eco";
  return "mid";
}

function filterByBudget(models, budget) {
  if (budget === "all") return models;
  return models.filter((model) => modelBudgetTier(model) === budget);
}

function findRangeRow(ranges, value) {
  for (let index = 0; index < ranges.length; index += 1) {
    const range = ranges[index];
    if (!range) continue;
    if (value >= range[0] && value <= range[1]) return index;
  }
  return -1;
}

function skylonRecommendation(input) {
  const col = Math.round(input.arrowLength) - 23;
  if (col < 0 || col > 9) return { ok: false, message: "Longueur hors tableau Skylon (23 a 32 pouces)." };
  const row = input.bowType === "compound" ? findRangeRow(SKYLON_COMPOUND_RANGES[input.compoundSpeed] || [], input.drawWeight) : findRangeRow(SKYLON_RECURVE_RANGES, input.drawWeight);
  if (row < 0 || row >= SKYLON_GRID.length) return { ok: false, message: "Puissance hors plages du tableau Skylon." };
  const group = SKYLON_GRID[row][col] || "";
  if (!group) return { ok: false, message: "Case vide dans le tableau Skylon pour cette combinaison." };
  return { ok: true, group, models: SKYLON_GROUP_MODELS[group] || [], warning: group.startsWith("Y") };
}

function buildBrandRecommendation(input, brand) {
  const profile = deriveTargetProfile(input);
  const base = recommendationForBrand(input, brand);
  let models = filterByBudget(arrowCatalog[brand]?.[base.main] || [], input.budgetLevel);
  let ranked = rankModels(models, input, profile);

  if (brand === "skylon") {
    const skylon = skylonRecommendation(input);
    if (skylon.ok) {
      models = filterByBudget(skylon.models, input.budgetLevel);
      ranked = rankModels(models, input, profile);
      const topMeta = ranked[0]?.meta || null;
      return {
        brand,
        mode: "skylon",
        primary: skylon.group,
        comparisonSpine: base.main,
        softer: base.softer,
        stiffer: base.stiffer,
        load: base.load,
        confidence: skylon.warning ? "Moyenne" : "Elevee",
        confidenceReasons: skylon.warning ? ["Zone Y: valider absolument au tir."] : ["Groupe issu du tableau Skylon.", "Modeles tries selon usage et construction."],
        models: ranked,
        recommendedMaterial: topMeta?.material || profile.preferredMaterial,
        recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
        recommendedPointRange: topMeta?.pointRange || profile.pointRange,
        notes: [topMeta?.note || "Controle final au tir requis."]
      };
    }
  }

  const topMeta = ranked[0]?.meta || null;
  const reasons = [];
  if (input.shaftMaterial !== "all") reasons.push("Filtre de construction impose.");
  if (input.shootingEnvironment === "outdoor") reasons.push("Contexte exterieur pris en compte.");
  if (ranked.length >= 2) reasons.push("Plusieurs modeles coherents trouves dans la marque.");
  if (input.arrowLength < 24 || input.arrowLength > 31) reasons.push("Longueur hors plage centrale: verification fabricant imperative.");

  const notes = [];
  if (input.shootingEnvironment === "indoor" && profile.preferredMaterial === "alu") notes.push("Pour la salle recurve, verifier ensuite le tableau alu dedie du fabricant.");
  if (topMeta?.note) notes.push(topMeta.note);
  if (!ranked.length) notes.push("Aucun modele strictement conforme aux filtres. Elargir les contraintes peut etre utile.");

  return {
    brand,
    mode: "brand",
    primary: base.main,
    softer: base.softer,
    stiffer: base.stiffer,
    load: base.load,
    confidence: "Moyenne",
    confidenceReasons: reasons,
    models: ranked,
    recommendedMaterial: topMeta?.material || profile.preferredMaterial,
    recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
    recommendedPointRange: topMeta?.pointRange || profile.pointRange,
    notes
  };
}

function renderModelList(recommendation) {
  if (!recommendation.models.length) return "<li>Aucun modele correspondant strictement a vos filtres.</li>";
  return recommendation.models.slice(0, 4).map((entry) => {
    const meta = entry.meta;
    const details = meta ? `${materialLabel(meta.material)} | ${diameterLabel(meta.diameters[0] || "standard")} | ${meta.pointRange[0]}-${meta.pointRange[1]} gr` : "Meta technique locale incomplete";
    return `<li><strong>${entry.model}</strong> - score ${entry.score} - ${details}</li>`;
  }).join("");
}

function renderDeals(preferredBrand, budget, shaftMaterial, bowType) {
  const deals = LIVE_DEALS.filter((deal) => {
    const brandOk = preferredBrand === "all" || deal.brand === preferredBrand;
    const budgetOk = budget === "all" || deal.tier === budget;
    const materialOk = shaftMaterial === "all" || deal.material === shaftMaterial;
    const bowTypeOk = !deal.bowTypes || deal.bowTypes.includes(bowType);
    return brandOk && budgetOk && materialOk && bowTypeOk;
  });
  if (!deals.length) return "<li>Aucune offre correspondant au filtre actuel.</li>";
  return deals.map((deal) => `<li><a href="${deal.url}" target="_blank" rel="noopener noreferrer">${deal.title}</a> - ${deal.price} <em>(${deal.shop})</em></li>`).join("");
}

function tuningDiagnosis(input, recommendation) {
  const feedback = input.tuningFeedback;
  if (feedback === "none") return [];

  const diag = [];
  if (feedback === "stiff" || feedback === "left") {
    diag.push(`Essayer un spine plus souple: ${recommendation.softer}.`);
    diag.push("Augmenter legerement le poids de pointe ou reduire la tension de bouton si pertinent.");
  }
  if (feedback === "weak" || feedback === "right") {
    diag.push(`Essayer un spine plus rigide: ${recommendation.stiffer}.`);
    diag.push("Reduire legerement le poids de pointe ou raccourcir si la marge de securite le permet.");
  }
  if (feedback === "bare_high") {
    diag.push("Verifier le nocking point et la synchronisation verticale avant de changer de spine.");
    diag.push("Controle de tiller / repose-fleche recommande.");
  }
  if (feedback === "bare_low") {
    diag.push("Verifier le nocking point trop bas et la sortie de repose-fleche.");
    diag.push("Ne pas conclure trop vite a un probleme de spine lateral.");
  }
  if (recommendation.mode === "skylon") diag.push("Conserver le groupe Skylon comme reference, puis ajuster pointe et reglages avant de changer de groupe.");
  return diag;
}

function cloneCatalog(catalog) { return JSON.parse(JSON.stringify(catalog)); }
function readHistory() { try { return JSON.parse(localStorage.getItem(STORAGE.history) || "[]"); } catch { return []; } }
function writeHistory(entry) { const next = [entry, ...readHistory()].slice(0, 5); localStorage.setItem(STORAGE.history, JSON.stringify(next)); renderHistory(); }
function renderHistory() {
  const entries = readHistory();
  if (!entries.length) { els.historyContent.innerHTML = "<p>Aucun calcul pour le moment.</p>"; return; }
  els.historyContent.innerHTML = `<ul class="history-list">${entries.map((entry) => `<li>${entry.date} - ${entry.profile} - ${entry.primary} (${entry.bowType}, ${entry.drawWeight} lbs, ${entry.arrowLength}")</li>`).join("")}</ul>`;
}

function validateInput(input) {
  if (!Number.isFinite(input.drawWeight) || !Number.isFinite(input.arrowLength) || !Number.isFinite(input.pointWeight)) return "Valeurs numeriques invalides.";
  const limits = BOW_LIMITS[input.bowType] || BOW_LIMITS.recurve;
  if (input.drawWeight < limits.minDrawWeight || input.drawWeight > limits.maxDrawWeight) return `Puissance hors plage pour ${input.bowType} (${limits.minDrawWeight}-${limits.maxDrawWeight} lbs).`;
  if (input.arrowLength < limits.minArrowLength || input.arrowLength > limits.maxArrowLength) return `Longueur hors plage (${limits.minArrowLength}-${limits.maxArrowLength} pouces).`;
  if (input.pointWeight < 60 || input.pointWeight > 250) return "Poids de pointe hors plage (60-250 grains).";
  if (input.bowType === "compound" && !VALID_COMPOUND_SPEEDS.includes(input.compoundSpeed)) return "Vitesse compound invalide.";
  return "";
}

function renderComparison(input) {
  const contextLine = input.shootingProfile === "custom"
    ? `<p>Configuration cible: <strong>${environmentLabel(input.shootingEnvironment)}</strong>, <strong>${disciplineLabel(input.discipline)}</strong></p>`
    : `<p>Configuration cible deduite du profil <strong>${profileLabel(input.shootingProfile)}</strong>.</p>`;
  const lines = BRAND_ORDER.map((brand) => {
    const rec = buildBrandRecommendation(input, brand);
    const primaryLabel = rec.mode === "skylon" ? `${rec.primary} (eq. ${rec.comparisonSpine})` : rec.primary;
    const bestModel = rec.models[0]?.model || "Aucun modele";
    return `<li><strong>${brandLabel(brand)}</strong>: ${primaryLabel} - ${materialLabel(rec.recommendedMaterial)} - ${diameterLabel(rec.recommendedDiameter)} - ${bestModel}</li>`;
  }).join("");

  els.result.innerHTML = `
    <h2>Comparaison par marque</h2>
    <p>Chaque marque garde sa propre logique de reference.</p>
    <p class="result-value">Choisissez une marque</p>
    <p>Profil actif: <strong>${profileLabel(input.shootingProfile)}</strong></p>
    ${contextLine}
    <p>Construction recherchee: <strong>${input.shaftMaterial === "all" ? "Toutes" : materialLabel(input.shaftMaterial)}</strong></p>
    <ul>${lines}</ul>
  `;

  writeHistory({ date: new Date().toLocaleString("fr-FR"), profile: "Comparaison", primary: "Multi-marques", bowType: input.bowType, drawWeight: input.drawWeight.toFixed(1), arrowLength: input.arrowLength.toFixed(2) });
}

function renderRecommendation(input) {
  if (input.preferredBrand === "all") {
    renderComparison(input);
    return;
  }

  const recommendation = buildBrandRecommendation(input, input.preferredBrand);
  const contextLine = input.shootingProfile === "custom"
    ? `<p>Contexte: <strong>${environmentLabel(input.shootingEnvironment)}</strong>, <strong>${disciplineLabel(input.discipline)}</strong></p>`
    : `<p>Contexte deduit du profil <strong>${profileLabel(input.shootingProfile)}</strong>.</p>`;
  const confidenceList = recommendation.confidenceReasons.length ? `<ul>${recommendation.confidenceReasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>` : "<p>Aucune precision supplementaire.</p>";
  const notesList = recommendation.notes.length ? `<ul>${recommendation.notes.map((note) => `<li>${note}</li>`).join("")}</ul>` : "<p>Aucune note complementaire.</p>";
  const dealsList = renderDeals(input.preferredBrand, input.budgetLevel, input.shaftMaterial, input.bowType);
  const tuningList = tuningDiagnosis(input, recommendation);
  const primaryLabel = recommendation.mode === "skylon" ? `${recommendation.primary} <span class="result-subvalue">eq. spine ${recommendation.comparisonSpine}</span>` : recommendation.primary;

  els.result.innerHTML = `
    <h2>Recommandation ${brandLabel(recommendation.brand)}</h2>
    <p>Sortie orientee club: spine, construction, diametre et modele.</p>
    <p class="result-value">${primaryLabel}</p>
    <p>Profil actif: <strong>${profileLabel(input.shootingProfile)}</strong></p>
    ${contextLine}
    <p>Construction conseillee: <strong>${materialLabel(recommendation.recommendedMaterial)}</strong></p>
    <p>Diametre conseille: <strong>${diameterLabel(recommendation.recommendedDiameter)}</strong></p>
    <p>Plage de pointe recommandee: <strong>${recommendation.recommendedPointRange[0]}-${recommendation.recommendedPointRange[1]} gr</strong></p>
    <p>Alternatives spine: plus souple <strong>${recommendation.softer}</strong>, plus rigide <strong>${recommendation.stiffer}</strong></p>
    <p>Niveau de confiance: <strong>${recommendation.confidence}</strong></p>
    <p>Pourquoi ce niveau:</p>
    ${confidenceList}
    <p>Modeles conseilles:</p>
    <ul>${renderModelList(recommendation)}</ul>
    <p>Notes techniques:</p>
    ${notesList}
    ${tuningList.length ? `<p>Diagnostic tuning:</p><ul>${tuningList.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
    <p>Bons plans (mise a jour 3 mars 2026, verification manuelle requise):</p>
    <ul>${dealsList}</ul>
  `;

  writeHistory({ date: new Date().toLocaleString("fr-FR"), profile: brandLabel(recommendation.brand), primary: recommendation.mode === "skylon" ? `Groupe ${recommendation.primary}` : `Spine ${recommendation.primary}`, bowType: input.bowType, drawWeight: input.drawWeight.toFixed(1), arrowLength: input.arrowLength.toFixed(2) });
}

els.shootingProfile.addEventListener("change", applyProfileDefaults);
els.bowType.addEventListener("change", updateVisibility);
els.clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE.history);
  renderHistory();
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const converted = toImperial(Number(els.drawWeight.value), Number(els.arrowLength.value));
  const input = {
    bowType: els.bowType.value,
    shootingProfile: els.shootingProfile.value,
    preferredBrand: els.preferredBrand.value,
    shootingEnvironment: els.shootingEnvironment.value,
    shaftMaterial: els.shaftMaterial.value,
    compoundSpeed: els.compoundSpeed.value,
    budgetLevel: els.budgetLevel.value,
    drawWeight: converted.drawWeight,
    arrowLength: converted.arrowLength,
    pointWeight: Number(els.pointWeight.value),
    discipline: els.discipline.value,
    tuningFeedback: els.tuningFeedback.value
  };

  const error = validateInput(input);
  if (error) {
    els.result.innerHTML = `<h2>Recommandation</h2><p>${error}</p>`;
    return;
  }

  renderRecommendation(input);
});

applyUnitConstraints();
applyProfileDefaults();
updateVisibility();
renderHistory();
