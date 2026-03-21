import fs from 'fs';
import path from 'path';
import vm from 'vm';

const cwd = process.cwd();
const appPath = path.join(cwd, 'app.js');
const source = fs.readFileSync(appPath, 'utf8') + `
;globalThis.__audit = {
  normalizeInput,
  buildBrandRecommendation,
  skylonRecommendation,
  eastonCarbonRecommendation,
  eastonAluRecommendation,
  victoryRecurveRecommendation,
  carbonExpressRecommendation,
  refreshCatalogState,
  refreshDealsCatalog,
  getModelMetadata,
  dealsUpdatedLabel,
  BRAND_ORDER,
  SKYLON_GRID,
  SKYLON_RECURVE_RANGES,
  EASTON_RECURVE_CARBON_ROWS,
  EASTON_RECURVE_CARBON_LENGTHS,
  EASTON_RECURVE_ALU_ROWS,
  EASTON_RECURVE_ALU_LENGTHS,
  VICTORY_RECURVE_ROWS,
  VICTORY_RECURVE_LENGTHS,
  CARBON_LIGHT_RECURVE_ROWS,
  CARBON_LIGHT_RECURVE_LENGTHS,
  CARBON_RECURVE_SERIES_ROWS,
  CARBON_RECURVE_SERIES_LENGTHS,
  DEFAULT_CATALOG_STATE,
  DEFAULT_DEALS_STATE
};`;

function makeElement() {
  return {
    value: '',
    innerHTML: '',
    hidden: false,
    style: {},
    firstChild: { textContent: '' },
    classList: { toggle() {}, add() {}, remove() {} },
    setAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    querySelectorAll() { return []; }
  };
}

const elementStore = new Map();
const documentStub = {
  getElementById(id) {
    if (!elementStore.has(id)) elementStore.set(id, makeElement());
    return elementStore.get(id);
  },
  querySelectorAll() { return []; }
};

const localStorageStub = {
  _map: new Map(),
  getItem(key) { return this._map.has(key) ? this._map.get(key) : null; },
  setItem(key, value) { this._map.set(key, String(value)); },
  removeItem(key) { this._map.delete(key); }
};

async function fetchStub(url) {
  const plain = String(url).split('?')[0];
  const filePath = path.join(cwd, plain);
  if (!fs.existsSync(filePath)) {
    return {
      ok: false,
      status: 404,
      async json() { throw new Error('404'); },
      async text() { throw new Error('404'); }
    };
  }
  const body = fs.readFileSync(filePath, 'utf8');
  return {
    ok: true,
    status: 200,
    async json() { return JSON.parse(body); },
    async text() { return body; }
  };
}

const sandbox = {
  console,
  document: documentStub,
  window: { addEventListener() {} },
  localStorage: localStorageStub,
  fetch: fetchStub,
  setTimeout,
  clearTimeout,
  Date,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  JSON,
  Promise,
  RegExp,
  Intl,
  globalThis: null
};
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, { filename: 'app.js' });
const audit = sandbox.__audit;
await audit.refreshCatalogState();
await audit.refreshDealsCatalog();

function baseInput(material = 'carbon', drawWeight = 30, arrowLength = 28) {
  return audit.normalizeInput({
    bowType: 'recurve',
    preferredBrand: 'all',
    shootingProfile: 'recurve_outdoor',
    shootingEnvironment: 'outdoor',
    shaftMaterial: material,
    drawWeight,
    arrowLength,
    discipline: 'target',
    pointWeight: 100
  });
}

function representativeWeight(range) {
  return (range[0] + range[1]) / 2;
}

function runSkylonAudit() {
  let total = 0;
  let passed = 0;
  const failures = [];
  const rows = audit.SKYLON_RECURVE_RANGES;
  const grid = audit.SKYLON_GRID;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex += 1) {
      const cell = grid[rowIndex][colIndex];
      if (!cell) continue;
      total += 1;
      const drawWeight = representativeWeight(rows[rowIndex]);
      const arrowLength = 23 + colIndex;
      const input = baseInput('carbon', drawWeight, arrowLength);
      const recommendation = audit.buildBrandRecommendation(input, 'skylon');
      if (recommendation.primary === cell) passed += 1;
      else failures.push({ drawWeight, arrowLength, expected: cell, got: recommendation.primary });
    }
  }
  return { brand: 'Skylon', total, passed, failures };
}

function runEastonCarbonAudit() {
  let total = 0;
  let passed = 0;
  const failures = [];
  for (const row of audit.EASTON_RECURVE_CARBON_ROWS) {
    for (let index = 0; index < row.cells.length; index += 1) {
      const cell = row.cells[index];
      if (!cell) continue;
      total += 1;
      const drawWeight = representativeWeight(row.range);
      const arrowLength = audit.EASTON_RECURVE_CARBON_LENGTHS[index];
      const input = baseInput('carbon', drawWeight, arrowLength);
      const recommendation = audit.buildBrandRecommendation(input, 'easton');
      if (recommendation.primary === cell) passed += 1;
      else failures.push({ drawWeight, arrowLength, expected: cell, got: recommendation.primary });
    }
  }
  return { brand: 'Easton carbone', total, passed, failures };
}

function runEastonAluAudit() {
  let total = 0;
  let passed = 0;
  const failures = [];
  for (const row of audit.EASTON_RECURVE_ALU_ROWS) {
    for (let index = 0; index < row.cells.length; index += 1) {
      const cell = row.cells[index];
      if (!cell) continue;
      total += 1;
      const drawWeight = representativeWeight(row.range);
      const arrowLength = audit.EASTON_RECURVE_ALU_LENGTHS[index];
      const input = baseInput('alu', drawWeight, arrowLength);
      const recommendation = audit.buildBrandRecommendation(input, 'easton');
      if (recommendation.primary === cell) passed += 1;
      else failures.push({ drawWeight, arrowLength, expected: cell, got: recommendation.primary });
    }
  }
  return { brand: 'Easton alu', total, passed, failures };
}

function runVictoryAudit() {
  let total = 0;
  let passed = 0;
  const failures = [];
  for (const row of audit.VICTORY_RECURVE_ROWS) {
    for (let index = 0; index < row.cells.length; index += 1) {
      const cell = row.cells[index];
      if (!cell) continue;
      total += 1;
      const drawWeight = representativeWeight(row.range);
      const arrowLength = audit.VICTORY_RECURVE_LENGTHS[index];
      const input = baseInput('carbon', drawWeight, arrowLength);
      const recommendation = audit.buildBrandRecommendation(input, 'victory');
      if (recommendation.primary === cell) passed += 1;
      else failures.push({ drawWeight, arrowLength, expected: cell, got: recommendation.primary });
    }
  }
  return { brand: 'Victory', total, passed, failures };
}

function runCarbonAudit() {
  let total = 0;
  let passed = 0;
  const failures = [];
  for (const row of audit.CARBON_LIGHT_RECURVE_ROWS) {
    for (let index = 0; index < row.cells.length; index += 1) {
      const cell = row.cells[index];
      if (!cell) continue;
      total += 1;
      const drawWeight = representativeWeight(row.range);
      const arrowLength = audit.CARBON_LIGHT_RECURVE_LENGTHS[index];
      const input = baseInput('carbon', drawWeight, arrowLength);
      const recommendation = audit.buildBrandRecommendation(input, 'carbon');
      if (recommendation.primary === cell) passed += 1;
      else failures.push({ chart: 'light', drawWeight, arrowLength, expected: cell, got: recommendation.primary });
    }
  }
  for (const row of audit.CARBON_RECURVE_SERIES_ROWS) {
    for (let index = 0; index < row.cells.length; index += 1) {
      const cell = row.cells[index];
      if (!cell) continue;
      const drawWeight = representativeWeight(row.range);
      const arrowLength = audit.CARBON_RECURVE_SERIES_LENGTHS[index];
      if (drawWeight <= 34 && arrowLength <= 27) continue;
      total += 1;
      const input = baseInput('carbon', drawWeight, arrowLength);
      const recommendation = audit.buildBrandRecommendation(input, 'carbon');
      if (recommendation.primary === cell) passed += 1;
      else failures.push({ chart: 'series', drawWeight, arrowLength, expected: cell, got: recommendation.primary });
    }
  }
  return { brand: 'Carbon Express', total, passed, failures };
}

function runOfferCoverageAudit() {
  const sampleInputs = [
    baseInput('carbon', 24, 28),
    baseInput('carbon', 30, 28),
    baseInput('carbon', 36, 29),
    baseInput('alu', 30, 28)
  ];
  const brands = ['skylon', 'easton', 'victory', 'carbon'];
  const results = [];
  for (const brand of brands) {
    let withOffer = 0;
    for (const input of sampleInputs) {
      const recommendation = audit.buildBrandRecommendation(input, brand);
      const models = recommendation.models.slice(0, 3).map((entry) => entry.model);
      const hasOffer = models.some((model) => {
        const key = String(model).toLowerCase();
        return audit.DEFAULT_DEALS_STATE.deals.some((deal) => String(deal.brand).toLowerCase() === brand && key.includes(String(deal.modelKey).toLowerCase()));
      });
      if (hasOffer) withOffer += 1;
    }
    results.push({
      brand,
      auditedCases: sampleInputs.length,
      withOffer,
      rate: Number(((withOffer / sampleInputs.length) * 100).toFixed(1))
    });
  }
  return results;
}

const brandAudits = [
  runSkylonAudit(),
  runEastonCarbonAudit(),
  runEastonAluAudit(),
  runVictoryAudit(),
  runCarbonAudit()
];
const totalCases = brandAudits.reduce((sum, item) => sum + item.total, 0);
const totalPassed = brandAudits.reduce((sum, item) => sum + item.passed, 0);
const overallRate = Number(((totalPassed / totalCases) * 100).toFixed(1));
const offerCoverage = runOfferCoverageAudit();

const report = [];
report.push('# Audit de justesse de l\'application');
report.push('');
report.push(`Date: ${new Date().toISOString()}`);
report.push('');
report.push('## Bilan chiffre');
report.push('');
report.push(`- Cas officiels audites: ${totalCases}`);
report.push(`- Cas conformes: ${totalPassed}`);
report.push(`- Taux global de correspondance tableau -> sortie: ${overallRate}%`);
report.push('');
report.push('| Marque | Cas audites | Cas conformes | Taux |');
report.push('|---|---:|---:|---:|');
for (const item of brandAudits) {
  const rate = Number(((item.passed / item.total) * 100).toFixed(1));
  report.push(`| ${item.brand} | ${item.total} | ${item.passed} | ${rate}% |`);
}
report.push('');
report.push('## Couverture marchands (echantillon de 4 cas)');
report.push('');
report.push('| Marque | Cas echantillonnes | Cas avec au moins une offre liee | Taux |');
report.push('|---|---:|---:|---:|');
for (const item of offerCoverage) {
  report.push(`| ${item.brand} | ${item.auditedCases} | ${item.withOffer} | ${item.rate}% |`);
}
report.push('');
report.push('## Points verifies');
report.push('');
report.push('- Lecture des tableaux officiels integres pour Skylon, Easton carbone, Easton alu, Victory et Carbon Express.');
report.push('- Verification du chemin complet de sortie: normalisation d\'entree -> recommandation de marque -> etiquette primaire affichee.');
report.push('- Verification des correspondances Carbon Express par famille fabricant (PT, MXR, NPX, NSST).');
report.push('');
report.push('## Risques residuels');
report.push('');
report.push('- L\'entree utilisateur n\'expose plus l\'usage; `carbone` et `toutes` sont normalises en exterieur, `alu` en salle. C\'est simple, mais moins fin qu\'un vrai choix d\'usage.');
report.push('- Victory peut encore demander un ajustement terrain specifique de type "un spine plus souple" si un expert marque le confirme. Ce n\'est pas encode aujourd\'hui.');
report.push('- La justesse du `modele conseille` reste moins forte que la justesse du `spine / groupe officiel`, sauf Skylon ou le groupe pilote directement la famille de tubes.');
report.push('');
const failing = brandAudits.flatMap((item) => item.failures.slice(0, 5).map((failure) => ({ brand: item.brand, ...failure })));
if (failing.length) {
  report.push('## Ecarts observes');
  report.push('');
  for (const failure of failing) {
    report.push(`- ${failure.brand}: ${JSON.stringify(failure)}`);
  }
  report.push('');
} else {
  report.push('## Ecarts observes');
  report.push('');
  report.push('- Aucun ecart sur les cas audites.');
  report.push('');
}

fs.writeFileSync(path.join(cwd, 'AUDIT-APP-2026-03-21.md'), report.join('\n'));
console.log(JSON.stringify({ totalCases, totalPassed, overallRate, brandAudits, offerCoverage }, null, 2));
