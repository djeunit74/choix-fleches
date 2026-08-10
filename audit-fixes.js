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
  const originalRenderArcSetup = window.renderArcSetup;

  function roundedLengthInRange(input, min, max, label) {
    const roundedLength = Math.round(input.arrowLength);
    if (roundedLength < min || roundedLength > max) {
      return { ok: false, message: `Longueur hors tableau ${label} (${min} a ${max} pouces).` };
    }
    return null;
  }

  window.normalizeInput = function normalizeInputFixed(input) {
    if (input.shaftMaterial !== "all") return originalNormalizeInput(input);
    return {
      ...input,
      shootingProfile: "recurve_all",
      shootingEnvironment: "mixed",
      discipline: "target"
    };
  };

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

  // Classique : +2 a +6 mm est une plage de depart, pas une cible unique.
  window.computeArcSetup = function computeArcSetupFixed(input) {
    const setup = originalComputeArcSetup(input);
    const minTiller = 2;
    const maxTiller = 6;
    const actualTiller = setup.actualTiller;
    const target = actualTiller < minTiller ? minTiller : actualTiller > maxTiller ? maxTiller : actualTiller;
    const expectedLowerDistance = Math.round((input.upperTiller - target) * 10) / 10;

    setup.tillerRange = [minTiller, maxTiller];
    setup.lowerTiller = expectedLowerDistance;
    setup.lowerGap = Math.round((input.lowerTillerMeasured - expectedLowerDistance) * 10) / 10;
    setup.tillerTarget = target;
    setup.tillerAction = actualTiller >= minTiller && actualTiller <= maxTiller
      ? `Tiller dans la plage de depart conseillee (+${minTiller} a +${maxTiller} mm). Conserver puis affiner au tir si necessaire.`
      : `Tiller hors plage de depart conseillee (+${minTiller} a +${maxTiller} mm). Corriger progressivement vers la limite la plus proche.`;

    if (actualTiller >= minTiller && actualTiller <= maxTiller) {
      setup.adjustment = {
        status: "OK - dans la plage conseillee",
        advice: `Le tiller mesure (+${actualTiller.toFixed(1)} mm) est compris entre +${minTiller} et +${maxTiller} mm. Ne modifiez pas les vis uniquement pour viser +6 mm.`
      };
    } else {
      setup.adjustment = window.buildTillerAdjustment(actualTiller, target);
    }

    if (Array.isArray(setup.checks)) {
      setup.checks = setup.checks.map((line) => line.startsWith("Tiller :")
        ? `Tiller : plage de depart conseillee entre +${minTiller} et +${maxTiller} mm, a affiner selon le comportement de l'arc.`
        : line);
    }
    return setup;
  };

  window.renderArcSetup = function renderArcSetupFixed(input) {
    const result = originalRenderArcSetup(input);
    const arcSetupResult = document.getElementById("arcSetupResult");
    if (arcSetupResult) {
      arcSetupResult.innerHTML = arcSetupResult.innerHTML
        .replace(/<strong>Tiller positif vise<\/strong> : \+[^<]+ mm/, '<strong>Plage de tiller conseillee</strong> : +2 a +6 mm')
        .replace(/<strong>Tiller<\/strong> : base visee \+[^|]+\|/, '<strong>Tiller</strong> : plage conseillee +2 a +6 mm |');
    }
    return result;
  };

  // Barebow conserve sa logique distincte autour de 0 mm.
  const originalRenderBarebowArcSetup = window.renderBarebowArcSetup;
  window.renderBarebowArcSetup = function renderBarebowArcSetupFixed(input) {
    const originalBuilder = window.computeArcSetup;
    window.computeArcSetup = function barebowComputeArcSetup(barebowInput) {
      const setup = originalComputeArcSetup(barebowInput);
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

  document.querySelectorAll(".arc-classic-only p").forEach((paragraph) => {
    if (paragraph.textContent.includes("Repere de base")) {
      paragraph.innerHTML = 'Le <strong>band</strong> depend surtout de la taille d\'arc. Le <strong>tiller positif</strong> se calcule ainsi : <strong>tiller haut - tiller bas</strong>. Repere de depart : entre <strong>+2 et +6 mm</strong>. Une valeur situee dans cette plage n\'a pas a etre ramenee systematiquement a +6 mm. Ne saisissez pas directement le tiller positif ici.';
    }
  });

  // En barebow, aucun libelle ne doit laisser penser qu'un viseur est present.
  function setLabelText(inputId, text) {
    const input = document.getElementById(inputId);
    const label = input?.closest("label");
    if (!label) return;
    const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = `\n                ${text}\n                `;
  }

  function fixBarebowCopy() {
    const isBarebow = document.documentElement.dataset.bowStyle === "barebow";
    const sightForm = document.getElementById("sight-form");
    const firstHeading = sightForm?.querySelector(".subcard h3");
    if (firstHeading) firstHeading.textContent = isBarebow ? "Fiche barebow" : "Fiche viseur";

    setLabelText("sightEquipment", isBarebow ? "Arc / materiel barebow" : "Viseur / arc");

    const titleInput = document.getElementById("sightTitle");
    if (titleInput) titleInput.placeholder = isBarebow ? "Ex : barebow exterieur / salle" : "Ex : exterieur carbone / salle alu";

    const equipmentInput = document.getElementById("sightEquipment");
    if (equipmentInput) equipmentInput.placeholder = isBarebow ? "Ex : WNS / Hoyt / palette / prise 3-under" : "Ex : Shibuya / viseur club / WNS";

    const visual = document.getElementById("sightVisual");
    if (visual) visual.setAttribute("aria-label", isBarebow ? "Representation des reperes barebow" : "Representation des reperes de viseur");
  }

  const bowStyleObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-bow-style")) fixBarebowCopy();
  });
  bowStyleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bow-style"] });

  queueMicrotask(() => {
    try {
      window.applyBowStyle(window.currentBowStyle());
      fixBarebowCopy();
    } catch {
      // Aucun blocage de l'app si le DOM n'est pas encore pret pour une raison externe.
    }
  });
})();
