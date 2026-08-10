/* Correctifs issus de l'audit du 10/08/2026. */
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
  const originalRenderBarebowArcSetup = window.renderBarebowArcSetup;
  const originalUpdateArcSetupCopyForBowStyle = window.updateArcSetupCopyForBowStyle;
  const originalUpdateSightCopyForBowStyle = window.updateSightCopyForBowStyle;

  function roundedLengthInRange(input, min, max, label) {
    const roundedLength = Math.round(input.arrowLength);
    if (roundedLength < min || roundedLength > max) {
      return { ok: false, message: `Longueur hors tableau ${label} (${min} a ${max} pouces).` };
    }
    return null;
  }

  window.normalizeInput = function normalizeInputFixed(input) {
    if (input.shaftMaterial !== "all") return originalNormalizeInput(input);
    return { ...input, shootingProfile: "recurve_all", shootingEnvironment: "mixed", discipline: "target" };
  };

  window.scoreModel = function scoreModelFixed(modelName, input, profile) {
    if (input.shaftMaterial !== "all") return originalScoreModel(modelName, input, profile);
    const outdoor = originalScoreModel(modelName, { ...input, shootingProfile: "recurve_outdoor", shootingEnvironment: "outdoor" }, profile);
    const indoor = originalScoreModel(modelName, { ...input, shootingProfile: "recurve_indoor", shootingEnvironment: "indoor" }, profile);
    return outdoor.score >= indoor.score ? outdoor : indoor;
  };

  window.eastonCarbonRecommendation = (input) => roundedLengthInRange(input, 21, 34, "Easton carbone") || originalEastonCarbonRecommendation(input);
  window.eastonAluRecommendation = (input) => roundedLengthInRange(input, 21, 32, "Easton alu") || originalEastonAluRecommendation(input);
  window.victoryRecurveRecommendation = (input) => roundedLengthInRange(input, 23, 31, "Victory recurve") || originalVictoryRecurveRecommendation(input);
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

  // Classique : +2 a +6 mm est une plage, pas une cible unique.
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
    setup.adjustment = actualTiller >= minTiller && actualTiller <= maxTiller
      ? { status: "OK - dans la plage conseillee", advice: `Le tiller mesure (+${actualTiller.toFixed(1)} mm) est compris entre +${minTiller} et +${maxTiller} mm. Ne modifiez pas les vis uniquement pour viser +6 mm.` }
      : window.buildTillerAdjustment(actualTiller, target);
    if (Array.isArray(setup.checks)) {
      setup.checks = setup.checks.map((line) => line.startsWith("Tiller :")
        ? `Tiller : plage de depart conseillee entre +${minTiller} et +${maxTiller} mm, a affiner selon le comportement de l'arc.`
        : line);
    }
    return setup;
  };

  window.renderArcSetup = function renderArcSetupFixed(input) {
    const result = originalRenderArcSetup(input);
    const output = document.getElementById("arcSetupResult");
    if (output) {
      output.innerHTML = output.innerHTML
        .replace(/<strong>Tiller positif vise<\/strong> : \+[^<]+ mm/, '<strong>Plage de tiller conseillee</strong> : +2 a +6 mm')
        .replace(/<strong>Tiller<\/strong> : base visee \+[^|]+\|/, '<strong>Tiller</strong> : plage conseillee +2 a +6 mm |');
    }
    return result;
  };

  // Barebow : tiller faible/proche de zero, mais zero n'est pas une cible absolue.
  window.renderBarebowArcSetup = function renderBarebowArcSetupFixed(input) {
    const classicalBuilder = window.computeArcSetup;
    window.computeArcSetup = function barebowComputeArcSetup(barebowInput) {
      const setup = originalComputeArcSetup(barebowInput);
      const minTiller = -2;
      const maxTiller = 2;
      const actualTiller = setup.actualTiller;
      const target = Math.max(minTiller, Math.min(maxTiller, actualTiller));
      const expectedLowerDistance = Math.round((barebowInput.upperTiller - target) * 10) / 10;
      setup.tillerRange = [minTiller, maxTiller];
      setup.lowerTiller = expectedLowerDistance;
      setup.lowerGap = Math.round((barebowInput.lowerTillerMeasured - expectedLowerDistance) * 10) / 10;
      setup.tillerTarget = target;
      setup.tillerAction = actualTiller >= minTiller && actualTiller <= maxTiller
        ? `Tiller faible/proche de zero (${actualTiller.toFixed(1)} mm) : conserver comme base si l'arc est stable, puis valider au tir sur plusieurs crawls.`
        : `Tiller ${actualTiller.toFixed(1)} mm : verifier d'abord la recommandation fabricant puis revenir progressivement vers un tiller faible si necessaire.`;
      setup.adjustment = actualTiller >= minTiller && actualTiller <= maxTiller
        ? { status: "Base barebow coherente", advice: "Ne cherchez pas a atteindre exactement 0 mm. Validez le comportement de l'arc sur plusieurs crawls." }
        : window.buildTillerAdjustment(actualTiller, target);
      return setup;
    };
    try {
      return originalRenderBarebowArcSetup(input);
    } finally {
      window.computeArcSetup = classicalBuilder;
    }
  };

  document.querySelectorAll(".arc-classic-only p").forEach((paragraph) => {
    if (paragraph.textContent.includes("Repere de base")) {
      paragraph.innerHTML = 'Le <strong>band</strong> depend surtout de la taille d\'arc. Le <strong>tiller positif</strong> se calcule ainsi : <strong>tiller haut - tiller bas</strong>. Repere de depart : entre <strong>+2 et +6 mm</strong>. Une valeur dans cette plage n\'a pas a etre ramenee systematiquement a +6 mm.';
    }
  });

  window.updateArcSetupCopyForBowStyle = function updateArcSetupCopyForBowStyleFixed(style) {
    originalUpdateArcSetupCopyForBowStyle(style);
    if (window.normalizeBowStyle(style) !== "barebow") return;
    const ref = document.getElementById("arcSetupDocRef");
    if (ref) {
      ref.innerHTML = 'References barebow : <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Arc nu</a> pour l\'equipement et le stringwalking, et <a href="https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf" target="_blank" rel="noopener noreferrer">World Archery Coaching Manual Level 2</a> pour les principes de band, tiller, berger button, detalonnage et affinage au tir.';
    }
  };

  // Aucun vocabulaire de viseur en mode barebow.
  window.updateSightCopyForBowStyle = function updateSightCopyForBowStyleFixed(style) {
    originalUpdateSightCopyForBowStyle(style);
    if (window.normalizeBowStyle(style) !== "barebow") return;
    const sightForm = document.getElementById("sight-form");
    if (!sightForm) return;
    const title = sightForm.querySelector(".subcard h3");
    if (title) title.textContent = "Fiche barebow";
    const equipmentInput = document.getElementById("sightEquipment");
    if (equipmentInput) {
      const label = equipmentInput.closest("label");
      const textNode = label && Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (textNode) textNode.textContent = "\n                Arc / materiel barebow\n                ";
      equipmentInput.placeholder = "Ex : WNS / Hoyt / palette / berger button";
    }
    const notes = document.getElementById("sightNotes");
    if (notes) notes.placeholder = "Ex : crawl 30 m, repere palette, prise de corde, sensations...";
    document.getElementById("sightVisual")?.setAttribute("aria-label", "Representation des reperes barebow par distance");
    document.getElementById("scaleLabelSideSight")?.setAttribute("aria-label", "Position des mesures de palette barebow");
  };

  // Installation PWA depuis Parametres.
  localStorage.setItem("sw-cleanup-v1", "done");
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  let deferredInstallPrompt = null;
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  function installAppSettingsControl() {
    const settingsBody = document.querySelector(".app-settings-body");
    if (!settingsBody || document.getElementById("installAppBtn")) return;
    const block = document.createElement("div");
    block.className = "app-install-setting";
    block.style.cssText = "margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.12)";
    const button = document.createElement("button");
    button.type = "button";
    button.id = "installAppBtn";
    button.textContent = isStandalone() ? "Application installee" : "Installer l'application";
    button.disabled = isStandalone();
    const status = document.createElement("p");
    status.id = "installAppStatus";
    status.style.cssText = "margin:.5rem 0 0;font-size:.9em";
    status.textContent = isStandalone() ? "L'application est deja installee sur ce telephone." : "Ajoute Assistant Archer comme une application sur le telephone.";
    button.addEventListener("click", async () => {
      if (isStandalone()) return;
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        status.textContent = choice.outcome === "accepted" ? "Installation lancee." : "Installation annulee.";
      } else if (isIOS()) {
        status.textContent = "Sur iPhone/iPad : Safari > Partager > Ajouter a l'ecran d'accueil.";
      } else {
        status.textContent = "Ouvrez le menu du navigateur puis choisissez Installer l'application ou Ajouter a l'ecran d'accueil.";
      }
    });
    block.append(button, status);
    settingsBody.appendChild(block);
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const status = document.getElementById("installAppStatus");
    if (status) status.textContent = "Pret a installer : touchez Installer l'application.";
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    const button = document.getElementById("installAppBtn");
    const status = document.getElementById("installAppStatus");
    if (button) { button.textContent = "Application installee"; button.disabled = true; }
    if (status) status.textContent = "Assistant Archer est installe sur ce telephone.";
  });
  installAppSettingsControl();

  // Charge le module de procedure barebow optimise sans modifier index.html.
  if (!document.querySelector('script[data-barebow-guidance]')) {
    const script = document.createElement("script");
    script.src = "barebow-guidance.js?v=20260810b";
    script.dataset.barebowGuidance = "true";
    document.head.appendChild(script);
  }

  queueMicrotask(() => {
    try { window.applyBowStyle(window.currentBowStyle()); } catch {}
  });
})();
