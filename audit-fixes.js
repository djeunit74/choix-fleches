/* Correctifs issus de l'audit du 10/08/2026.
 * Ce fichier surcharge uniquement les fonctions concernees afin de garder app.js intact.
 */
(() => {
  const originalNormalizeInput = window.normalizeInput;
  const originalScoreModel = window.scoreModel;
  const originalEastonCarbonRecommendation = window.eastonCarbonRecommendation;
  const originalEastonAluRecommendation = window.eastonAluRecommendation;
  const originalVictoryRecurveRecommendation = window.victoryRecurveRecommendation;
  const originalVictoryVxtRecommendation = window.victoryVxtRecommendation;
  const originalCarbonExpressRecommendation = window.carbonExpressRecommendation;
  const originalComputeArcSetup = window.computeArcSetup;

  function roundedLengthInRange(input, min, max, label) {
    const roundedLength = Math.round(input.arrowLength);
    if (roundedLength < min || roundedLength > max) {
      return { ok: false, message: `Longueur hors tableau ${label} (${min} a ${max} pouces).` };
    }
    return null;
  }

  // "Tous" doit rester un vrai mode multi-materiaux au lieu d'etre transforme en carbone/exterieur.
  window.normalizeInput = function normalizeInputFixed(input) {
    if (input.shaftMaterial !== "all") return originalNormalizeInput(input);
    return {
      ...input,
      shootingProfile: "recurve_all",
      shootingEnvironment: "mixed",
      discipline: "target"
    };
  };

  // En mode Tous, un modele est evalue dans son contexte carbone/exterieur ET alu/salle.
  // Le meilleur score est conserve, ce qui evite d'eliminer artificiellement l'aluminium.
  window.scoreModel = function scoreModelFixed(modelName, input, profile) {
    if (input.shaftMaterial !== "all") return originalScoreModel(modelName, input, profile);
    const outdoor = originalScoreModel(modelName, {
      ...input,
      shootingProfile: "recurve_outdoor",
      shootingEnvironment: "outdoor"
    }, profile);
    const indoor = originalScoreModel(modelName, {
      ...input,
      shootingProfile: "recurve_indoor",
      shootingEnvironment: "indoor"
    }, profile);
    return outdoor.score >= indoor.score ? outdoor : indoor;
  };

  // Ne jamais rabattre silencieusement une longueur hors tableau sur la derniere colonne fabricant.
  window.eastonCarbonRecommendation = function eastonCarbonRecommendationFixed(input) {
    return roundedLengthInRange(input, 21, 34, "Easton carbone") || originalEastonCarbonRecommendation(input);
  };
  window.eastonAluRecommendation = function eastonAluRecommendationFixed(input) {
    return roundedLengthInRange(input, 21, 32, "Easton alu") || originalEastonAluRecommendation(input);
  };
  window.victoryRecurveRecommendation = function victoryRecurveRecommendationFixed(input) {
    return roundedLengthInRange(input, 23, 31, "Victory recurve") || originalVictoryRecurveRecommendation(input);
  };
  window.victoryVxtRecommendation = function victoryVxtRecommendationFixed(input) {
    if (roundedLengthInRange(input, 23, 31, "Victory VXT")) return null;
    return originalVictoryVxtRecommendation(input);
  };
  window.carbonExpressRecommendation = function carbonExpressRecommendationFixed(input) {
    const isLightChart = input.drawWeight <= 34 && input.arrowLength <= 27;
    const rangeError = isLightChart
      ? roundedLengthInRange(input, 21, 27, "Carbon Express light recurve")
      : roundedLengthInRange(input, 23, 32, "Carbon Express recurve series");
    return rangeError || originalCarbonExpressRecommendation(input);
  };

  // Cible classique coherente : +6 mm pour 66/68, +4 mm pour 70/72.
  window.computeArcSetup = function computeArcSetupFixed(input) {
    const setup = originalComputeArcSetup(input);
    const recommendedTiller = input.arcLength >= 70 ? 4 : 6;
    const expectedLowerDistance = Math.round((input.upperTiller - recommendedTiller) * 10) / 10;
    setup.lowerTiller = expectedLowerDistance;
    setup.lowerGap = Math.round((input.lowerTillerMeasured - expectedLowerDistance) * 10) / 10;
    setup.tillerTarget = recommendedTiller;
    setup.tillerAction = `Avec un tiller positif de depart a +${recommendedTiller} mm, la distance basse attendue est ${expectedLowerDistance.toFixed(1)} mm.`;
    setup.adjustment = window.buildTillerAdjustment(setup.actualTiller, recommendedTiller);
    return setup;
  };

  // Barebow : l'orientation mecanique doit viser 0 mm, sans reutiliser l'avis classique +4/+6 mm.
  const originalRenderBarebowArcSetup = window.renderBarebowArcSetup;
  window.renderBarebowArcSetup = function renderBarebowArcSetupFixed(input) {
    const originalBuilder = window.computeArcSetup;
    window.computeArcSetup = function barebowComputeArcSetup(barebowInput) {
      const setup = originalBuilder(barebowInput);
      const target = 0;
      const expectedLowerDistance = Math.round((barebowInput.upperTiller - target) * 10) / 10;
      setup.lowerTiller = expectedLowerDistance;
      setup.lowerGap = Math.round((barebowInput.lowerTillerMeasured - expectedLowerDistance) * 10) / 10;
      setup.tillerTarget = target;
      setup.tillerAction = `Base barebow a ${target} mm de tiller.`;
      setup.adjustment = window.buildTillerAdjustment(setup.actualTiller, target);
      return setup;
    };
    try {
      return originalRenderBarebowArcSetup(input);
    } finally {
      window.computeArcSetup = originalBuilder;
    }
  };
})();
