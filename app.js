const els = {
  form: document.getElementById("spine-form"),
  result: document.getElementById("result"),
  arcSetupForm: document.getElementById("arc-setup-form"),
  arcSetupResult: document.getElementById("arcSetupResult"),
  historyContent: document.getElementById("historyContent"),
  drawWeightLabel: document.getElementById("drawWeightLabel"),
  arrowLengthLabel: document.getElementById("arrowLengthLabel"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  preferredBrand: document.getElementById("preferredBrand"),
  shootingProfileWrap: document.getElementById("shootingProfileWrap"),
  shootingProfile: document.getElementById("shootingProfile"),
  shootingEnvironmentWrap: document.getElementById("shootingEnvironmentWrap"),
  shootingEnvironment: document.getElementById("shootingEnvironment"),
  shaftMaterial: document.getElementById("shaftMaterial"),
  materialGuidance: document.getElementById("materialGuidance"),
  drawWeight: document.getElementById("drawWeight"),
  arrowLength: document.getElementById("arrowLength"),
  arcLength: document.getElementById("arcLength"),
  upperTiller: document.getElementById("upperTiller"),
  lowerTillerMeasured: document.getElementById("lowerTillerMeasured"),
  limbMarkedWeight: document.getElementById("limbMarkedWeight"),
  riserLength: document.getElementById("riserLength"),
  drawLengthForWeight: document.getElementById("drawLengthForWeight"),
  notebookForm: document.getElementById("notebook-form"),
  notebookResult: document.getElementById("notebookResult"),
  notebookStatus: document.getElementById("notebookStatus"),
  notebookContent: document.getElementById("notebookContent"),
  prefillNotebookBtn: document.getElementById("prefillNotebookBtn"),
  resetNotebookBtn: document.getElementById("resetNotebookBtn"),
  notebookDate: document.getElementById("notebookDate"),
  notebookTitle: document.getElementById("notebookTitle"),
  notebookArcModel: document.getElementById("notebookArcModel"),
  notebookArcLength: document.getElementById("notebookArcLength"),
  notebookRiserLength: document.getElementById("notebookRiserLength"),
  notebookLimbs: document.getElementById("notebookLimbs"),
  notebookLimbWeight: document.getElementById("notebookLimbWeight"),
  notebookDrawLength: document.getElementById("notebookDrawLength"),
  notebookBrace: document.getElementById("notebookBrace"),
  notebookUpperTiller: document.getElementById("notebookUpperTiller"),
  notebookLowerTiller: document.getElementById("notebookLowerTiller"),
  notebookPositiveTiller: document.getElementById("notebookPositiveTiller"),
  notebookEstimatedWeight: document.getElementById("notebookEstimatedWeight"),
  notebookArrowBrand: document.getElementById("notebookArrowBrand"),
  notebookArrowModel: document.getElementById("notebookArrowModel"),
  notebookArrowModelOptions: document.getElementById("notebookArrowModelOptions"),
  notebookArrowModelHint: document.getElementById("notebookArrowModelHint"),
  notebookArrowSpine: document.getElementById("notebookArrowSpine"),
  notebookArrowLength: document.getElementById("notebookArrowLength"),
  notebookPointWeight: document.getElementById("notebookPointWeight"),
  notebookSight10: document.getElementById("notebookSight10"),
  notebookSight18: document.getElementById("notebookSight18"),
  notebookSight20: document.getElementById("notebookSight20"),
  notebookSight30: document.getElementById("notebookSight30"),
  notebookSight40: document.getElementById("notebookSight40"),
  notebookSight50: document.getElementById("notebookSight50"),
  notebookSight60: document.getElementById("notebookSight60"),
  notebookSight70: document.getElementById("notebookSight70"),
  notebookSightNotes: document.getElementById("notebookSightNotes"),
  notebookNotes: document.getElementById("notebookNotes"),
  feedbackToggleBtn: document.getElementById("feedbackToggleBtn"),
  feedbackPanel: document.getElementById("feedbackPanel"),
  feedbackCloseBtn: document.getElementById("feedbackCloseBtn"),
  feedbackForm: document.getElementById("feedbackForm"),
  feedbackSendBtn: document.getElementById("feedbackSendBtn"),
  feedbackMessage: document.getElementById("feedbackMessage"),
  feedbackResetBtn: document.getElementById("feedbackResetBtn"),
  feedbackStatus: document.getElementById("feedbackStatus"),
  feedbackCategoryInputs: Array.from(document.querySelectorAll('input[name="feedbackCategory"]')),
  themeSelect: document.getElementById("themeSelect"),
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
  disciplineWrap: document.getElementById("disciplineWrap"),
  discipline: document.getElementById("discipline")
};

const STORAGE = { history: "spineHistory", activeTab: "activeMainTab", notebook: "archerNotebook", theme: "appTheme", feedback: "feedbackDraft" };
const FEEDBACK_FORM = {
  responseUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc1Pp7JKPm90GKUasJxFrPi8fs4YO37Smb2s8MtbPPVDKVWuA/formResponse",
  categoryField: "entry.1394735982",
  messageField: "entry.1482482325"
};
const BRAND_ORDER = ["easton", "victory", "carbon", "skylon"];
const ALLOWED_SHAFT_MATERIALS = ["carbon", "alu"];
const BOW_LIMITS = {
  recurve: { minDrawWeight: 12, maxDrawWeight: 70, minArrowLength: 22, maxArrowLength: 34 }
};

const SHOOTING_PROFILES = {
  recurve_outdoor: { bowType: "recurve", shootingEnvironment: "outdoor", shaftMaterial: "carbon", discipline: "target" },
  recurve_indoor: { bowType: "recurve", shootingEnvironment: "indoor", shaftMaterial: "alu", discipline: "target" }
};

const BRAND_REFERENCE = {
  easton: { compoundBoost: 4, lengthFactor: 3.2, pointFactor: 0.11, fieldBoost: 2, huntingBoost: 4, indoorBoost: -1, outdoorBoost: 1, rawAdjust: -20 },
  victory: { compoundBoost: 4, lengthFactor: 2.9, pointFactor: 0.09, fieldBoost: 2, huntingBoost: 4, indoorBoost: 0, outdoorBoost: 1, rawAdjust: 0 },
  carbon: { compoundBoost: 4, lengthFactor: 2.8, pointFactor: 0.09, fieldBoost: 2, huntingBoost: 5, indoorBoost: 0, outdoorBoost: 1, rawAdjust: 20 },
  skylon: { compoundBoost: 4, lengthFactor: 3.0, pointFactor: 0.10, fieldBoost: 2, huntingBoost: 4, indoorBoost: 0, outdoorBoost: 1, rawAdjust: -10 }
};

const CALIBRATION_ARCHETYPES = {
  skylon_standard_club: { rawShift: -5, pointShift: 0, label: "Reference Skylon type Brixxon / Radius" },
  skylon_standard_perf: { rawShift: 10, pointShift: 0, label: "Reference Skylon type Paragon" },
  skylon_thin_performance: { rawShift: 35, pointShift: 5, label: "Reference Skylon type Premiens" },
  skylon_thin_competition: { rawShift: 55, pointShift: 10, label: "Reference Skylon type Bruxx / Empros" },
  skylon_indoor_large: { rawShift: -45, pointShift: -5, label: "Reference Skylon type Edge" }
};

const MODEL_CALIBRATION_BY_FAMILY = {
  brixxon: "skylon_standard_club",
  radius: "skylon_standard_club",
  paragon: "skylon_standard_perf",
  performa: "skylon_thin_performance",
  precium: "skylon_thin_performance",
  premiens: "skylon_thin_performance",
  preminens: "skylon_thin_performance",
  bruxx: "skylon_indoor_large",
  empros: "skylon_indoor_large",
  edge: "skylon_standard_club",
  maverick: "skylon_standard_club",
  axis: "skylon_standard_club",
  vector: "skylon_standard_perf",
  avance: "skylon_thin_competition",
  "superdrive micro": "skylon_thin_competition",
  vap: "skylon_thin_performance",
  vft: "skylon_standard_club",
  predator: "skylon_standard_club",
  trojan: "skylon_standard_club",
  "maxima red": "skylon_standard_perf",
  "nano-pro rz": "skylon_thin_performance",
  "nano-pro xtreme": "skylon_thin_competition",
  x7: "skylon_indoor_large",
  rx7: "skylon_indoor_large",
  x23: "skylon_indoor_large",
  xx75: "skylon_indoor_large",
  "medallion xr": "skylon_standard_perf",
  "v-tac 23 elite": "skylon_indoor_large"
};

const DEFAULT_CATALOG = {
  easton: { "300": ["Avance", "Superdrive Micro", "Vector"], "340": ["Avance", "Superdrive Micro", "Vector"], "400": ["Avance", "Superdrive Micro", "Vector", "X7"], "500": ["Avance", "Superdrive Micro", "Vector", "X7"], "600": ["Avance", "Superdrive Micro", "Vector", "X7", "XX75 Platinum Plus"], "700": ["Avance", "Superdrive Micro", "Vector", "RX7", "XX75 Platinum Plus"], "800": ["Avance", "Superdrive Micro", "Vector", "X23", "XX75 Platinum Plus"], "900": ["Avance", "Superdrive Micro", "Vector", "X23", "XX75 Platinum Plus"], "1000": ["Avance", "Superdrive Micro", "Vector", "X23", "XX75 Platinum Plus"] },
  victory: { "300": ["VAP Sport"], "340": ["VAP Sport", "VXT Elite V1"], "400": ["VAP Sport", "VXT Elite V1"], "500": ["VAP V3", "VXT Elite V1"], "600": ["VAP V3", "VAP Target", "VXT Elite V1"], "700": ["VAP V3", "VAP Target", "VXT Elite V1", "VAP Gamer V3"], "800": ["VAP Target", "VAP V3", "VAP Gamer V3", "V-TAC 23 Elite"], "900": ["VAP Target", "VAP V3", "VFT Gamer V3", "V-TAC 23 Elite"], "1000": ["VAP Target", "VFT Gamer V3", "V-TAC 23 Elite"] },
  carbon: { "300": ["Maxima RED", "Hunter XT"], "340": ["Hunter XT", "Predator II", "Maxima RED"], "400": ["Predator II", "Trojan", "Maxima RED"], "500": ["Predator II", "Nano-Pro RZ", "Trojan"], "600": ["Nano-Pro RZ", "Predator II", "Trojan"], "700": ["Nano-Pro RZ", "Predator II", "Medallion XR"], "800": ["Nano-Pro Xtreme", "Nano-Pro RZ", "Medallion XR"], "900": ["Nano-Pro Xtreme", "Medallion XR"], "1000": ["Medallion XR", "Nano-Pro Xtreme"] },
  skylon: { "300": ["Premiens 350", "Performa 350", "Precium 350", "Paragon 350"], "340": ["Premiens 350", "Performa 350", "Precium 350", "Paragon 350"], "400": ["Brixxon R400", "Radius 400", "Premiens 400", "Performa 400", "Precium 400", "Paragon 400"], "500": ["Brixxon R550-500", "Radius 500", "Premiens 500", "Performa 500", "Precium 500", "Paragon 500"], "600": ["Brixxon R650-600", "Radius 650-600", "Premiens 600", "Performa 600", "Precium 600", "Paragon 600"], "700": ["Brixxon R750-700", "Radius 700-650", "Premiens 700", "Performa 700", "Precium 700", "Paragon 700"], "800": ["Brixxon R850-800", "Radius 850-800", "Performa 800", "Precium 800", "Paragon 800"], "900": ["Brixxon R900-850", "Radius 900", "Performa 900", "Precium 900", "Paragon 900"], "1000": ["Brixxon R1000-900", "Radius R1000-900", "Performa 1000", "Precium 1000", "Paragon 1000"] }
};

const MODEL_METADATA = {
  "avance": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Tube fin exterieur." },
  "axis 5mm": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Tube carbone polyvalent." },
  "x7": { material: "alu", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "performance"], pointRange: [100, 150], note: "Tube alu salle / club tres classique." },
  "jazz": { material: "alu", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 120], note: "Reference salle recurve." },
  "inspire": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 110], note: "Option club accessible." },
  "vector": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["polyvalent", "performance"], pointRange: [90, 120], note: "Plus cible exterieure." },
  "x10": { material: "hybrid", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["competition"], pointRange: [100, 120], note: "Reference competition exterieure." },
  "a/c/e": { material: "hybrid", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Classique exterieur recurve." },
  "xx75 platinum plus": { material: "alu", diameters: ["large"], environments: ["indoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [100, 150], note: "Tube salle classique." },
  "vap sport": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "performance"], pointRange: [90, 120], note: "Fine et accessible." },
  "vap v3": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["performance"], pointRange: [90, 120], note: "Profil vent." },
  "vap target": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["performance", "competition"], pointRange: [100, 120], note: "Cible exterieure." },
  "vap jr": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club"], pointRange: [70, 100], note: "Petites puissances." },
  "predator ii": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Budget polyvalent." },
  "nano-pro rz": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Tube fin exterieur." },
  "nano-pro xtreme": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve", "compound"], goals: ["competition"], pointRange: [100, 120], note: "Competition exterieure." },
  "medallion xr": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Carbone cible pour petites et moyennes puissances." },
  "nano sst": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Serie Carbon Express Nano SST du tableau recurve." },
  "maxima pro recurve rz": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Serie Maxima Pro Recurve RZ du tableau Carbon Express." },
  "radius 400": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [100, 120], note: "Tube club coherent." },
  "radius 650-600": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Tube club coherent." },
  "radius 700-650": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Tube club coherent." },
  "radius 850-800": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve", "compound"], goals: ["club", "polyvalent"], pointRange: [80, 110], note: "Tube club coherent." },
  "edge 400-350": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["performance"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "edge 600-500": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["performance"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "edge 700-650": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["performance"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "maverick 300": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["club", "polyvalent"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "maverick 350-300": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["club", "polyvalent"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "bruxx 300": { material: "carbon", diameters: ["large"], environments: ["indoor", "outdoor"], disciplines: ["field", "target"], bowTypes: ["compound"], goals: ["competition"], pointRange: [120, 180], note: "Tube compound indoor / 3D." },
  "empros 300": { material: "carbon", diameters: ["large"], environments: ["indoor", "outdoor"], disciplines: ["field", "target"], bowTypes: ["compound"], goals: ["competition"], pointRange: [120, 180], note: "Tube compound indoor / 3D." }
};

const MODEL_FAMILY_METADATA = {
  "performa": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Tube fin recurve / compound exterieur." },
  "precium": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Tube fin recurve / compound exterieur." },
  "brixxon": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 120], note: "Tube carbone club polyvalent." },
  "radius": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 120], note: "Tube carbone club coherent." },
  "edge": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["performance"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "maverick": { material: "carbon", diameters: ["standard"], environments: ["outdoor"], disciplines: ["field", "hunting"], bowTypes: ["compound"], goals: ["club", "polyvalent"], pointRange: [80, 100], note: "Tube compound chasse / 3D." },
  "bruxx": { material: "carbon", diameters: ["large"], environments: ["indoor", "outdoor"], disciplines: ["field", "target"], bowTypes: ["compound"], goals: ["competition"], pointRange: [120, 180], note: "Tube compound indoor / 3D." },
  "empros": { material: "carbon", diameters: ["large"], environments: ["indoor", "outdoor"], disciplines: ["field", "target"], bowTypes: ["compound"], goals: ["competition"], pointRange: [120, 180], note: "Tube compound indoor / 3D." },
  "premiens": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Tube fin performance recurve." },
  "paragon": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Tube fin recurve / compound exterieur." },
  "maxima red": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Tube carbone polyvalent." },
  "nano sst": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Serie Carbon Express Nano SST du tableau recurve." },
  "maxima pro recurve rz": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [90, 120], note: "Serie Maxima Pro Recurve RZ du tableau Carbon Express." },
  "hunter xt": { material: "carbon", diameters: ["standard"], environments: ["mixed"], disciplines: ["target", "field"], bowTypes: ["recurve"], goals: ["club"], pointRange: [90, 120], note: "Option carbone accessible." },
  "trojan": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [90, 120], note: "Carbone club exterieur." },
  "superdrive micro": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Tube fin exterieur." },
  "rx7": { material: "alu", diameters: ["large"], environments: ["indoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "performance"], pointRange: [100, 150], note: "Tube alu salle." },
  "x23": { material: "alu", diameters: ["large"], environments: ["indoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance", "competition"], pointRange: [120, 180], note: "Grand diametre salle competition." },
  "vap gamer v3": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 110], note: "Carbone accessible club." },
  "vft gamer v3": { material: "carbon", diameters: ["standard"], environments: ["outdoor", "mixed"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["club", "polyvalent"], pointRange: [80, 110], note: "Carbone accessible club." },
  "v-tac 23 elite": { material: "carbon", diameters: ["large"], environments: ["indoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [100, 150], note: "Tube salle carbone gros diametre." },
  "vxt elite v1": { material: "carbon", diameters: ["thin"], environments: ["outdoor"], disciplines: ["target"], bowTypes: ["recurve"], goals: ["performance"], pointRange: [90, 120], note: "Tube fin exterieur." }
};

// Recurve rows are transcribed from the Skylon 2023 chart page 31.
// Columns map to 23" -> 32", rows map to 16-19 lbs -> 66-70 lbs.
const SKYLON_GRID = [
  ["Y1","Y1","Y2","Y3","Y4","","","","",""],
  ["Y1","Y2","Y3","Y4","A1","A2","A3","A4","",""],
  ["Y2","Y3","Y4","A1","A2","A3","A4","A5","A6",""],
  ["","","A1","A2","A3","A4","A5","A6","A7",""],
  ["","A1","A2","A3","A4","A5","A6","A7","A8","A9"],
  ["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10"],
  ["A2","A3","A4","A5","A6","A7","A8","A9","A10","A11"],
  ["A3","A4","A5","A6","A7","A8","A9","A10","A11","A12"],
  ["A4","A5","A6","A7","A8","A9","A10","A11","A12","A13"],
  ["A5","A6","A7","A8","A9","A10","A11","A12","A13",""],
  ["A6","A7","A8","A9","A10","A11","A12","A13","",""]
];
const SKYLON_COMPOUND_RANGES = { lt276: [[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,76],[76,82]], "276_300": [null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,76]], "301_340": [null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70]], "340_360": [null,null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65]] };
const SKYLON_RECURVE_RANGES = [[16,19],[20,23],[24,29],[30,35],[36,40],[41,45],[46,50],[51,55],[56,60],[61,65],[66,70]];
const SKYLON_GROUP_MODELS = { A1: ["Brixxon R1000/R900","Radius 900","Performa 1000","Precium 1000","Paragon 1000"], A2: ["Brixxon R900-850","Radius 850-800","Performa 900","Precium 900","Paragon 900"], A3: ["Brixxon R850-800","Radius 850-800","Performa 850","Precium 850","Paragon 850"], A4: ["Brixxon R750-700","Radius 700-650","Performa 750","Precium 750","Paragon 750"], A5: ["Brixxon R700-650","Radius 650-600","Performa 700","Precium 700","Paragon 700","Premiens 650"], A6: ["Brixxon R650-600","Radius 650-600","Performa 600","Precium 600","Paragon 600","Premiens 600"], A7: ["Brixxon R550-500","Radius 500","Performa 550","Precium 550","Paragon 550","Premiens 550"], A8: ["Brixxon R500-450","Radius 500","Performa 500","Precium 500","Paragon 500","Premiens 500"], A9: ["Brixxon R450-400","Radius 400","Performa 450","Precium 450","Paragon 450","Premiens 450"], A10: ["Brixxon R400","Radius 400","Performa 400","Precium 400","Paragon 400","Premiens 400"], A11: ["Performa 350","Precium 350","Paragon 350","Premiens 350"], A12: ["Performa 350","Precium 350","Paragon 350","Premiens 350"], A13: ["Performa 350","Precium 350","Paragon 350","Premiens 350"] };
const EASTON_RECURVE_CARBON_LENGTHS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
const EASTON_RECURVE_CARBON_ROWS = [
  { range: [0, 20], label: "<20 lbs", cells: ["2000", "2000", "2000-1800", "1800-1700", "1750-1400", "1450-1200", "1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500"] },
  { range: [21, 26], label: "21-26 lbs", cells: ["2000", "2000-1800", "1800-1700", "1750-1400", "1450-1200", "1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450"] },
  { range: [27, 31], label: "27-31 lbs", cells: ["2000-1800", "1800-1700", "1750-1400", "1450-1200", "1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400"] },
  { range: [32, 35], label: "32-35 lbs", cells: ["1800-1700", "1750-1400", "1450-1200", "1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370"] },
  { range: [36, 39], label: "36-39 lbs", cells: ["1750-1400", "1450-1200", "1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340"] },
  { range: [40, 43], label: "40-43 lbs", cells: ["1450-1200", "1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310"] },
  { range: [44, 47], label: "44-47 lbs", cells: ["1250-1050", "1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310", "340-300"] },
  { range: [48, 52], label: "48-52 lbs", cells: ["1080-880", "900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310", "340-300", "300-250"] },
  { range: [53, 57], label: "53-57 lbs", cells: ["900-750", "800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310", "340-300", "300-250", "250-200"] },
  { range: [58, 62], label: "58-62 lbs", cells: ["800-700", "720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310", "340-300", "300-250", "250-200", "250-200"] },
  { range: [63, 67], label: "63-67 lbs", cells: ["720-625", "675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310", "340-300", "300-250", "250-200", "250-200", "200-150"] },
  { range: [68, 73], label: "68-73 lbs", cells: ["675-600", "640-570", "575-500", "525-450", "475-400", "440-370", "400-340", "370-310", "340-300", "300-250", "250-200", "250-200", "250-200", "200-150"] }
];
const EASTON_RECURVE_ALU_LENGTHS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
const EASTON_RECURVE_ALU_ROWS = [
  { range: [0, 20], label: "<20 lbs", cells: ["", "", "1214", "1214", "1416|1516|1514", "1514", "1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21"] },
  { range: [21, 26], label: "21-26 lbs", cells: ["", "1214", "1214", "1416|1516|1514", "1514", "1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1916|2016|2013|RX7-21", "1916|2013|2014|RX7-21"] },
  { range: [27, 31], label: "27-31 lbs", cells: ["1214", "1214", "1416|1516|1514", "1514", "1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22"] },
  { range: [32, 35], label: "32-35 lbs", cells: ["1214", "1416|1516|1514", "1514", "1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23"] },
  { range: [36, 39], label: "36-39 lbs", cells: ["1416|1516|1514", "1514", "1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2214|2213|2312|RX7-23", "2213|2214|2312|RX7-23"] },
  { range: [40, 43], label: "40-43 lbs", cells: ["1514", "1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413"] },
  { range: [44, 47], label: "44-47 lbs", cells: ["1614", "1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413", "2314|2413|2315"] },
  { range: [48, 52], label: "48-52 lbs", cells: ["1616|1714", "1716", "1816|1814", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413", "2512|2613|2712", "2512|2613|2712"] },
  { range: [53, 57], label: "53-57 lbs", cells: ["1716", "1816|1913", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2213|RX7-23", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413", "2314|2413|2315", "2512|2613|2712", "2512|2613|2712"] },
  { range: [58, 62], label: "58-62 lbs", cells: ["1816|1913", "1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413", "2314|2413|2315", "2512|2613|2712", "2512|2613|2712", "2512|2613|2712"] },
  { range: [63, 67], label: "63-67 lbs", cells: ["1914|1913", "1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413", "2314|2413|2315", "2512|2613|2712", "2512|2613|2712", "2512|2613|2712", "2613|2712"] },
  { range: [68, 73], label: "68-73 lbs", cells: ["1914|1916|2013|RX7-21", "1916|2013|2014|RX7-21", "2114|2016|RX7-22", "2114|2213|RX7-23", "2213|2214|2312|RX7-23", "2214|2314|2413", "2314|2413|2315", "2512|2613|2712", "2512|2613|2712", "2512|2613|2712", "2613|2712", ""] }
];
const VICTORY_RECURVE_LENGTHS = [23, 24, 25, 26, 27, 28, 29, 30, 31];
const VICTORY_RECURVE_ROWS = [
  { range: [12, 14], label: "12-14 lbs", cells: ["", "", "", "1200", "1100", "1000", "900", "900", "800"] },
  { range: [14, 16], label: "14-16 lbs", cells: ["1200", "1200", "1200", "1100", "1000", "900", "800", "800", "800"] },
  { range: [16, 18], label: "16-18 lbs", cells: ["1200", "1100", "1100", "1000", "900", "800", "800", "800", "700"] },
  { range: [18, 22], label: "18-22 lbs", cells: ["1100", "1000", "1000", "900", "800", "800", "700", "700", "700"] },
  { range: [22, 26], label: "22-26 lbs", cells: ["1000", "900", "900", "800", "800", "700", "700", "700", "600"] },
  { range: [27, 31], label: "27-31 lbs", cells: ["900", "800", "800", "800", "700", "700", "600", "600", "600"] },
  { range: [32, 36], label: "32-36 lbs", cells: ["800", "800", "800", "700", "700", "600", "600", "600", "500"] },
  { range: [37, 41], label: "37-41 lbs", cells: ["800", "700", "700", "700", "600", "600", "500", "500", "500"] },
  { range: [42, 46], label: "42-46 lbs", cells: ["700", "700", "700", "600", "600", "500", "500", "500", "400"] },
  { range: [47, 51], label: "47-51 lbs", cells: ["700", "600", "600", "600", "500", "500", "400", "400", "400"] },
  { range: [52, 56], label: "52-56 lbs", cells: ["600", "600", "600", "500", "500", "400", "400", "400", "350"] },
  { range: [57, 61], label: "57-61 lbs", cells: ["600", "500", "500", "500", "400", "400", "350", "350", "350"] }
];
const VICTORY_VXT_LENGTHS = [23, 24, 25, 26, 27, 28, 29, 30, 31];
const VICTORY_VXT_ROWS = [
  { range: [22, 26], label: "22-26 lbs", cells: ["", "", "", "", "", "", "", "630", "630"] },
  { range: [27, 31], label: "27-31 lbs", cells: ["", "", "", "", "", "630", "630", "630", "550"] },
  { range: [32, 36], label: "32-36 lbs", cells: ["", "", "630", "630", "630", "630", "550", "550", "550"] },
  { range: [37, 41], label: "37-41 lbs", cells: ["630", "630", "550", "550", "550", "550", "450", "450", "450"] },
  { range: [42, 46], label: "42-46 lbs", cells: ["550", "550", "550", "550", "450", "450", "450", "355", "355"] },
  { range: [47, 51], label: "47-51 lbs", cells: ["550", "550", "450", "450", "450", "450", "355", "355", "355"] },
  { range: [52, 56], label: "52-56 lbs", cells: ["450", "450", "450", "450", "355", "355", "355", "300", "300"] },
  { range: [57, 61], label: "57-61 lbs", cells: ["450", "450", "355", "355", "355", "355", "300", "300", "300"] },
  { range: [62, 66], label: "62-66 lbs", cells: ["355", "355", "355", "355", "300", "300", "300", "300", ""] }
];
const CARBON_LIGHT_RECURVE_LENGTHS = [21, 22, 23, 24, 25, 26, 27];
const CARBON_LIGHT_RECURVE_ROWS = [
  { range: [10, 17], label: "10-17 lbs", cells: ["MXR2000", "MXR2000", "MXR2000", "MXR2000", "MXR1800", "MXR1500", "MXR1300|NS1200"] },
  { range: [18, 23], label: "18-23 lbs", cells: ["MXR2000", "MXR2000", "MXR1800", "MXR1500", "MXR1300|NS1200", "MXR1100|NS1100", "XYR1000|MXR1000|NS1000"] },
  { range: [24, 28], label: "24-28 lbs", cells: ["MXR2000", "MXR1800", "MXR1500", "MXR1300|NS1200", "MXR1100|NS1100", "PT1000|MXR1000|NS1000", "PT900|MXR900"] },
  { range: [29, 34], label: "29-34 lbs", cells: ["MXR1800", "MXR1500", "MXR1300|NS1200", "MXR1100|NS1100", "PT1000|MXR1000|NS1000", "PT900|MXR900|NS900", "PT800|MXR800|NS800"] }
];
const CARBON_RECURVE_SERIES_LENGTHS = [23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
const CARBON_RECURVE_SERIES_ROWS = [
  { range: [18, 23], label: "18-23 lbs", cells: ["", "", "", "NSST1000", "NPX900|NSST900", "NPX800|NSST800", "NPX750|NSST750", "", "", ""] },
  { range: [24, 28], label: "24-28 lbs", cells: ["", "", "NSST1000", "NPX900|NSST900", "NPX800|NSST800", "NPX750|NSST750", "NPX7500|NSST700|MPR650", "NPX650|NSST650|MPR650", "MPR580", ""] },
  { range: [29, 34], label: "29-34 lbs", cells: ["", "NSST1000", "NPX900|NSST900", "NPX800|NSST800", "NPX750|NSST750", "NPX7500|NSST700", "NPX650|NSST650|MPR650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR580", ""] },
  { range: [35, 39], label: "35-39 lbs", cells: ["NSST1000", "NPX900|NSST900", "NPX800|NSST800", "NPX750|NSST750", "NPX7500|NSST700", "NPX650|NSST650|MPR650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR500", "NPX500|NSST500", "NPX450|NST420"] },
  { range: [40, 45], label: "40-45 lbs", cells: ["NPX900|NSST900", "NPX800|NSST800", "NPX750|NSST750", "NPX7500|NSST700|MPR650", "NPX650|NSST650|MPR650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR500", "NPX500|NSST500|MPR500", "NPX450|NSST420|MPR420", "NPX400|NSST420"] },
  { range: [46, 51], label: "46-51 lbs", cells: ["NPX800|NSST800", "NPX750|NSST750", "NPX7500|NSST700|MPR650", "NPX650|NSST650|MPR650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR500", "NPX500|NSST500", "NPX450|NSST420", "NPX400|NSST400", "NPX400|NSST350"] },
  { range: [52, 57], label: "52-57 lbs", cells: ["NPX750|NSST750", "NPX7500|NSST700|MPR650", "NPX650|NSST650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR500", "NPX500|NSST500", "NPX450|NSST420", "NPX400|NSST400", "NPX400|NSST350", "NPX350|MPR350"] },
  { range: [58, 63], label: "58-63 lbs", cells: ["NPX7500|NSST700|MPR650", "NPX650|NSST650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR500", "NPX500|NSST500", "NPX450|NSST420", "NPX400|NSST400", "NPX400|MPR350", "NPX350|MPR350", "NPX350|MPR350"] },
  { range: [64, 69], label: "64-69 lbs", cells: ["NPX650|NSST650|MPR650", "NPX600|NSST600|MPR580", "NPX550|NSST550|MPR500", "NPX500|NSST500", "NPX450|NSST420", "NPX400|NSST400|MPR420", "NPX400|NSST400|MPR350", "NPX350|MPR350", "NPX350|MPR350", ""] }
];

const LIVE_DEALS = [
  {
    "brand": "skylon",
    "modelKey": "brixxon",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "eco",
    "title": "Skylon Brixxon carbone 4,2 lot de 12 tubes",
    "price": "67,50 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/skylon-tubes-brixxon-carbone-42-lot-de-12-tubes",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "skylon",
    "modelKey": "paragon",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Skylon Paragon lot de 12 tubes",
    "price": "134,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/2690-skylon-douzaine-de-tubes-paragon.html",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "skylon",
    "modelKey": "premiens",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Skylon Preminens lot de 12 tubes",
    "price": "179,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/2689-skylon-preminens-lot-de-12-tubes.html",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "easton",
    "modelKey": "avance",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Easton Avance tube carbone competition",
    "price": "13,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/easton-avance-tube-carbone-competition",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "easton",
    "modelKey": "avance",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Easton Tube Avance",
    "price": "12,90 EUR",
    "url": "https://www.heraclesarcherie.fr/tubes-carbone/easton-tube-avance-detail",
    "shop": "heraclesarcherie.fr"
  },
  {
    "brand": "easton",
    "modelKey": "avance",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Tubes Easton Avance Sport 4mm en carbone",
    "price": "103,95 EUR",
    "url": "https://www.archerie.fr/fr/4838-tubes-easton-avance-sport-4mm-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "easton",
    "modelKey": "x7",
    "material": "alu",
    "bowTypes": [
      "recurve",
      "compound"
    ],
    "tier": "mid",
    "title": "Easton X7 lot de 12 tubes",
    "price": "139,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/easton-x7-lot-de-12-tubes",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "easton",
    "modelKey": "x23",
    "material": "alu",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Easton X23 tube aluminium",
    "price": "12,50 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/easton-x23-tube-aluminium",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "easton",
    "modelKey": "rx7",
    "material": "alu",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Easton RX7 douzaine de tubes aluminium",
    "price": "169,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/easton-rx7-tube-aluminium",
    "shop": "erhart-sports.com"
  },
    {
      "brand": "victory",
      "modelKey": "vap sport",
      "material": "carbon",
      "bowTypes": [
        "recurve",
        "compound"
    ],
    "tier": "premium",
    "title": "Victory VAP Target V1 lot de 12 tubes",
    "price": "161,40 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/2143-443507-victory-vap-target-v1-lot-de-12-tubes.html",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "victory",
    "modelKey": "vap target",
    "material": "carbon",
    "bowTypes": [
      "recurve",
      "compound"
    ],
    "tier": "premium",
    "title": "Victory VAP Target V1 unite",
    "price": "14,65 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/victory-vap-target-v1-2017-unit2",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "victory",
    "modelKey": "vap target",
    "material": "carbon",
    "bowTypes": [
      "recurve",
      "compound"
    ],
    "tier": "premium",
    "title": "Tube VAP Target Elite Victory",
    "price": "259,90 EUR",
    "url": "https://www.archerie.fr/fr/2375-tube-vap-target-elite-victory.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "victory",
    "modelKey": "v-tac 23 elite",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Victory V-TAC 23 Elite lot de 12 tubes",
    "price": "164,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/victory-v-tac-23-elite-lot-de-12-tubes",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "victory",
    "modelKey": "vap gamer v3",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Victory VAP Gamer V3 tube carbone",
    "price": "12,70 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/3949-victory-vap-gamer-v3-tube-carbone.html",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "victory",
    "modelKey": "vft gamer v3",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "eco",
    "title": "Victory VFT Gamer V3 Target tube carbone",
    "price": "8,90 EUR",
    "url": "https://www.erhart-sports.com/tubes-nus/3953-victory-vft-target-tube-carbone.html",
    "shop": "erhart-sports.com"
  },
  {
    "brand": "carbon",
    "modelKey": "predator ii",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "eco",
    "title": "Carbon Express Predator II",
    "price": "49,90 EUR",
    "url": "https://www.archerie.fr/fr/2262-tube-predator-ii-carbon-express.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "skylon",
    "modelKey": "radius",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "eco",
    "title": "Lot de 12 fleches Skylon Radius 4,2 mm en carbone",
    "price": "46,63 EUR",
    "url": "https://www.archerie.fr/fr/4766-lot-de-12-fleches-skylon-radius-42-mm-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "skylon",
    "modelKey": "radius",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "eco",
    "title": "Lot de 12 tubes Skylon Radius ID4.2 en carbone",
    "price": "33,29 EUR",
    "url": "https://www.archerie.fr/fr/4760-lot-de-12-tubes-skylon-radius-id42-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "easton",
    "modelKey": "superdrive micro",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Lot de 12 tubes Easton Superdrive Micro en carbone",
    "price": "228,95 EUR",
    "url": "https://www.archerie.fr/fr/8503-lot-de-12-tubes-easton-superdrive-micro-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "easton",
    "modelKey": "vector",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Lot de 12 tubes Easton Vector 4 mm en carbone",
    "price": "53,95 EUR",
    "url": "https://www.archerie.fr/fr/9000-lot-de-12-tubes-easton-vector-4-mm-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "easton",
    "modelKey": "xx75 platinum plus",
    "material": "alu",
    "bowTypes": [
      "recurve",
      "compound"
    ],
    "tier": "mid",
    "title": "Tube XX75 Platinum Plus Easton",
    "price": "77,46 EUR",
    "url": "https://www.archerie.fr/fr/2004-tube-xx75-platinum-plus-easton.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "victory",
    "modelKey": "vap target",
    "material": "carbon",
    "bowTypes": [
      "recurve",
      "compound"
    ],
    "tier": "premium",
      "title": "Tube Victory VAP Target Sport",
      "price": "189,90 EUR",
      "url": "https://www.archerie.fr/fr/2377-tube-victory-vap-target-sport.html",
      "shop": "archerie.fr"
    },
    {
      "brand": "victory",
      "modelKey": "vap v3",
      "material": "carbon",
      "bowTypes": [
        "recurve",
        "compound"
      ],
      "tier": "premium",
      "title": "Victory VAP V3",
      "price": "11,95 EUR",
      "url": "https://www.shadow-archery.com/en/product/victory-vap-v3/",
      "shop": "shadow-archery.com"
    },
    {
      "brand": "carbon",
      "modelKey": "medallion xr",
      "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Tube Medallion-XR (2016) Carbon Express",
    "price": "109,90 EUR",
    "url": "https://www.archerie.fr/fr/2343-tube-medallion-xr-2016-carbon-express.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "skylon",
    "modelKey": "brixxon",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "eco",
    "title": "Lot de 12 tubes Skylon Brixxon ID4.2 en carbone",
    "price": "59,95 EUR",
    "url": "https://www.archerie.fr/fr/4612-lot-de-12-tubes-skylon-brixxon-id42-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "skylon",
    "modelKey": "paragon",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Lot de 12 tubes Skylon Paragon ID3.2 en carbone",
    "price": "129,95 EUR",
    "url": "https://www.archerie.fr/fr/4616-lot-de-12-tubes-skylon-paragon-id32-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "skylon",
    "modelKey": "precium",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Lot de 12 tubes Skylon Precium ID3.2 en carbone",
    "price": "119,95 EUR",
    "url": "https://www.archerie.fr/fr/4615-lot-de-12-tubes-skylon-precium-id-32-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "skylon",
    "modelKey": "performa",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Lot de 12 tubes Skylon Performa ID3.2 en carbone",
    "price": "83,95 EUR",
    "url": "https://www.archerie.fr/fr/4614-lot-de-12-tubes-skylon-performa-id32-en-carbone.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "carbon",
    "modelKey": "nano sst",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Tube Nano-SST Carbon Express",
    "price": "323,95 EUR",
    "url": "https://www.archerie.fr/fr/2087-tube-nano-sst-carbon-express.html",
    "shop": "archerie.fr"
  },
  {
    "brand": "victory",
    "modelKey": "vxt elite v1",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Douzaine tubes Victory VXT Elite V1",
    "price": "285,00 EUR",
    "url": "https://www.bourgognearcherie.com/tube-carbone-cible/2494-douzaine-tubes-victory-vxt-elite-v1.html",
    "shop": "bourgognearcherie.com"
  },
  {
    "brand": "victory",
    "modelKey": "vap gamer v3",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "mid",
    "title": "Douzaine tubes Victory Target VAP 3 Target Gamer",
    "price": "145,00 EUR",
    "url": "https://www.bourgognearcherie.com/tube-carbone-cible/2016-douzaine-victory-vap-1.html",
    "shop": "bourgognearcherie.com"
  },
  {
    "brand": "carbon",
    "modelKey": "maxima pro recurve rz",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Carbon Express Shaft Maxima Pro RZ",
    "price": "188,04 EUR",
    "url": "https://www.archers-delight.com/shop/carbon-express-shaft-maxima-pro-rz/",
    "shop": "archers-delight.com"
  },
  {
    "brand": "carbon",
    "modelKey": "nano-pro xtreme",
    "material": "carbon",
    "bowTypes": [
      "recurve"
    ],
    "tier": "premium",
    "title": "Carbon Express Shaft Nano-Pro Series X-Treme 800 12/Pk ID 3",
    "price": "354,98 EUR",
    "url": "https://hristo.hr/proizvod/carbon-express-shaft-nano-pro-series-x-treme-800-12-pk-id-3/",
    "shop": "hristo.hr"
  }
];

const CATALOG_ENDPOINT = "catalog.json";
const DEALS_ENDPOINT = "deals.json";
const DEALS_CONFIG_ENDPOINT = "deals-config.json";
const DEFAULT_CATALOG_STATE = {
  version: 2,
  updatedAt: "2026-03-12T20:30:00+01:00",
  source: "embedded-fallback",
  catalog: cloneCatalog(DEFAULT_CATALOG),
  models: cloneCatalog(MODEL_METADATA),
  families: cloneCatalog(MODEL_FAMILY_METADATA),
  skylon: {
    grid: cloneCatalog(SKYLON_GRID),
    compoundRanges: cloneCatalog(SKYLON_COMPOUND_RANGES),
    recurveRanges: cloneCatalog(SKYLON_RECURVE_RANGES),
    groupModels: cloneCatalog(SKYLON_GROUP_MODELS)
  }
};
const DEFAULT_DEALS_STATE = {
  updatedAt: "2026-03-20T20:15:00+01:00",
  source: "embedded-fallback",
  deals: LIVE_DEALS
};

let catalogState = cloneCatalog(DEFAULT_CATALOG_STATE);
let arrowCatalog = cloneCatalog(catalogState.catalog);
let dealsState = { ...DEFAULT_DEALS_STATE };
let currentNotebookId = null;
let lastRecommendationSnapshot = null;
let lastArcSetupSnapshot = null;
let dataLoadPromise = null;
let dataLoadedAt = 0;
const DATA_CACHE_MS = 5 * 60 * 1000;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function toImperial(drawWeight, arrowLength) { return { drawWeight, arrowLength }; }
function normalizeModelKey(modelName) { return String(modelName || "").toLowerCase().replace(/\s*\([^)]*\)/g, "").trim(); }
function compactText(value) { return normalizeModelKey(value).replace(/[^a-z0-9]+/g, " ").trim(); }
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function modelSeriesKey(modelName) {
  const key = normalizeModelKey(modelName)
    .replace(/\br?\d{3,4}(?:\s*[-/]\s*\d{3,4})?\b/g, " ")
    .replace(/\b\d{3,4}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const family = Object.keys(catalogState.families || {}).find((prefix) => key.startsWith(prefix) || key.includes(prefix));
  if (family) return family;
  return key.split(" ")[0] || key;
}
function calibrationArchetypeForModel(modelName, meta = null) {
  const seriesKey = modelSeriesKey(modelName);
  const directMatch = Object.entries(MODEL_CALIBRATION_BY_FAMILY).find(([token]) => seriesKey.includes(token));
  if (directMatch) return directMatch[1];
  if (meta?.diameters?.includes("large")) return "skylon_indoor_large";
  if (meta?.diameters?.includes("thin") && meta?.seriesTier === "competition") return "skylon_thin_competition";
  if (meta?.diameters?.includes("thin")) return "skylon_thin_performance";
  if (meta?.seriesTier === "performance") return "skylon_standard_perf";
  return "skylon_standard_club";
}
function uniqueModelEntries(entries, limit = entries.length) {
  const seen = new Set();
  return entries.filter((entry) => {
    const seriesKey = modelSeriesKey(entry.model);
    if (seen.has(seriesKey)) return false;
    seen.add(seriesKey);
    return true;
  }).slice(0, limit);
}
function dealModelTokens(modelName) {
  const normalized = compactText(modelName);
  if (!normalized) return [];
  const reduced = normalized
    .replace(/\b(r?\d{3,4}(?:\s*[-/]\s*\d{3,4})?)\b/g, " ")
    .replace(/\b(v\d+)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return [...new Set([normalized, reduced].filter((token) => token && token.length >= 3))];
}
function getModelMetadata(modelName) {
  const key = normalizeModelKey(modelName);
  if (catalogState.models[key]) return catalogState.models[key];
  const family = Object.keys(catalogState.families).find((prefix) => key.startsWith(prefix) || key.includes(prefix));
  return family ? catalogState.families[family] : null;
}
function brandLabel(key) { return key === "carbon" ? "Carbon Express" : key.charAt(0).toUpperCase() + key.slice(1); }
function materialLabel(key) { return key === "alu" ? "Alu" : "Carbone"; }
function diameterLabel(key) { return key === "large" ? "Large / salle" : key === "thin" ? "Fin / vent" : "Standard"; }
function environmentLabel(key) { return key === "indoor" ? "Interieur / salle" : key === "mixed" ? "Polyvalent" : "Exterieur"; }
function disciplineLabel(key) { return key === "field" ? "Campagne / 3D" : key === "hunting" ? "Chasse" : "Cible"; }
function goalLabel(key) { return key === "competition" ? "Competition" : key === "performance" ? "Performance" : "Club"; }
function goalsSummary(goals) {
  if (!goals?.length) return "Club";
  return goals.slice(0, 2).map(goalLabel).join(" / ");
}
function seriesLabel(key) {
  return key === "competition" ? "Competition" : key === "performance" ? "Performance" : "Club";
}
function massLabel(key) {
  return key === "light" ? "Legere" : key === "heavy" ? "Lourde" : "Moyenne";
}
function toleranceLabel(key) {
  return key === "precision" ? "Precision" : key === "matched" ? "Selectionnee" : "Standard";
}
function componentSystemLabel(key) {
  return key === "pin" ? "Pin / pin-nock" : key === "swage" ? "Swage / alu classique" : key === "large-nock" ? "Gros fut / bushing large" : "Insert standard";
}
function distanceBandLabel(key) {
  return key === "indoor" ? "18 m / salle" : key === "long" ? "Exterieur / longues distances" : "Polyvalent";
}
function useCaseLabel(key) {
  return key === "linecut" ? "Salle / line-cut" : key === "wind" ? "Vent / exterieur" : key === "target" ? "Cible exterieure" : key === "budget" ? "Club / budget" : key === "training" ? "Entrainement" : "Polyvalent";
}
function profileLabel(key) {
  if (key === "recurve_outdoor") return "Recurve exterieur";
  if (key === "recurve_indoor") return "Recurve salle";
  return "Recurve";
}
function setActiveTab(tabName) {
  els.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  els.tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabName;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
  localStorage.setItem(STORAGE.activeTab, tabName);
}

function themeMetaColor(theme) {
  if (theme === "campagne") return "#5f6f3a";
  if (theme === "3d") return "#b34f1d";
  return "#d62828";
}

function applyTheme(theme) {
  const nextTheme = ["cible", "campagne", "3d"].includes(theme) ? theme : "cible";
  document.documentElement.dataset.theme = nextTheme;
  if (els.themeSelect) els.themeSelect.value = nextTheme;
  localStorage.setItem(STORAGE.theme, nextTheme);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", themeMetaColor(nextTheme));
}
function readFeedbackDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.feedback) || "{}");
  } catch {
    return {};
  }
}
function writeFeedbackDraft(draft) {
  localStorage.setItem(STORAGE.feedback, JSON.stringify(draft));
}
function selectedFeedbackCategory() {
  return els.feedbackCategoryInputs.find((input) => input.checked)?.value || "";
}
function setSelectedFeedbackCategory(category) {
  els.feedbackCategoryInputs.forEach((input) => {
    input.checked = input.value === category;
  });
}
function activeTabLabel() {
  const active = els.tabButtons.find((button) => button.classList.contains("is-active"));
  return active ? active.textContent.trim() : "Choix des fleches";
}
function feedbackPayload() {
  return {
    category: selectedFeedbackCategory(),
    message: els.feedbackMessage?.value.trim() || "",
    tab: activeTabLabel(),
    theme: els.themeSelect?.value || "cible"
  };
}
function feedbackRequestBody() {
  const payload = feedbackPayload();
  const params = new URLSearchParams();
  params.set(FEEDBACK_FORM.categoryField, payload.category || "");
  params.set(FEEDBACK_FORM.messageField, payload.message || "");
  params.set("pageHistory", "0");
  return params;
}
function renderFeedbackDraft() {
  const draft = readFeedbackDraft();
  setSelectedFeedbackCategory(draft.category || "");
  if (els.feedbackMessage) els.feedbackMessage.value = draft.message || "";
}
function persistFeedbackDraft() {
  writeFeedbackDraft({
    category: selectedFeedbackCategory(),
    message: els.feedbackMessage?.value || ""
  });
}
function toggleFeedbackPanel(forceOpen = null) {
  if (!els.feedbackPanel || !els.feedbackToggleBtn) return;
  const nextOpen = forceOpen === null ? els.feedbackPanel.hidden : forceOpen;
  els.feedbackPanel.hidden = !nextOpen;
  els.feedbackToggleBtn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
  if (nextOpen) renderFeedbackDraft();
}
function dealsUpdatedLabel() {
  const date = new Date(dealsState.updatedAt);
  if (!Number.isFinite(date.getTime())) return "date inconnue";
  return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}
function isValidDealEntry(entry) {
  return entry && typeof entry.brand === "string" && typeof entry.material === "string" && typeof entry.title === "string" && typeof entry.price === "string" && typeof entry.url === "string" && typeof entry.shop === "string";
}
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isValidCatalogPayload(payload) {
  return isPlainObject(payload)
    && isPlainObject(payload.catalog)
    && isPlainObject(payload.models)
    && isPlainObject(payload.families)
    && isPlainObject(payload.skylon)
    && Array.isArray(payload.skylon.grid)
    && isPlainObject(payload.skylon.compoundRanges)
    && Array.isArray(payload.skylon.recurveRanges)
    && isPlainObject(payload.skylon.groupModels);
}
async function refreshCatalogState() {
  try {
    const response = await fetch(`${CATALOG_ENDPOINT}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!isValidCatalogPayload(payload)) throw new Error("invalid catalog payload");
    catalogState = {
      version: payload.version || DEFAULT_CATALOG_STATE.version,
      updatedAt: payload.updatedAt || DEFAULT_CATALOG_STATE.updatedAt,
      source: payload.source || "external-json",
      catalog: cloneCatalog(payload.catalog),
      models: cloneCatalog(payload.models),
      families: cloneCatalog(payload.families),
      skylon: {
        grid: cloneCatalog(payload.skylon.grid),
        compoundRanges: cloneCatalog(payload.skylon.compoundRanges),
        recurveRanges: cloneCatalog(payload.skylon.recurveRanges),
        groupModels: cloneCatalog(payload.skylon.groupModels)
      }
    };
  } catch {
    catalogState = cloneCatalog(DEFAULT_CATALOG_STATE);
  }
  arrowCatalog = cloneCatalog(catalogState.catalog);
}
function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      const nextChar = line[index + 1];
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
      modelKey: entry.modelkey || normalizeModelKey(entry.title),
      material: entry.material,
      bowTypes: (entry.bowtypes || "recurve").split("|").map((value) => value.trim()).filter(Boolean),
      tier: entry.tier || "mid",
      title: entry.title,
      price: entry.price,
      url: entry.url,
      shop: entry.shop
    };
  }).filter(isValidDealEntry);
}
async function fetchDealsConfig() {
  try {
    const response = await fetch(`${DEALS_CONFIG_ENDPOINT}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}
async function fetchRemoteDeals(config) {
  if (config.remoteJsonUrl) {
    const response = await fetch(`${config.remoteJsonUrl}${config.remoteJsonUrl.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`remote json HTTP ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.deals)) throw new Error("invalid remote json payload");
    const validDeals = payload.deals.filter(isValidDealEntry);
    if (!validDeals.length) throw new Error("empty remote json payload");
    return {
      updatedAt: payload.updatedAt || new Date().toISOString(),
      source: payload.source || "remote-json",
      deals: validDeals
    };
  }

  if (config.remoteCsvUrl) {
    const response = await fetch(`${config.remoteCsvUrl}${config.remoteCsvUrl.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`remote csv HTTP ${response.status}`);
    const text = await response.text();
    const deals = csvToDeals(text);
    if (!deals.length) throw new Error("empty remote csv payload");
    return {
      updatedAt: new Date().toISOString(),
      source: "remote-csv",
      deals
    };
  }

  return null;
}
async function refreshDealsCatalog() {
  try {
    const config = await fetchDealsConfig();
    const remoteState = await fetchRemoteDeals(config);
    if (remoteState) {
      dealsState = remoteState;
      return;
    }

    const response = await fetch(`${DEALS_ENDPOINT}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.deals)) throw new Error("invalid deals payload");
    const validDeals = payload.deals.filter(isValidDealEntry);
    if (!validDeals.length) throw new Error("empty deals payload");
    dealsState = {
      updatedAt: payload.updatedAt || DEFAULT_DEALS_STATE.updatedAt,
      source: payload.source || "external-json",
      deals: validDeals
    };
  } catch {
    dealsState = { ...DEFAULT_DEALS_STATE };
  }
}

async function loadAppData({ force = false } = {}) {
  const now = Date.now();
  if (!force && dataLoadPromise && now - dataLoadedAt < DATA_CACHE_MS) return dataLoadPromise;

  dataLoadPromise = Promise.all([refreshCatalogState(), refreshDealsCatalog()])
    .finally(() => {
      dataLoadedAt = Date.now();
    });
  return dataLoadPromise;
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
  if (els.shootingProfileWrap) {
    els.shootingProfileWrap.hidden = true;
    els.shootingProfileWrap.style.display = "none";
  }
  els.shootingEnvironmentWrap.hidden = true;
  els.shootingEnvironmentWrap.style.display = "none";
  els.disciplineWrap.hidden = true;
  els.disciplineWrap.style.display = "none";
}

function updateMaterialOptions() {
  els.shaftMaterial.innerHTML = `
    <option value="all">Tous</option>
    <option value="carbon">Carbone</option>
    <option value="alu">Alu</option>
  `;
  if (!["all", "carbon", "alu"].includes(els.shaftMaterial.value)) {
    els.shaftMaterial.value = "all";
  }
  els.shaftMaterial.disabled = false;
}

function updateMaterialGuidance() {
  if (!els.materialGuidance) return;
  const materialValue = els.shaftMaterial.value;

  if (materialValue === "alu") {
    els.materialGuidance.innerHTML = `Repere FFTA : l'<strong>aluminium</strong> est surtout utilise en <strong>salle</strong>.`;
    return;
  }
  if (materialValue === "carbon") {
    els.materialGuidance.innerHTML = `Repere FFTA : le <strong>carbone</strong> convient a toutes les disciplines et a l'initiation.`;
    return;
  }
  els.materialGuidance.innerHTML = "Repere FFTA : l'aluminium est surtout utilise en salle, le carbone convient a toutes les disciplines et a l'initiation.";
}

function normalizeInput(input) {
  if (input.shaftMaterial === "alu") {
    return { ...input, shootingProfile: "recurve_indoor", shootingEnvironment: "indoor", discipline: "target" };
  }
  if (input.shaftMaterial === "carbon" || input.shaftMaterial === "all") {
    return { ...input, shootingProfile: "recurve_outdoor", shootingEnvironment: "outdoor", discipline: "target" };
  }
  return input;
}

function applyProfileDefaults() {
  els.shootingEnvironment.value = "outdoor";
  els.discipline.value = "target";
  updateMaterialOptions();
  updateMaterialGuidance();
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

function defaultPointWeightForInput(input) {
  let pointWeight = input.shootingEnvironment === "indoor" ? 110 : 100;
  if (input.drawWeight <= 28) pointWeight += 10;
  else if (input.drawWeight >= 40) pointWeight -= 10;
  if (input.arrowLength >= 29) pointWeight -= 10;
  else if (input.arrowLength <= 27) pointWeight += 10;
  return clamp(roundPointWeight(pointWeight), 70, 150);
}

function recommendationForBrand(input, brand) {
  const refCfg = BRAND_REFERENCE[brand] || BRAND_REFERENCE.easton;
  const load = dynamicLoadScore(input, refCfg);
  const raw = Math.round(1300 - load * 13 + refCfg.rawAdjust);
  return { brand, raw, load, ...nearestSpine(raw, getBrandSpines(brand)) };
}

function adjustedRawForModel(baseRaw, modelName, meta, profile) {
  let adjusted = baseRaw;
  if (!meta) return adjusted;
  const archetype = CALIBRATION_ARCHETYPES[calibrationArchetypeForModel(modelName, meta)] || CALIBRATION_ARCHETYPES.skylon_standard_club;
  adjusted += archetype.rawShift;
  if (meta.massClass === "light") adjusted += 10;
  if (meta.massClass === "heavy") adjusted -= 10;
  if (meta.toleranceClass === "precision") adjusted += 5;
  if (meta.useCase === "wind") adjusted += 10;
  if (meta.useCase === "linecut") adjusted -= 10;
  if (profile.preferredDiameter === "thin" && meta.diameters?.includes("thin")) adjusted += 10;
  if (profile.preferredDiameter === "large" && meta.diameters?.includes("large")) adjusted -= 10;
  return adjusted;
}

function resolveModelSpine(rawValue, brand) {
  return nearestSpine(rawValue, getBrandSpines(brand)).main;
}

function explicitModelSpine(modelName, brand) {
  if (brand !== "skylon") return null;
  const match = modelName.match(/\bR?(\d{3,4}(?:[-/]\d{3,4})?)\b/i);
  return match ? match[1] : null;
}

function deriveTargetProfile(input) {
  let preferredMaterial = input.shaftMaterial;
  if (preferredMaterial === "all") {
    if (input.discipline === "hunting") preferredMaterial = "carbon";
    else if (input.shootingEnvironment === "indoor" && input.bowType === "recurve" && input.discipline === "target") preferredMaterial = "alu";
    else preferredMaterial = "carbon";
  }

  let preferredDiameter = "standard";
  if (input.shootingEnvironment === "indoor" && input.discipline === "target") preferredDiameter = "large";
  if (input.shootingEnvironment === "outdoor" && input.discipline !== "hunting") preferredDiameter = "thin";

  let pointRange = [90, 120];
  if (input.discipline === "field") pointRange = [100, 120];
  if (input.discipline === "hunting") pointRange = [100, input.bowType === "compound" ? 150 : 125];
  if (input.shootingEnvironment === "indoor" && input.discipline === "target") pointRange = [input.bowType === "compound" ? 120 : 100, input.bowType === "compound" ? 150 : 120];

  let preferredSeries = input.shootingEnvironment === "indoor" ? "performance" : "performance";

  let preferredMass = "medium";
  if (input.shootingEnvironment === "indoor") preferredMass = "heavy";
  if (input.shootingEnvironment === "outdoor" && input.pointWeight <= 90) preferredMass = "light";
  if (input.shootingEnvironment === "outdoor" && input.pointWeight >= 110) preferredMass = "medium";

  let preferredTolerance = "matched";

  const preferredDistanceBand = input.shootingEnvironment === "indoor" ? "indoor" : "long";
  const preferredUseCase = input.shootingEnvironment === "indoor" ? "linecut" : preferredDiameter === "thin" ? "wind" : "target";

  return { preferredMaterial, preferredDiameter, pointRange, preferredSeries, preferredMass, preferredTolerance, preferredDistanceBand, preferredUseCase };
}

function roundPointWeight(value) {
  return Math.round(value / 10) * 10;
}

function clampPointWeight(value, pointRange) {
  return clamp(roundPointWeight(value), pointRange[0], pointRange[1]);
}

function inferPointChoices(pointRange, meta = null) {
  if (Array.isArray(meta?.pointChoices) && meta.pointChoices.length) return meta.pointChoices;
  const baseChoices = [70, 80, 90, 100, 110, 120, 130, 140, 150, 180];
  let choices = baseChoices.filter((value) => value >= pointRange[0] && value <= pointRange[1]);
  if (meta?.diameters?.includes("large")) choices = choices.filter((value) => value >= 100);
  if (meta?.diameters?.includes("thin")) choices = choices.filter((value) => value <= 120);
  if (!choices.length) choices = [roundPointWeight((pointRange[0] + pointRange[1]) / 2)];
  return [...new Set(choices)].sort((a, b) => a - b);
}

function nearestPointChoice(target, pointChoices) {
  return pointChoices.reduce((best, current) => (Math.abs(current - target) < Math.abs(best - target) ? current : best), pointChoices[0]);
}

function estimatePointSetup(input, pointRange, meta = null) {
  let target = (pointRange[0] + pointRange[1]) / 2;
  if (input.shootingEnvironment === "outdoor") target -= 5;
  if (input.shootingEnvironment === "indoor") target += 5;
  if (meta?.diameters?.includes("thin")) target -= 5;
  if (meta?.diameters?.includes("large")) target += 10;
  if (meta?.useCase === "wind") target -= 5;
  if (meta?.useCase === "linecut") target += 10;
  if (input.drawWeight >= 40) target -= 10;
  else if (input.drawWeight <= 28) target += 10;
  else if (input.drawWeight <= 32) target += 5;
  if (input.arrowLength >= 29) target -= 10;
  else if (input.arrowLength <= 27) target += 5;

  const pointChoices = inferPointChoices(pointRange, meta);
  const recommended = nearestPointChoice(clampPointWeight(target, pointRange), pointChoices);
  const span = pointRange[1] - pointRange[0];
  let profile = "standard";
  if (recommended <= pointRange[0] + span / 3) profile = "legere";
  if (recommended >= pointRange[1] - span / 3) profile = "lourde";
  const recommendedIndex = pointChoices.indexOf(recommended);
  const softerOption = recommendedIndex >= 0 && recommendedIndex < pointChoices.length - 1 ? pointChoices[recommendedIndex + 1] : null;
  const stifferOption = recommendedIndex > 0 ? pointChoices[recommendedIndex - 1] : null;

  return {
    recommended,
    pointChoices,
    profile,
    softerOption,
    stifferOption,
    note: "La pointe conseillee est une base de depart pour ce tube."
  };
}

function scoreModel(modelName, input, profile) {
  const meta = getModelMetadata(modelName);
  if (!meta) return { score: -1000, meta: null };
  if (!ALLOWED_SHAFT_MATERIALS.includes(meta.material)) return { score: -1000, meta };
  if (!meta.bowTypes.includes(input.bowType)) return { score: -1000, meta };
  if (input.shootingProfile === "recurve_outdoor" && meta.material !== "carbon") return { score: -1000, meta };
  if (input.shaftMaterial !== "all" && meta.material !== input.shaftMaterial) return { score: -1000, meta };
  if (!meta.environments.includes(input.shootingEnvironment) && !meta.environments.includes("mixed")) return { score: -1000, meta };

  let score = 0;
  if (meta.environments.includes(input.shootingEnvironment)) score += 5;
  if (meta.disciplines.includes(input.discipline)) score += 4;
  if (meta.material === profile.preferredMaterial) score += 4;
  if (meta.diameters.includes(profile.preferredDiameter)) score += 3;
  if (meta.pointRange && input.pointWeight >= meta.pointRange[0] && input.pointWeight <= meta.pointRange[1]) score += 3;
  if (meta.seriesTier === profile.preferredSeries) score += 2;
  if (meta.massClass === profile.preferredMass) score += 2;
  if (meta.toleranceClass === profile.preferredTolerance) score += 1;
  if (meta.distanceBand === profile.preferredDistanceBand) score += 2;
  if (meta.useCase === profile.preferredUseCase) score += 2;
  if (meta.dataPrecision === "model") score += 1;
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

function attachModelSpines(entries, brand, baseRaw, profile) {
  return entries.map((entry) => ({
    ...entry,
    advisedSpine: explicitModelSpine(entry.model, brand) || resolveModelSpine(adjustedRawForModel(baseRaw, entry.model, entry.meta, profile), brand)
  }));
}

function nearbySpineValues(brand, spine) {
  const values = getBrandSpines(brand);
  const target = Number(spine);
  return values
    .filter((value) => value !== target)
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
    .slice(0, 7);
}

function rankNearbyModels(brand, mainSpine, input, profile) {
  const candidates = nearbySpineValues(brand, mainSpine)
    .flatMap((value) => (arrowCatalog[brand]?.[String(value)] || []).map((model) => ({ model, sourceSpine: String(value) })));

  return candidates
    .map((candidate) => {
      const scored = scoreModel(candidate.model, input, profile);
      return { ...candidate, score: scored.score, meta: scored.meta };
    })
    .filter((entry) => entry.score > -1000)
    .sort((a, b) => b.score - a.score);
}

function enrichWithNearbyModels(ranked, brand, mainSpine, input, profile, minCount = 8) {
  if (ranked.length >= minCount) return ranked;
  const seen = new Set(ranked.map((entry) => normalizeModelKey(entry.model)));
  const nearby = rankNearbyModels(brand, mainSpine, input, profile)
    .filter((entry) => !seen.has(normalizeModelKey(entry.model)));
  const combined = [...ranked, ...nearby].sort((a, b) => b.score - a.score);
  const diversified = uniqueModelEntries(combined, Math.max(minCount, ranked.length));
  if (diversified.length >= Math.min(minCount, combined.length)) return diversified;
  return combined.slice(0, Math.max(minCount, ranked.length));
}

function rankCrossBrandAlternatives(input, profile, excludedBrand) {
  return BRAND_ORDER
    .filter((brand) => brand !== excludedBrand)
    .flatMap((brand) =>
      Object.entries(arrowCatalog[brand] || {}).flatMap(([spine, models]) =>
        models.map((model) => ({ brand, spine, model }))
      )
    )
    .map((candidate) => {
      const scored = scoreModel(candidate.model, input, profile);
      return { ...candidate, score: scored.score, meta: scored.meta };
    })
    .filter((entry) => entry.score > -1000)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
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
  const compoundRanges = catalogState.skylon.compoundRanges || {};
  const recurveRanges = catalogState.skylon.recurveRanges || [];
  const grid = catalogState.skylon.grid || [];
  const groupModels = catalogState.skylon.groupModels || {};
  const row = input.bowType === "compound" ? findRangeRow(compoundRanges[input.compoundSpeed] || [], input.drawWeight) : findRangeRow(recurveRanges, input.drawWeight);
  if (row < 0 || row >= grid.length) return { ok: false, message: "Puissance hors plages du tableau Skylon." };
  const group = grid[row][col] || "";
  if (!group) return { ok: false, message: "Case vide dans le tableau Skylon pour cette combinaison." };
  return { ok: true, group, models: groupModels[group] || [], warning: group.startsWith("Y") };
}

function eastonWeakChoiceFromCell(cell) {
  if (!cell) return null;
  const firstChunk = String(cell).split(",")[0].trim();
  const weak = firstChunk.split("-")[0].trim();
  return weak || null;
}

function eastonCarbonRecommendation(input) {
  const roundedLength = clamp(Math.round(input.arrowLength), 21, 34);
  const col = EASTON_RECURVE_CARBON_LENGTHS.indexOf(roundedLength);
  if (col < 0) return { ok: false, message: "Longueur hors tableau Easton carbone (21 a 34 pouces)." };
  const row = EASTON_RECURVE_CARBON_ROWS.find((entry) => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
  if (!row) return { ok: false, message: "Puissance hors plages du tableau Easton carbone." };
  const cell = row.cells[col];
  if (!cell) return { ok: false, message: "Case vide dans le tableau Easton carbone pour cette combinaison." };
  const weakChoice = eastonWeakChoiceFromCell(cell);
  const normalizedChoice = weakChoice ? String(nearestSpine(Number(weakChoice), getBrandSpines("easton")).main) : null;
  return { ok: true, rangeLabel: cell, weakChoice, normalizedChoice, rowLabel: row.label, roundedLength };
}

function eastonAluRecommendation(input) {
  const roundedLength = clamp(Math.round(input.arrowLength), 21, 32);
  const col = EASTON_RECURVE_ALU_LENGTHS.indexOf(roundedLength);
  if (col < 0) return { ok: false, message: "Longueur hors tableau Easton alu (21 a 32 pouces)." };
  const row = EASTON_RECURVE_ALU_ROWS.find((entry) => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
  if (!row) return { ok: false, message: "Puissance hors plages du tableau Easton alu." };
  const cell = row.cells[col];
  if (!cell) return { ok: false, message: "Case vide dans le tableau Easton alu pour cette combinaison." };
  const weakChoice = eastonWeakChoiceFromCell(cell);
  const normalizedChoice = weakChoice && weakChoice.includes("1214") ? "1000" : weakChoice && weakChoice.includes("1416") ? "900" : weakChoice && weakChoice.includes("1514") ? "800" : weakChoice && weakChoice.includes("1614") ? "700" : weakChoice && weakChoice.includes("1716") ? "700" : weakChoice && weakChoice.includes("1816") ? "600" : weakChoice && weakChoice.includes("1914") ? "500" : weakChoice && weakChoice.includes("2013") ? "500" : weakChoice && weakChoice.includes("2114") ? "400" : weakChoice && weakChoice.includes("2213") ? "400" : weakChoice && weakChoice.includes("2314") ? "350" : weakChoice && weakChoice.includes("2413") ? "350" : "500";
  return { ok: true, rangeLabel: cell, weakChoice, normalizedChoice, rowLabel: row.label, roundedLength };
}

function victoryRecurveRecommendation(input) {
  const roundedLength = clamp(Math.round(input.arrowLength), 23, 31);
  const col = VICTORY_RECURVE_LENGTHS.indexOf(roundedLength);
  if (col < 0) return { ok: false, message: "Longueur hors tableau Victory recurve (23 a 31 pouces)." };
  const row = VICTORY_RECURVE_ROWS.find((entry) => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
  if (!row) return { ok: false, message: "Puissance hors plages du tableau Victory recurve." };
  const cell = row.cells[col];
  if (!cell) return { ok: false, message: "Case vide dans le tableau Victory recurve pour cette combinaison." };
  const normalizedChoice = String(nearestSpine(Number(cell), getBrandSpines("victory")).main);
  return { ok: true, spine: cell, normalizedChoice, rowLabel: row.label, roundedLength };
}

function victoryVxtRecommendation(input) {
  const roundedLength = clamp(Math.round(input.arrowLength), 23, 31);
  const col = VICTORY_VXT_LENGTHS.indexOf(roundedLength);
  if (col < 0) return null;
  const row = VICTORY_VXT_ROWS.find((entry) => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
  if (!row) return null;
  const cell = row.cells[col];
  return cell ? { spine: cell, rowLabel: row.label, roundedLength } : null;
}

function carbonExpressChoices(cell) {
  if (!cell) return [];
  return String(cell)
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function firstCarbonExpressChoice(cell) {
  return carbonExpressChoices(cell)[0] || null;
}

function carbonExpressModelsFromCode(modelCode) {
  const code = String(modelCode || "").toUpperCase();
  if (!code) return [];
  if (code.startsWith("PT")) return ["Predator II"];
  if (code.startsWith("MXR")) return ["Medallion XR"];
  if (code.startsWith("NPX")) return ["Nano-Pro Xtreme"];
  if (code.startsWith("NSST") || code.startsWith("NS")) return ["Nano SST"];
  if (code.startsWith("MPR")) return ["Maxima Pro Recurve RZ"];
  if (code.startsWith("XYR")) return ["Predator II"];
  return [];
}

function carbonExpressRecommendation(input) {
  const isLightChart = input.drawWeight <= 34 && input.arrowLength <= 27;
  if (isLightChart) {
    const roundedLength = clamp(Math.round(input.arrowLength), 21, 27);
    const col = CARBON_LIGHT_RECURVE_LENGTHS.indexOf(roundedLength);
    const row = CARBON_LIGHT_RECURVE_ROWS.find((entry) => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
    if (col < 0 || !row) return { ok: false, message: "Hors tableau Carbon Express light recurve." };
    const cell = row.cells[col];
    if (!cell) return { ok: false, message: "Case vide dans le tableau Carbon Express light recurve." };
    const choices = carbonExpressChoices(cell);
    const first = choices[0];
    const normalizedChoice = first && first.includes("2000") ? "1000" : first && first.includes("1800") ? "900" : first && first.includes("1500") ? "800" : first && first.includes("1300") ? "700" : first && first.includes("1100") ? "600" : first && first.includes("1000") ? "500" : first && first.includes("900") ? "400" : first && first.includes("800") ? "350" : "500";
    return { ok: true, chart: "light", selection: cell, modelCode: first, modelCodes: choices, normalizedChoice, rowLabel: row.label, roundedLength };
  }

  const roundedLength = clamp(Math.round(input.arrowLength), 23, 32);
  const col = CARBON_RECURVE_SERIES_LENGTHS.indexOf(roundedLength);
  const row = CARBON_RECURVE_SERIES_ROWS.find((entry) => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
  if (col < 0 || !row) return { ok: false, message: "Hors tableau Carbon Express recurve series." };
  const cell = row.cells[col];
  if (!cell) return { ok: false, message: "Case vide dans le tableau Carbon Express recurve series." };
  const choices = carbonExpressChoices(cell);
  const first = choices[0];
  const normalizedChoice = first && first.includes("1000") ? "1000" : first && first.includes("900") ? "900" : first && first.includes("800") ? "800" : first && first.includes("750") ? "700" : first && first.includes("700") ? "700" : first && first.includes("650") ? "600" : first && first.includes("600") ? "600" : first && first.includes("580") ? "600" : first && first.includes("550") ? "500" : first && first.includes("500") ? "500" : first && first.includes("450") ? "400" : first && first.includes("420") ? "400" : first && first.includes("400") ? "400" : first && first.includes("350") ? "350" : "500";
  return { ok: true, chart: "series", selection: cell, modelCode: first, modelCodes: choices, normalizedChoice, rowLabel: row.label, roundedLength };
}

function buildBrandRecommendation(input, brand) {
  const profile = deriveTargetProfile(input);
  const base = recommendationForBrand(input, brand);
  let models = arrowCatalog[brand]?.[base.main] || [];
  let ranked = rankModels(models, input, profile);

  if (brand === "skylon") {
    const skylon = skylonRecommendation(input);
    if (skylon.ok) {
      models = skylon.models;
      ranked = rankModels(models, input, profile);
      ranked = attachModelSpines(ranked, brand, base.raw, profile);
      const topMeta = ranked[0]?.meta || null;
      const pointSetup = estimatePointSetup(input, topMeta?.pointRange || profile.pointRange, topMeta);
      return {
        brand,
        mode: "skylon",
        primary: skylon.group,
        comparisonSpine: null,
        softer: null,
        stiffer: null,
        load: base.load,
        confidence: skylon.warning ? "Moyenne" : "Elevee",
        confidenceReasons: skylon.warning ? ["Zone Y: confirmation par entraineur recommandee.", topMeta?.dataPrecision === "model" ? "Fiche modele directe utilisee." : "Fiche famille utilisee sur ce modele."] : ["Groupe issu du tableau Skylon.", "Modeles tries selon usage et construction.", topMeta?.dataPrecision === "model" ? "Fiche modele directe utilisee." : "Fiche famille utilisee sur ce modele."].filter(Boolean),
        models: ranked,
        recommendedMaterial: topMeta?.material || profile.preferredMaterial,
        recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
        recommendedPointRange: topMeta?.pointRange || profile.pointRange,
        recommendedPointWeight: pointSetup.recommended,
        recommendedPointChoices: pointSetup.pointChoices,
        recommendedPointProfile: pointSetup.profile,
        recommendedPointSofter: pointSetup.softerOption,
        recommendedPointStiffer: pointSetup.stifferOption,
        pointWeightNote: pointSetup.note,
        recommendedSeries: topMeta?.seriesTier || profile.preferredSeries,
        recommendedMass: topMeta?.massClass || profile.preferredMass,
        recommendedTolerance: topMeta?.toleranceClass || profile.preferredTolerance,
        recommendedComponentSystem: topMeta?.componentSystem || "insert",
        recommendedUseCase: topMeta?.useCase || profile.preferredUseCase,
        recommendedDistanceBand: topMeta?.distanceBand || profile.preferredDistanceBand,
        notes: [topMeta?.note || "Controle final au tir requis."]
      };
    }
  }
  if (brand === "easton" && input.bowType === "recurve" && input.shootingEnvironment === "outdoor" && profile.preferredMaterial === "carbon") {
    const easton = eastonCarbonRecommendation(input);
    if (easton.ok) {
      models = arrowCatalog.easton?.[easton.normalizedChoice] || [];
      ranked = rankModels(models, input, profile);
      ranked = ranked.map((entry) => ({ ...entry, advisedSpine: easton.weakChoice || easton.normalizedChoice }));
      const topMeta = ranked[0]?.meta || null;
      const pointSetup = estimatePointSetup(input, topMeta?.pointRange || profile.pointRange, topMeta);
      return {
        brand,
        mode: "easton-table",
        primary: easton.rangeLabel,
        comparisonSpine: easton.normalizedChoice,
        softer: base.softer,
        stiffer: base.stiffer,
        load: base.load,
        confidence: "Elevee",
        confidenceReasons: [
          `Tableau Easton carbone recurve utilise (${easton.rowLabel}, ${easton.roundedLength}\").`,
          "Pour le recurve, le cote plus souple de la plage Easton est privilegie.",
          topMeta?.dataPrecision === "model" ? "Fiche modele directe utilisee." : "Fiche famille utilisee sur ce modele."
        ].filter(Boolean),
        models: ranked,
        recommendedMaterial: topMeta?.material || profile.preferredMaterial,
        recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
        recommendedPointRange: topMeta?.pointRange || profile.pointRange,
        recommendedPointWeight: pointSetup.recommended,
        recommendedPointChoices: pointSetup.pointChoices,
        recommendedPointProfile: pointSetup.profile,
        recommendedPointSofter: pointSetup.softerOption,
        recommendedPointStiffer: pointSetup.stifferOption,
        pointWeightNote: pointSetup.note,
        recommendedSeries: topMeta?.seriesTier || profile.preferredSeries,
        recommendedMass: topMeta?.massClass || profile.preferredMass,
        recommendedTolerance: topMeta?.toleranceClass || profile.preferredTolerance,
        recommendedComponentSystem: topMeta?.componentSystem || "insert",
        recommendedUseCase: topMeta?.useCase || profile.preferredUseCase,
        recommendedDistanceBand: topMeta?.distanceBand || profile.preferredDistanceBand,
        notes: [topMeta?.note || "Controle final au tir requis.", "Tableau officiel Easton carbone recurve privilegie."]
      };
    }
  }
  if (brand === "easton" && input.bowType === "recurve" && input.shootingEnvironment === "indoor" && profile.preferredMaterial === "alu") {
    const easton = eastonAluRecommendation(input);
    if (easton.ok) {
      models = arrowCatalog.easton?.[easton.normalizedChoice] || [];
      ranked = rankModels(models, input, profile);
      ranked = ranked.map((entry) => ({ ...entry, advisedSpine: easton.weakChoice || easton.normalizedChoice }));
      const topMeta = ranked[0]?.meta || null;
      const pointSetup = estimatePointSetup(input, topMeta?.pointRange || profile.pointRange, topMeta);
      return {
        brand,
        mode: "easton-table",
        primary: easton.rangeLabel,
        comparisonSpine: easton.normalizedChoice,
        softer: base.softer,
        stiffer: base.stiffer,
        load: base.load,
        confidence: "Elevee",
        confidenceReasons: [
          `Tableau Easton alu recurve utilise (${easton.rowLabel}, ${easton.roundedLength}\").`,
          "Pour le recurve, le cote plus souple de la plage Easton est privilegie.",
          topMeta?.dataPrecision === "model" ? "Fiche modele directe utilisee." : "Fiche famille utilisee sur ce modele."
        ].filter(Boolean),
        models: ranked,
        recommendedMaterial: topMeta?.material || profile.preferredMaterial,
        recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
        recommendedPointRange: topMeta?.pointRange || profile.pointRange,
        recommendedPointWeight: pointSetup.recommended,
        recommendedPointChoices: pointSetup.pointChoices,
        recommendedPointProfile: pointSetup.profile,
        recommendedPointSofter: pointSetup.softerOption,
        recommendedPointStiffer: pointSetup.stifferOption,
        pointWeightNote: pointSetup.note,
        recommendedSeries: topMeta?.seriesTier || profile.preferredSeries,
        recommendedMass: topMeta?.massClass || profile.preferredMass,
        recommendedTolerance: topMeta?.toleranceClass || profile.preferredTolerance,
        recommendedComponentSystem: topMeta?.componentSystem || "insert",
        recommendedUseCase: topMeta?.useCase || profile.preferredUseCase,
        recommendedDistanceBand: topMeta?.distanceBand || profile.preferredDistanceBand,
        notes: [topMeta?.note || "Controle final au tir requis.", "Tableau officiel Easton alu recurve privilegie."]
      };
    }
  }
  if (brand === "victory" && input.bowType === "recurve" && profile.preferredMaterial === "carbon") {
    const victory = victoryRecurveRecommendation(input);
    if (victory.ok) {
      models = arrowCatalog.victory?.[victory.normalizedChoice] || [];
      ranked = rankModels(models, input, profile);
      ranked = ranked.map((entry) => {
        const vxt = normalizeModelKey(entry.model) === "vxt elite v1" ? victoryVxtRecommendation(input) : null;
        return { ...entry, advisedSpine: vxt?.spine || victory.spine };
      });
      const topMeta = ranked[0]?.meta || null;
      const pointSetup = estimatePointSetup(input, topMeta?.pointRange || profile.pointRange, topMeta);
      return {
        brand,
        mode: "victory-table",
        primary: victory.spine,
        comparisonSpine: victory.normalizedChoice,
        softer: base.softer,
        stiffer: base.stiffer,
        load: base.load,
        confidence: "Elevee",
        confidenceReasons: [
          `Tableau Victory recurve utilise (${victory.rowLabel}, ${victory.roundedLength}\").`,
          "Base officielle Victory en version 100-125 gr front.",
          topMeta?.dataPrecision === "model" ? "Fiche modele directe utilisee." : "Fiche famille utilisee sur ce modele."
        ].filter(Boolean),
        models: ranked,
        recommendedMaterial: topMeta?.material || profile.preferredMaterial,
        recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
        recommendedPointRange: topMeta?.pointRange || profile.pointRange,
        recommendedPointWeight: pointSetup.recommended,
        recommendedPointChoices: pointSetup.pointChoices,
        recommendedPointProfile: pointSetup.profile,
        recommendedPointSofter: pointSetup.softerOption,
        recommendedPointStiffer: pointSetup.stifferOption,
        pointWeightNote: pointSetup.note,
        recommendedSeries: topMeta?.seriesTier || profile.preferredSeries,
        recommendedMass: topMeta?.massClass || profile.preferredMass,
        recommendedTolerance: topMeta?.toleranceClass || profile.preferredTolerance,
        recommendedComponentSystem: topMeta?.componentSystem || "insert",
        recommendedUseCase: topMeta?.useCase || profile.preferredUseCase,
        recommendedDistanceBand: topMeta?.distanceBand || profile.preferredDistanceBand,
        notes: [
          topMeta?.note || "Controle final au tir requis.",
          "Tableau officiel Victory recurve privilegie.",
          "Pour Victory, le tableau donne une bonne base de depart, mais un avis d'entraineur reste recommande pour confirmer le bon spine."
        ]
      };
    }
  }
  if (brand === "carbon" && input.bowType === "recurve" && profile.preferredMaterial === "carbon") {
    const carbonExpress = carbonExpressRecommendation(input);
    if (carbonExpress.ok) {
      const choiceCodes = carbonExpress.modelCodes?.length ? carbonExpress.modelCodes : [carbonExpress.modelCode].filter(Boolean);
      const manufacturerModels = [...new Set(choiceCodes.flatMap((code) => carbonExpressModelsFromCode(code)))];
      models = manufacturerModels.length ? manufacturerModels : (arrowCatalog.carbon?.[carbonExpress.normalizedChoice] || []);
      ranked = rankModels(models, input, profile);
      const codeByModel = new Map();
      choiceCodes.forEach((code) => {
        carbonExpressModelsFromCode(code).forEach((modelName) => {
          if (!codeByModel.has(modelName)) codeByModel.set(modelName, code);
        });
      });
      ranked = ranked.map((entry) => ({ ...entry, advisedSpine: codeByModel.get(entry.model) || carbonExpress.modelCode || carbonExpress.normalizedChoice }));
      const topMeta = ranked[0]?.meta || null;
      const pointSetup = estimatePointSetup(input, topMeta?.pointRange || profile.pointRange, topMeta);
      return {
        brand,
        mode: "carbon-table",
        primary: carbonExpress.selection,
        comparisonSpine: carbonExpress.normalizedChoice,
        softer: base.softer,
        stiffer: base.stiffer,
        load: base.load,
        confidence: "Elevee",
        confidenceReasons: [
          `Tableau Carbon Express ${carbonExpress.chart === "light" ? "light recurve" : "recurve series"} utilise (${carbonExpress.rowLabel}, ${carbonExpress.roundedLength}\").`,
          "Toutes les references de la case Carbon Express sont prises en compte.",
          manufacturerModels.length ? `Codes fabricant lus dans la case : ${(carbonExpress.modelCodes || [carbonExpress.modelCode]).join(" / ")}.` : "Fallback sur le bucket interne le plus proche.",
          topMeta?.dataPrecision === "model" ? "Fiche modele directe utilisee." : "Fiche famille utilisee sur ce modele."
        ].filter(Boolean),
        models: ranked,
        recommendedMaterial: topMeta?.material || profile.preferredMaterial,
        recommendedDiameter: topMeta?.diameters?.[0] || profile.preferredDiameter,
        recommendedPointRange: topMeta?.pointRange || profile.pointRange,
        recommendedPointWeight: pointSetup.recommended,
        recommendedPointChoices: pointSetup.pointChoices,
        recommendedPointProfile: pointSetup.profile,
        recommendedPointSofter: pointSetup.softerOption,
        recommendedPointStiffer: pointSetup.stifferOption,
        pointWeightNote: pointSetup.note,
        recommendedSeries: topMeta?.seriesTier || profile.preferredSeries,
        recommendedMass: topMeta?.massClass || profile.preferredMass,
        recommendedTolerance: topMeta?.toleranceClass || profile.preferredTolerance,
        recommendedComponentSystem: topMeta?.componentSystem || "insert",
        recommendedUseCase: topMeta?.useCase || profile.preferredUseCase,
        recommendedDistanceBand: topMeta?.distanceBand || profile.preferredDistanceBand,
        notes: [topMeta?.note || "Controle final au tir requis.", "Tableau officiel Carbon Express recurve privilegie."]
      };
    }
  }
  const reasons = [];
  if (input.shaftMaterial !== "all") reasons.push("Filtre de construction impose.");
  if (input.shootingEnvironment === "outdoor") reasons.push("Contexte exterieur pris en compte.");
  if (ranked.length >= 2) reasons.push("Plusieurs modeles coherents trouves dans la marque.");
  if (input.arrowLength < 24 || input.arrowLength > 31) reasons.push("Longueur hors plage centrale: verification fabricant imperative.");

  const notes = [];
  let fallbackLabel = "";
  let alternatives = [];
  if (!ranked.length) {
    const nearby = rankNearbyModels(brand, base.main, input, profile);
    if (nearby.length) {
      ranked = nearby;
      fallbackLabel = "modeles proches";
      notes.push("Aucune correspondance exacte sur le spine principal; proposition de references voisines de la marque.");
    } else {
      alternatives = rankCrossBrandAlternatives(input, profile, brand);
      if (alternatives.length) {
        fallbackLabel = "alternatives marque";
        notes.push("Aucune reference exploitable dans cette marque pour ce filtre; alternatives compatibles proposees sur d'autres marques.");
      }
    }
  }
  if (ranked.length) {
    const initialCount = ranked.length;
    ranked = enrichWithNearbyModels(ranked, brand, base.main, input, profile, 6);
    if (ranked.length > initialCount) reasons.push("Modeles voisins du spine principal ajoutes pour elargir le choix dans la marque.");
  }
  const topMeta = ranked[0]?.meta || null;
  const pointSetup = estimatePointSetup(input, topMeta?.pointRange || profile.pointRange, topMeta);
  if (topMeta?.dataPrecision === "model") reasons.push("Fiche modele directe utilisee.");
  if (input.shootingEnvironment === "indoor" && profile.preferredMaterial === "alu") notes.push("Pour la salle recurve, verifier ensuite le tableau alu dedie du fabricant.");
  if (topMeta?.note) notes.push(topMeta.note);
  if (!ranked.length && !alternatives.length) notes.push("Aucun modele strictement conforme aux filtres. Elargir les contraintes peut etre utile.");

  ranked = attachModelSpines(ranked, brand, base.raw, profile);
  alternatives = alternatives.map((entry) => ({
      ...entry,
      advisedSpine: resolveModelSpine(adjustedRawForModel(recommendationForBrand(input, entry.brand).raw, entry.model, entry.meta, profile), entry.brand)
    }));

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
    alternativeModels: alternatives,
    fallbackLabel,
    recommendedMaterial: (ranked[0]?.meta || topMeta)?.material || profile.preferredMaterial,
    recommendedDiameter: (ranked[0]?.meta || topMeta)?.diameters?.[0] || profile.preferredDiameter,
    recommendedPointRange: (ranked[0]?.meta || topMeta)?.pointRange || profile.pointRange,
    recommendedPointWeight: pointSetup.recommended,
    recommendedPointChoices: pointSetup.pointChoices,
    recommendedPointProfile: pointSetup.profile,
    recommendedPointSofter: pointSetup.softerOption,
    recommendedPointStiffer: pointSetup.stifferOption,
    pointWeightNote: pointSetup.note,
    recommendedSeries: (ranked[0]?.meta || topMeta)?.seriesTier || profile.preferredSeries,
    recommendedMass: (ranked[0]?.meta || topMeta)?.massClass || profile.preferredMass,
    recommendedTolerance: (ranked[0]?.meta || topMeta)?.toleranceClass || profile.preferredTolerance,
    recommendedComponentSystem: (ranked[0]?.meta || topMeta)?.componentSystem || "insert",
    recommendedUseCase: (ranked[0]?.meta || topMeta)?.useCase || profile.preferredUseCase,
    recommendedDistanceBand: (ranked[0]?.meta || topMeta)?.distanceBand || profile.preferredDistanceBand,
    notes
  };
}

function renderModelList(recommendation, input) {
  if (!recommendation.models.length) return "<li>Aucun modele correspondant strictement a vos filtres.</li>";
  return uniqueModelEntries(recommendation.models, 12).map((entry) => {
    const meta = entry.meta;
    const source = entry.sourceSpine ? ` | spine voisin ${entry.sourceSpine}` : "";
    const advisedSpine = entry.advisedSpine ? ` | spine conseille ${entry.advisedSpine}` : "";
    const pointSetup = meta?.pointRange ? estimatePointSetup(input, meta.pointRange, meta) : null;
    const details = meta
      ? `${seriesLabel(meta.seriesTier)} | ${materialLabel(meta.material)} | ${diameterLabel(meta.diameters[0] || "standard")} | ${massLabel(meta.massClass)} | ${toleranceLabel(meta.toleranceClass)} | ${componentSystemLabel(meta.componentSystem)} | ${distanceBandLabel(meta.distanceBand)} | ${useCaseLabel(meta.useCase)} | pointe conseillee ${pointSetup?.recommended || meta.pointRange[0]} gr (options ${pointSetup?.pointChoices?.join("/") || `${meta.pointRange[0]}-${meta.pointRange[1]}`})${advisedSpine}${source}`
      : "Meta technique locale incomplete";
    return `<li><strong>${entry.model}</strong> - ${details}</li>`;
  }).join("");
}

function renderAlternativeModelList(recommendation) {
  if (!recommendation.alternativeModels?.length) return "";
  const lines = recommendation.alternativeModels
    .map((entry) => {
      const meta = entry.meta;
      const details = meta ? ` - ${seriesLabel(meta.seriesTier)} - ${diameterLabel(meta.diameters[0] || "standard")} - ${useCaseLabel(meta.useCase)}` : "";
      const advisedSpine = entry.advisedSpine ? ` - spine conseille ${entry.advisedSpine}` : ` - spine ${entry.spine}`;
      return `<li><strong>${brandLabel(entry.brand)}</strong>: ${entry.model}${advisedSpine}${details}</li>`;
    })
    .join("");
  return `<p>Alternatives pertinentes hors marque:</p><ul>${lines}</ul>`;
}

function rankDealsAgainstModels(deals, modelNames) {
  if (!modelNames?.length) return [];
  const modelIndex = new Map(modelNames.map((modelName, index) => [normalizeModelKey(modelName), { modelName, index }]));
  return deals
    .map((deal) => {
      const directKey = normalizeModelKey(deal.modelKey || deal.title);
      const prefixedMatch = [...modelIndex.entries()].find(([modelKey]) => modelKey.startsWith(`${directKey} `) || modelKey.startsWith(`${directKey}-`) || modelKey.startsWith(`${directKey}/`));
      const directMatch = modelIndex.get(directKey) || (prefixedMatch ? prefixedMatch[1] : null);
      if (directMatch) {
        return { deal, score: 200 - directMatch.index * 10, matchedModel: directMatch.modelName };
      }
      return { deal, score: 0, matchedModel: "" };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || parseDealPrice(a.deal.price) - parseDealPrice(b.deal.price) || a.deal.shop.localeCompare(b.deal.shop));
}

function parseDealPrice(price) {
  const normalized = String(price || "").replace(/\s/g, "").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return normalized ? Number(normalized[1]) : Number.POSITIVE_INFINITY;
}

function renderDeals(preferredBrand, shaftMaterial, bowType, shootingProfile, allowedBrands = null, recommendedModels = []) {
  const baseDeals = dealsState.deals.filter((deal) => {
    const brandOk = preferredBrand === "all" || deal.brand === preferredBrand;
    const visibleBrandOk = !allowedBrands || allowedBrands.includes(deal.brand);
    const allowedMaterialOk = ALLOWED_SHAFT_MATERIALS.includes(deal.material);
    const materialOk = shaftMaterial === "all" || deal.material === shaftMaterial;
    const bowTypeOk = !deal.bowTypes || deal.bowTypes.includes(bowType);
    const outdoorRecurveOk = shootingProfile !== "recurve_outdoor" || deal.material === "carbon";
    return brandOk && visibleBrandOk && allowedMaterialOk && materialOk && bowTypeOk && outdoorRecurveOk;
  });
  const finalDeals = baseDeals;
  if (!finalDeals.length) return "<p>Aucune offre correspondant au filtre actuel.</p>";

  const displayedDeals = rankDealsAgainstModels(finalDeals, recommendedModels);
  if (!displayedDeals.length) return "<p>Aucune offre marchande ne correspond exactement aux modeles resultats.</p>";

  const groups = displayedDeals.reduce((acc, entry) => {
    if (!acc[entry.deal.shop]) acc[entry.deal.shop] = [];
    acc[entry.deal.shop].push(entry);
    return acc;
  }, {});

  const content = Object.entries(groups)
    .map(([shop, shopDeals]) => {
      const lines = shopDeals
        .sort((a, b) => parseDealPrice(a.deal.price) - parseDealPrice(b.deal.price))
        .map(({ deal, matchedModel, score }) => {
          const link = `<a href="${deal.url}" target="_blank" rel="noopener noreferrer">${deal.title}</a> - ${deal.price}`;
          const relation = score > 0 && matchedModel ? ` <span class="result-subvalue">modele lie: ${matchedModel}</span>` : "";
          return `<li>${link}${relation}</li>`;
        })
        .join("");
      return `<li class="merchant-shop"><p class="merchant-shop-name">${shop}</p><ul class="merchant-deals">${lines}</ul></li>`;
    })
    .join("");

  return `<section class="merchant-block"><p class="merchant-intro">Offres correspondant aux modeles resultats (classees par prix croissant) :</p><ul class="merchant-shops">${content}</ul></section>`;
}

function sourceLinksForBrand(brand) {
  if (brand === "skylon") return ['<a href="https://skylonarchery.com/" target="_blank" rel="noopener noreferrer">Skylon Archery</a>'];
  if (brand === "easton") return ['<a href="https://eastonarchery.com/selector/" target="_blank" rel="noopener noreferrer">Easton selector</a>'];
  if (brand === "victory") return ['<a href="https://issuu.com/rublinemarketing/docs/victory_archery_2026_digital_catalog_-_target?fr=sZDY2Mjg4NDU2OTI" target="_blank" rel="noopener noreferrer">Victory target catalog 2026</a>', '<a href="https://victoryarchery.com/fitting-charts/" target="_blank" rel="noopener noreferrer">Victory fitting charts</a>'];
  if (brand === "carbon") return ['<a href="https://thecarbonexpress.com/wp-content/uploads/2024/11/recurve-series-arrow-selection-chart.pdf" target="_blank" rel="noopener noreferrer">Carbon Express recurve series chart</a>'];
  return [];
}

function renderSourcesSection(brands) {
  const links = [...new Set(brands.flatMap(sourceLinksForBrand))];
  if (!links.length) return "";
  return `<p>Sources des tableaux :</p><ul>${links.map((link) => `<li>${link}</li>`).join("")}</ul>`;
}

function recommendationPrimaryDisplay(recommendation) {
  const topModel = recommendation.models[0];
  const topSpine = topModel?.advisedSpine || recommendation.primary;
  if (recommendation.mode === "skylon") {
    return `${topSpine} <span class="result-subvalue">groupe ${recommendation.primary}</span>`;
  }
  if (recommendation.mode === "easton-table" || recommendation.mode === "victory-table" || recommendation.mode === "carbon-table") {
    return `${topSpine} <span class="result-subvalue">base ${recommendation.primary} / eq. ${recommendation.comparisonSpine}</span>`;
  }
  return `${topSpine} <span class="result-subvalue">base ${recommendation.primary}</span>`;
}

function renderComparisonBrandCard(entry, input) {
  const topModels = uniqueModelEntries(entry.rec.models, 7);
  const modelList = topModels.length
    ? `<ul>${topModels.map((modelEntry) => {
        const meta = modelEntry.meta;
      const pointSetup = meta?.pointRange ? estimatePointSetup(input, meta.pointRange, meta) : null;
      const details = meta ? `spine ${modelEntry.advisedSpine || entry.rec.primary} | ${diameterLabel(meta.diameters[0] || "standard")} | pointe ${pointSetup?.recommended || meta.pointRange[0]} gr | options ${pointSetup?.pointChoices?.join("/") || `${meta.pointRange[0]}-${meta.pointRange[1]}`}` : "Meta technique locale incomplete";
      return `<li><strong>${modelEntry.model}</strong> - ${details}</li>`;
    }).join("")}</ul>`
    : "<p>Aucun modele detaille pour cette marque.</p>";
  const brandDeals = renderDeals(entry.brand, input.shaftMaterial, input.bowType, input.shootingProfile, null, topModels.map((modelEntry) => modelEntry.model));
  return `
    <article class="mini-card">
      <p class="mini-card-brand">${brandLabel(entry.brand)}</p>
      <p class="mini-card-subtitle">Modeles coherents</p>
      ${modelList}
      ${brandDeals}
      ${renderSourcesSection([entry.brand])}
    </article>
  `;
}

function cloneCatalog(catalog) { return JSON.parse(JSON.stringify(catalog)); }
function readHistory() { try { return JSON.parse(localStorage.getItem(STORAGE.history) || "[]"); } catch { return []; } }
function writeHistory(entry) { const next = [entry, ...readHistory()].slice(0, 5); localStorage.setItem(STORAGE.history, JSON.stringify(next)); renderHistory(); }
function renderHistory() {
  const entries = readHistory();
  if (!entries.length) { els.historyContent.innerHTML = "<p>Aucun calcul pour le moment.</p>"; return; }
  els.historyContent.innerHTML = `<ul class="history-list">${entries.map((entry) => `<li>${entry.date} - ${entry.profile} - ${entry.primary} (${entry.bowType}, ${entry.drawWeight} lbs, ${entry.arrowLength}")</li>`).join("")}</ul>`;
}

function todayIsoDate() {
  return new Date().toLocaleDateString("en-CA");
}

function readNotebook() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.notebook) || "[]");
  } catch {
    return [];
  }
}

function writeNotebook(entries) {
  localStorage.setItem(STORAGE.notebook, JSON.stringify(entries));
  renderNotebook();
}

function notebookFormData() {
  return {
    date: els.notebookDate.value,
    title: els.notebookTitle.value.trim(),
    arcModel: els.notebookArcModel.value.trim(),
    arcLength: els.notebookArcLength.value.trim(),
    riserLength: els.notebookRiserLength.value.trim(),
    limbs: els.notebookLimbs.value.trim(),
    limbWeight: els.notebookLimbWeight.value.trim(),
    drawLength: els.notebookDrawLength.value.trim(),
    brace: els.notebookBrace.value.trim(),
    upperTiller: els.notebookUpperTiller.value.trim(),
    lowerTiller: els.notebookLowerTiller.value.trim(),
    positiveTiller: els.notebookPositiveTiller.value.trim(),
    estimatedWeight: els.notebookEstimatedWeight.value.trim(),
    arrowBrand: els.notebookArrowBrand.value.trim(),
    arrowModel: els.notebookArrowModel.value.trim(),
    arrowSpine: els.notebookArrowSpine.value.trim(),
    arrowLength: els.notebookArrowLength.value.trim(),
    pointWeight: els.notebookPointWeight.value.trim(),
    sightMarks: {
      "10m": els.notebookSight10.value.trim(),
      "18m": els.notebookSight18.value.trim(),
      "20m": els.notebookSight20.value.trim(),
      "30m": els.notebookSight30.value.trim(),
      "40m": els.notebookSight40.value.trim(),
      "50m": els.notebookSight50.value.trim(),
      "60m": els.notebookSight60.value.trim(),
      "70m": els.notebookSight70.value.trim()
    },
    sightNotes: els.notebookSightNotes.value.trim(),
    notes: els.notebookNotes.value.trim()
  };
}

function sightMarksSummary(entry) {
  const marks = entry?.sightMarks || {};
  return ["10m", "18m", "20m", "30m", "40m", "50m", "60m", "70m"]
    .filter((distance) => marks[distance])
    .map((distance) => `${distance} ${marks[distance]}`)
    .slice(0, 4)
    .join(" / ");
}

function notebookModelSuggestionsFromRecommendation(rec) {
  if (!rec) return [];
  return [...new Set([
    ...uniqueModelEntries(rec.models || [], 7).map((entry) => entry.model).filter(Boolean),
    ...((rec.alternativeModels || []).slice(0, 4).map((entry) => entry.model).filter(Boolean))
  ])];
}

function renderNotebookArrowModelSuggestions(models = [], selectedModel = "") {
  if (els.notebookArrowModelOptions) {
    els.notebookArrowModelOptions.innerHTML = models.map((model) => `<option value="${escapeHtml(model)}"></option>`).join("");
  }
  if (!els.notebookArrowModelHint) return;
  if (!models.length) {
    els.notebookArrowModelHint.textContent = "";
    return;
  }
  const intro = models.length === 1 ? "Modele suggere par le dernier calcul :" : "Modeles suggérés par le dernier calcul :";
  const list = models.join(" / ");
  const suffix = selectedModel && models.includes(selectedModel) ? " Selection actuelle conservee." : "";
  els.notebookArrowModelHint.textContent = `${intro} ${list}.${suffix}`;
}

function fillNotebookForm(entry = {}) {
  els.notebookDate.value = entry.date || todayIsoDate();
  els.notebookTitle.value = entry.title || "";
  els.notebookArcModel.value = entry.arcModel || "";
  els.notebookArcLength.value = entry.arcLength || "";
  els.notebookRiserLength.value = entry.riserLength || "";
  els.notebookLimbs.value = entry.limbs || "";
  els.notebookLimbWeight.value = entry.limbWeight || "";
  els.notebookDrawLength.value = entry.drawLength || "";
  els.notebookBrace.value = entry.brace || "";
  els.notebookUpperTiller.value = entry.upperTiller || "";
  els.notebookLowerTiller.value = entry.lowerTiller || "";
  els.notebookPositiveTiller.value = entry.positiveTiller || "";
  els.notebookEstimatedWeight.value = entry.estimatedWeight || "";
  els.notebookArrowBrand.value = entry.arrowBrand || "";
  els.notebookArrowModel.value = entry.arrowModel || "";
  els.notebookArrowSpine.value = entry.arrowSpine || "";
  els.notebookArrowLength.value = entry.arrowLength || "";
  els.notebookPointWeight.value = entry.pointWeight || "";
  const sightMarks = entry.sightMarks || {};
  els.notebookSight10.value = sightMarks["10m"] || "";
  els.notebookSight18.value = sightMarks["18m"] || "";
  els.notebookSight20.value = sightMarks["20m"] || "";
  els.notebookSight30.value = sightMarks["30m"] || "";
  els.notebookSight40.value = sightMarks["40m"] || "";
  els.notebookSight50.value = sightMarks["50m"] || "";
  els.notebookSight60.value = sightMarks["60m"] || "";
  els.notebookSight70.value = sightMarks["70m"] || "";
  els.notebookSightNotes.value = entry.sightNotes || "";
  els.notebookNotes.value = entry.notes || "";
  renderNotebookArrowModelSuggestions(entry._modelSuggestions || [], entry.arrowModel || "");
}

function resetNotebookForm() {
  currentNotebookId = null;
  fillNotebookForm({ date: todayIsoDate() });
}

function recommendationBrandLabel(snapshot) {
  return snapshot?.brand ? brandLabel(snapshot.brand) : "";
}

function getCurrentSpineInputForNotebook() {
  const converted = toImperial(Number(els.drawWeight.value), Number(els.arrowLength.value));
  const input = {
    bowType: "recurve",
    shootingProfile: els.shootingProfile.value,
    preferredBrand: els.preferredBrand.value,
    shootingEnvironment: els.shootingEnvironment.value,
    shaftMaterial: els.shaftMaterial.value,
    drawWeight: converted.drawWeight,
    arrowLength: converted.arrowLength,
    discipline: els.discipline.value
  };
  const normalizedInput = normalizeInput(input);
  normalizedInput.pointWeight = defaultPointWeightForInput(normalizedInput);
  return validateInput(normalizedInput) ? null : normalizedInput;
}

function buildNotebookRecommendationFallback() {
  const input = getCurrentSpineInputForNotebook();
  if (!input) return null;
  if (input.preferredBrand !== "all") return buildBrandRecommendation(input, input.preferredBrand);
  return null;
}

function buildNotebookArcFallback() {
  const input = {
    arcLength: Number(els.arcLength.value),
    upperTiller: Number(els.upperTiller.value),
    lowerTillerMeasured: Number(els.lowerTillerMeasured.value),
    limbMarkedWeight: Number(els.limbMarkedWeight.value),
    riserLength: Number(els.riserLength.value),
    drawLengthForWeight: Number(els.drawLengthForWeight.value)
  };
  return validateArcSetupInput(input) ? null : { input: cloneCatalog(input), setup: cloneCatalog(computeArcSetup(input)) };
}

function buildNotebookPrefill() {
  const arc = lastArcSetupSnapshot || buildNotebookArcFallback();
  const currentSpineInput = getCurrentSpineInputForNotebook();
  const isMultiBrandSearch = currentSpineInput?.preferredBrand === "all";
  const rec = lastRecommendationSnapshot || buildNotebookRecommendationFallback();
  const currentArrowLength = Number(els.arrowLength.value).toFixed(2).replace(/\.00$/, "");
  const suggestedModels = notebookModelSuggestionsFromRecommendation(rec);
  const currentNotebookModel = els.notebookArrowModel.value.trim();
  const chosenModel = suggestedModels.length === 1
    ? suggestedModels[0]
    : (currentNotebookModel && suggestedModels.includes(currentNotebookModel) ? currentNotebookModel : "");
  return {
    date: els.notebookDate.value || todayIsoDate(),
    title: els.notebookTitle.value.trim(),
    arcModel: els.notebookArcModel.value.trim(),
    arcLength: arc ? `${arc.input.arcLength}"` : "",
    riserLength: arc ? `${arc.input.riserLength}"` : "",
    limbs: els.notebookLimbs.value.trim(),
    limbWeight: arc ? `${arc.input.limbMarkedWeight} lbs` : "",
    drawLength: arc ? `${arc.input.drawLengthForWeight}"` : `${currentArrowLength}"`,
    brace: arc ? `${arc.setup.braceTarget.toFixed(1)} cm` : "",
    upperTiller: arc ? `${arc.input.upperTiller} mm` : "",
    lowerTiller: arc ? `${arc.input.lowerTillerMeasured} mm` : "",
    positiveTiller: arc ? `+${arc.setup.actualTiller.toFixed(1)} mm` : "",
    estimatedWeight: arc ? `${arc.setup.drawWeightEstimate.estimated.toFixed(1)} lbs` : "",
    arrowBrand: isMultiBrandSearch ? els.notebookArrowBrand.value.trim() : (recommendationBrandLabel(rec) || els.notebookArrowBrand.value.trim()),
    arrowModel: isMultiBrandSearch ? currentNotebookModel : chosenModel,
    arrowSpine: isMultiBrandSearch ? els.notebookArrowSpine.value.trim() : (rec ? recommendationPrimaryDisplay(rec).replace(/<[^>]+>/g, "").trim() : els.notebookArrowSpine.value.trim()),
    arrowLength: `${currentArrowLength}"`,
    pointWeight: isMultiBrandSearch ? els.notebookPointWeight.value.trim() : (rec ? `${rec.recommendedPointWeight} gr` : els.notebookPointWeight.value.trim()),
    notes: els.notebookNotes.value.trim(),
    _modelSuggestions: isMultiBrandSearch ? [] : suggestedModels
  };
}

function renderNotebook() {
  const entries = readNotebook();
  if (!entries.length) {
    els.notebookStatus.textContent = "Aucune fiche pour le moment.";
    els.notebookContent.innerHTML = "";
    return;
  }
  els.notebookStatus.textContent = `${entries.length} fiche${entries.length > 1 ? "s" : ""} enregistree${entries.length > 1 ? "s" : ""}.`;

  const items = entries
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((entry) => {
      const title = entry.title || "Fiche sans titre";
      const summary = [
        entry.arcModel || entry.arcLength || entry.riserLength ? `${entry.arcModel || "Arc"} ${entry.arcLength ? `- ${entry.arcLength}` : ""} ${entry.riserLength ? `/ poignee ${entry.riserLength}` : ""}`.trim() : "",
        entry.arrowBrand || entry.arrowModel ? `${entry.arrowBrand || ""} ${entry.arrowModel || ""}`.trim() : "",
        entry.arrowSpine || entry.pointWeight ? `${entry.arrowSpine || ""}${entry.pointWeight ? ` / ${entry.pointWeight}` : ""}`.trim() : "",
        (() => {
          const sightSummary = sightMarksSummary(entry);
          return sightSummary ? `Viseur: ${sightSummary}` : "";
        })()
      ].filter(Boolean).join(" | ");
      return `
        <li class="notebook-item">
          <div class="notebook-item-copy">
            <p class="notebook-item-title">${title}</p>
            <p class="notebook-item-meta">${entry.date || "Date non renseignee"}</p>
            ${summary ? `<p class="notebook-item-summary">${summary}</p>` : ""}
          </div>
          <div class="notebook-item-actions">
            <button type="button" class="notebook-load" data-entry-id="${entry.id}">Charger</button>
            <button type="button" class="notebook-delete" data-entry-id="${entry.id}">Supprimer</button>
          </div>
        </li>
      `;
    }).join("");

  els.notebookContent.innerHTML = `<ul class="notebook-list">${items}</ul>`;
}

function validateInput(input) {
  if (!Number.isFinite(input.drawWeight) || !Number.isFinite(input.arrowLength)) return "Valeurs numeriques invalides.";
  const limits = BOW_LIMITS.recurve;
  if (input.drawWeight < limits.minDrawWeight || input.drawWeight > limits.maxDrawWeight) return `Puissance hors plage pour recurve (${limits.minDrawWeight}-${limits.maxDrawWeight} lbs).`;
  if (input.arrowLength < limits.minArrowLength || input.arrowLength > limits.maxArrowLength) return `Longueur hors plage (${limits.minArrowLength}-${limits.maxArrowLength} pouces).`;
  return "";
}

function defaultBraceRangeCm(arcLength) {
  const ranges = {
    66: [21.0, 22.5],
    68: [22.0, 23.5],
    70: [23.0, 24.5],
    72: [23.5, 25.0]
  };
  return ranges[arcLength] || ranges[68];
}

function validateArcSetupInput(input) {
  if (![66, 68, 70, 72].includes(input.arcLength)) return "Taille d'arc invalide.";
  if (!Number.isFinite(input.upperTiller)) return "Mesure haute invalide.";
  if (!Number.isFinite(input.lowerTillerMeasured)) return "Mesure basse invalide.";
  if (![23, 25, 27].includes(input.riserLength)) return "Taille de poignee invalide.";
  if (!Number.isFinite(input.limbMarkedWeight) || input.limbMarkedWeight < 10 || input.limbMarkedWeight > 60) return "Puissance marquee des branches invalide.";
  if (!Number.isFinite(input.drawLengthForWeight) || input.drawLengthForWeight < 22 || input.drawLengthForWeight > 34) return "Allonge invalide pour l'estimation de puissance.";
  if (input.upperTiller < 150 || input.upperTiller > 260) {
    return "Entrez la distance corde / branche haute en mm, par exemple 222, et non le tiller positif.";
  }
  if (input.lowerTillerMeasured < 150 || input.lowerTillerMeasured > 260) {
    return "Entrez la distance corde / branche basse en mm, par exemple 218.";
  }
  return "";
}

function estimateDrawWeight(input) {
  const riserAdjust = input.riserLength === 23 ? 2 : input.riserLength === 27 ? -2 : 0;
  const drawAdjust = (input.drawLengthForWeight - 28) * 2;
  const estimated = Math.round((input.limbMarkedWeight + riserAdjust + drawAdjust) * 10) / 10;
  return {
    estimated,
    riserAdjust,
    drawAdjust: Math.round(drawAdjust * 10) / 10
  };
}

function buildTillerAdjustment(actualTiller, targetTiller) {
  const delta = Math.round((actualTiller - targetTiller) * 10) / 10;
  if (Math.abs(delta) <= 0.5) {
    return {
      status: "OK",
      advice: "Le tiller est deja proche de la base retenue. Ne touchez pas les vis de branches pour l'instant."
    };
  }
  if (delta > 0) {
    return {
      status: "Tiller trop positif",
      advice: "Pour reduire le tiller, detendez ou enlevez d'abord la corde, puis vissez legerement la branche haute ou devissez legerement la branche basse avant de re-corder et re-mesurer."
    };
  }
  return {
    status: "Tiller trop faible",
    advice: "Pour augmenter le tiller, detendez ou enlevez d'abord la corde, puis vissez legerement la branche basse ou devissez legerement la branche haute avant de re-corder et re-mesurer."
  };
}

function computeArcSetup(input) {
  const braceRange = defaultBraceRangeCm(input.arcLength);
  const braceTarget = Math.round(((braceRange[0] + braceRange[1]) / 2) * 10) / 10;
  const recommendedTiller = 6;
  const expectedLowerDistance = Math.round((input.upperTiller - recommendedTiller) * 10) / 10;
  const actualTiller = Math.round((input.upperTiller - input.lowerTillerMeasured) * 10) / 10;
  const lowerGap = Math.round((input.lowerTillerMeasured - expectedLowerDistance) * 10) / 10;
  const adjustment = buildTillerAdjustment(actualTiller, recommendedTiller);
  const drawWeightEstimate = estimateDrawWeight(input);
  let tillerAction = `Avec un tiller positif de depart a +${recommendedTiller} mm, la distance basse attendue est ${expectedLowerDistance.toFixed(1)} mm.`;
  if (input.arcLength >= 70) tillerAction = `Sur un arc long, garder un tiller positif de depart autour de +4 mm reste une bonne base. Distance basse attendue : ${expectedLowerDistance.toFixed(1)} mm.`;
  else tillerAction = `Avec un tiller positif de depart a +${recommendedTiller} mm, la distance basse attendue est ${expectedLowerDistance.toFixed(1)} mm.`;

  return {
    braceRange,
    braceTarget,
    upperTiller: input.upperTiller,
    lowerTillerMeasured: input.lowerTillerMeasured,
    lowerTiller: expectedLowerDistance,
    actualTiller,
    lowerGap,
    tillerTarget: recommendedTiller,
    tillerAction,
    adjustment,
    drawWeightEstimate,
    checks: [
      "Band : commencer dans la plage de depart du constructeur. La valeur cible ici est une base pratique.",
      "Tiller : base carnet de reglage, tiller positif entre +2 et +10 mm, prereglage autour de +6 mm.",
      "Toute modification des vis de branches agit aussi sur la puissance ressentie de l'arc.",
      "Le tiller n'est pas un indicateur direct de puissance tiree.",
      "Re-mesurez le haut et le bas apres chaque micro-ajustement."
    ]
  };
}

function renderArcSetup(input) {
  const setup = computeArcSetup(input);
  lastArcSetupSnapshot = { input: cloneCatalog(input), setup: cloneCatalog(setup) };
  els.arcSetupResult.innerHTML = `
    <h2>Reglage de l'arc</h2>
    <section class="subcard">
      <h3>Band et tiller</h3>
      <p><strong>Band de depart</strong> : ${setup.braceRange[0].toFixed(1)} a ${setup.braceRange[1].toFixed(1)} cm</p>
      <p><strong>Band cible</strong> : ${setup.braceTarget.toFixed(1)} cm</p>
      <p><strong>Tiller positif mesure</strong> : +${setup.actualTiller.toFixed(1)} mm</p>
      <p><strong>Tiller positif vise</strong> : +${setup.tillerTarget.toFixed(1)} mm</p>
      <p><strong>Orientation de reglage</strong> : ${setup.adjustment.status}</p>
      <p>${setup.adjustment.advice}</p>
    </section>
    <section class="subcard">
      <h3>Puissance tiree estimee</h3>
      <p><strong>Puissance tiree estimee</strong> : ${setup.drawWeightEstimate.estimated.toFixed(1)} lbs</p>
      <p><strong>Base du calcul</strong> : poignee ${input.riserLength}" + branches ${input.limbMarkedWeight} lbs + allonge ${input.drawLengthForWeight.toFixed(2)}".</p>
      <p><strong>Note</strong> : le band n'entre pas dans ce calcul. Le tiller n'entre pas directement dans ce calcul non plus. En revanche, toucher aux vis de branches peut faire bouger a la fois le tiller et la puissance ressentie.</p>
    </section>
  `;
}

function renderComparison(input) {
  lastRecommendationSnapshot = null;
  const entries = BRAND_ORDER.map((brand) => ({ brand, rec: buildBrandRecommendation(input, brand) }));
  const comparisons = entries.filter((entry) => entry.rec.models.length > 0);
  const hiddenBrands = entries.filter((entry) => entry.rec.models.length === 0).map((entry) => brandLabel(entry.brand));
  const emptyState = comparisons.length
    ? `<div class="comparison-grid">${comparisons.map((entry) => renderComparisonBrandCard(entry, input)).join("")}</div>`
    : "<p>Aucune marque ne propose de modele coherent avec les filtres actuels.</p>";
  const hiddenState = hiddenBrands.length
    ? `<p>Marques non affichees pour ce filtre: <strong>${hiddenBrands.join(", ")}</strong>.</p>`
    : "";

  els.result.innerHTML = `
    <h2>Comparaison par marque</h2>
    <p>Chaque marque garde sa propre logique de reference.</p>
    <p class="result-value">Choisissez une marque</p>
    <p>Materiaux: <strong>${input.shaftMaterial === "all" ? "Tous" : materialLabel(input.shaftMaterial)}</strong></p>
    ${emptyState}
    ${hiddenState}
    <p>Offres marchands reliees aux resultats (mise a jour ${dealsUpdatedLabel()}, verification manuelle requise).</p>
  `;

  writeHistory({ date: new Date().toLocaleString("fr-FR"), profile: "Comparaison", primary: "Multi-marques", bowType: input.bowType, drawWeight: input.drawWeight.toFixed(1), arrowLength: input.arrowLength.toFixed(2) });
}

function renderRecommendation(input) {
  if (input.preferredBrand === "all") {
    renderComparison(input);
    return;
  }

  const recommendation = buildBrandRecommendation(input, input.preferredBrand);
  lastRecommendationSnapshot = cloneCatalog(recommendation);
  const confidenceList = recommendation.confidenceReasons.length ? `<ul>${recommendation.confidenceReasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>` : "<p>Aucune precision supplementaire.</p>";
  const recommendedModels = [
    ...uniqueModelEntries(recommendation.models, 7).map((entry) => entry.model),
    ...(recommendation.alternativeModels || []).slice(0, 2).map((entry) => entry.model)
  ];
  const dealsList = renderDeals(input.preferredBrand, input.shaftMaterial, input.bowType, input.shootingProfile, null, recommendedModels);
  const topMeta = recommendation.models[0]?.meta || null;
  const primaryLabel = recommendationPrimaryDisplay(recommendation);
  const modelTitle = recommendation.fallbackLabel === "modeles proches"
    ? "Modeles proches dans la marque:"
    : "Modeles conseilles:";

  els.result.innerHTML = `
    <h2>Recommandation ${brandLabel(recommendation.brand)}</h2>
    <p>Base de depart issue du tableau fabricant.</p>
    <p class="result-value">${primaryLabel}</p>
    <p><strong>Tube conseille</strong> : ${materialLabel(recommendation.recommendedMaterial)} - ${diameterLabel(recommendation.recommendedDiameter)}</p>
    <p><strong>Pointe conseillee</strong> : ${recommendation.recommendedPointWeight} gr (plage utile ${recommendation.recommendedPointRange[0]}-${recommendation.recommendedPointRange[1]} gr)</p>
    <p><strong>Ajustement rapide</strong> : assouplir -> ${recommendation.recommendedPointSofter ? `${recommendation.recommendedPointSofter} gr` : "pas d'option"} | raidir -> ${recommendation.recommendedPointStiffer ? `${recommendation.recommendedPointStiffer} gr` : "pas d'option"}</p>
    ${recommendation.softer && recommendation.stiffer ? `<p>Alternatives spine: plus souple <strong>${recommendation.softer}</strong>, plus rigide <strong>${recommendation.stiffer}</strong></p>` : ""}
    <p>Niveau de confiance: <strong>${recommendation.confidence}</strong></p>
    <p>Pourquoi ce niveau:</p>
    ${confidenceList}
    <p>${modelTitle}</p>
    <ul>${renderModelList(recommendation, input)}</ul>
    ${renderAlternativeModelList(recommendation)}
    ${renderSourcesSection([recommendation.brand])}
    <section class="merchant-panel">
      <h3>Offres chez les marchands</h3>
      <p class="merchant-panel-meta">Mise a jour ${dealsUpdatedLabel()}. Verification manuelle requise.</p>
      ${dealsList}
    </section>
  `;

  writeHistory({ date: new Date().toLocaleString("fr-FR"), profile: brandLabel(recommendation.brand), primary: recommendation.mode === "skylon" ? `Groupe ${recommendation.primary}` : `Spine ${recommendation.primary}`, bowType: input.bowType, drawWeight: input.drawWeight.toFixed(1), arrowLength: input.arrowLength.toFixed(2) });
}

els.shootingProfile.addEventListener("change", applyProfileDefaults);
els.shaftMaterial.addEventListener("change", updateMaterialGuidance);
window.addEventListener("pageshow", applyProfileDefaults);
els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab || "spine"));
});
els.themeSelect.addEventListener("change", () => applyTheme(els.themeSelect.value));
els.clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE.history);
  renderHistory();
});

els.prefillNotebookBtn.addEventListener("click", () => {
  fillNotebookForm({ ...notebookFormData(), ...buildNotebookPrefill() });
  els.notebookStatus.textContent = "Dernier calcul reinjecte dans la fiche.";
});
els.feedbackToggleBtn.addEventListener("click", () => {
  toggleFeedbackPanel(true);
  els.feedbackStatus.textContent = "";
});
els.feedbackCloseBtn.addEventListener("click", () => {
  toggleFeedbackPanel(false);
});
els.feedbackCategoryInputs.forEach((input) => {
  input.addEventListener("change", persistFeedbackDraft);
});
els.feedbackMessage.addEventListener("input", persistFeedbackDraft);
els.feedbackSendBtn.addEventListener("click", async () => {
  if (!selectedFeedbackCategory()) {
    els.feedbackStatus.textContent = "Choisissez d'abord une categorie.";
    return;
  }
  persistFeedbackDraft();
  els.feedbackSendBtn.disabled = true;
  els.feedbackStatus.textContent = "Envoi en cours...";
  try {
    await fetch(FEEDBACK_FORM.responseUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: feedbackRequestBody().toString()
    });
    setSelectedFeedbackCategory("");
    els.feedbackMessage.value = "";
    persistFeedbackDraft();
    els.feedbackStatus.textContent = "Avis envoye. Merci.";
  } catch {
    els.feedbackStatus.textContent = "Envoi direct indisponible pour le moment.";
  } finally {
    els.feedbackSendBtn.disabled = false;
  }
});
els.feedbackResetBtn.addEventListener("click", () => {
  setSelectedFeedbackCategory("");
  els.feedbackMessage.value = "";
  persistFeedbackDraft();
  els.feedbackStatus.textContent = "Avis vide.";
});

els.resetNotebookBtn.addEventListener("click", () => {
  resetNotebookForm();
});

els.notebookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = notebookFormData();
  if (!entry.title && !entry.arcModel && !entry.arrowModel && !sightMarksSummary(entry) && !entry.sightNotes) {
    els.notebookStatus.textContent = "Ajoutez au moins un titre, un arc, une fleche ou un repere viseur pour enregistrer la fiche.";
    return;
  }

  const entries = readNotebook();
  const record = {
    id: currentNotebookId || `notebook-${Date.now()}`,
    ...entry,
    updatedAt: new Date().toISOString()
  };
  const nextEntries = currentNotebookId
    ? entries.map((existing) => (existing.id === currentNotebookId ? record : existing))
    : [record, ...entries];

  currentNotebookId = record.id;
  writeNotebook(nextEntries.slice(0, 50));
  els.notebookStatus.textContent = `Fiche enregistree${record.title ? ` : ${record.title}` : ""}.`;
});

els.notebookContent.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const entryId = target.dataset.entryId;
  if (!entryId) return;

  if (target.classList.contains("notebook-load")) {
    const entry = readNotebook().find((item) => item.id === entryId);
    if (!entry) return;
    currentNotebookId = entry.id;
    fillNotebookForm(entry);
    setActiveTab("notebook");
    return;
  }

  if (target.classList.contains("notebook-delete")) {
    const nextEntries = readNotebook().filter((item) => item.id !== entryId);
    if (currentNotebookId === entryId) resetNotebookForm();
    writeNotebook(nextEntries);
  }
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const converted = toImperial(Number(els.drawWeight.value), Number(els.arrowLength.value));
  const input = {
    bowType: "recurve",
    shootingProfile: els.shootingProfile.value,
    preferredBrand: els.preferredBrand.value,
    shootingEnvironment: els.shootingEnvironment.value,
    shaftMaterial: els.shaftMaterial.value,
    drawWeight: converted.drawWeight,
    arrowLength: converted.arrowLength,
    discipline: els.discipline.value
  };
  const normalizedInput = normalizeInput(input);
  normalizedInput.pointWeight = defaultPointWeightForInput(normalizedInput);

  const error = validateInput(normalizedInput);
  if (error) {
    els.result.innerHTML = `<h2>Recommandation</h2><p>${error}</p>`;
    return;
  }

  await loadAppData();
  renderRecommendation(normalizedInput);
});

els.arcSetupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = {
    arcLength: Number(els.arcLength.value),
    upperTiller: Number(els.upperTiller.value),
    lowerTillerMeasured: Number(els.lowerTillerMeasured.value),
    limbMarkedWeight: Number(els.limbMarkedWeight.value),
    riserLength: Number(els.riserLength.value),
    drawLengthForWeight: Number(els.drawLengthForWeight.value)
  };

  const setupError = validateArcSetupInput(input);
  if (setupError) {
    els.arcSetupResult.innerHTML = `<h2>Reglage de l'arc</h2><p>${setupError}</p>`;
    return;
  }

  renderArcSetup(input);
});

applyUnitConstraints();
applyTheme(localStorage.getItem(STORAGE.theme) || "cible");
applyProfileDefaults();
updateVisibility();
renderHistory();
resetNotebookForm();
renderNotebook();
renderFeedbackDraft();
setActiveTab(localStorage.getItem(STORAGE.activeTab) || "spine");
loadAppData();
const initialArcSetup = {
  arcLength: Number(els.arcLength.value),
  upperTiller: Number(els.upperTiller.value),
  lowerTillerMeasured: Number(els.lowerTillerMeasured.value),
  limbMarkedWeight: Number(els.limbMarkedWeight.value),
  riserLength: Number(els.riserLength.value),
  drawLengthForWeight: Number(els.drawLengthForWeight.value)
};
const initialArcSetupError = validateArcSetupInput(initialArcSetup);
if (initialArcSetupError) {
  els.upperTiller.value = "222";
  els.lowerTillerMeasured.value = "218";
  els.limbMarkedWeight.value = "30";
  els.riserLength.value = "25";
  els.drawLengthForWeight.value = "28";
  renderArcSetup({
    arcLength: Number(els.arcLength.value),
    upperTiller: Number(els.upperTiller.value),
    lowerTillerMeasured: Number(els.lowerTillerMeasured.value),
    limbMarkedWeight: Number(els.limbMarkedWeight.value),
    riserLength: Number(els.riserLength.value),
    drawLengthForWeight: Number(els.drawLengthForWeight.value)
  });
} else {
  renderArcSetup(initialArcSetup);
}


