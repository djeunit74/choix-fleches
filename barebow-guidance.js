/* Guidance barebow World Archery : procedure de reglage progressive. */
(() => {
  const originalRenderBarebowArcSetup = window.renderBarebowArcSetup;
  const originalUpdateArcSetupCopyForBowStyle = window.updateArcSetupCopyForBowStyle;

  function numberValue(id) {
    const el = document.getElementById(id);
    if (!el || el.value === "") return null;
    const value = Number(String(el.value).replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }

  function ensureBarebowGuide() {
    const card = document.getElementById("barebowArcSetupCard");
    if (!card || document.getElementById("barebowTuningGuide")) return;

    const guide = document.createElement("div");
    guide.id = "barebowTuningGuide";
    guide.className = "measurement-guide";
    guide.innerHTML = `
      <h3>Procedure barebow conseillee</h3>
      <ol class="measurement-list">
        <li><strong>Band</strong> : partir de la plage constructeur, puis chercher le meilleur comportement et le meilleur groupement.</li>
        <li><strong>Tiller</strong> : partir d'un tiller faible, souvent proche de 0 mm, sans imposer 0 mm comme cible universelle. Respecter la plage du fabricant et affiner au tir.</li>
        <li><strong>Detalonnage</strong> : point de depart pratique autour de <strong>5 a 6 mm</strong> au-dessus de l'equerre, puis affiner a une distance/crawl intermediaire.</li>
        <li><strong>Centrage et berger button</strong> : regler le centrage initial et une pression de ressort moyenne, puis affiner avec le vol de fleche et le groupement.</li>
        <li><strong>Validation stringwalking</strong> : verifier ensuite au moins une courte, une moyenne et une longue distance. Le bon reglage est un compromis qui reste stable sur plusieurs crawls.</li>
      </ol>
      <p><strong>Important :</strong> les valeurs de depart ne sont pas des cibles absolues. Une modification doit etre validee au tir avant de passer a l'etape suivante.</p>
    `;
    card.appendChild(guide);
  }

  function renderMeasuredGuidance() {
    if (window.currentBowStyle?.() !== "barebow") return;
    ensureBarebowGuide();

    let box = document.getElementById("barebowMeasuredGuidance");
    const card = document.getElementById("barebowArcSetupCard");
    if (!card) return;
    if (!box) {
      box = document.createElement("div");
      box.id = "barebowMeasuredGuidance";
      box.className = "measurement-guide";
      card.appendChild(box);
    }

    const band = numberValue("arcBbBandMeasured");
    const tiller = numberValue("arcBbTillerMeasured");
    const nocking = numberValue("arcBbNockingMeasured");
    const lines = [];

    if (band === null) {
      lines.push("Band : renseignez la valeur mesuree puis comparez-la d'abord a la plage du fabricant de vos branches/arc.");
    } else {
      lines.push(`Band mesure : ${band.toFixed(1)} cm. Ne cherchez pas une valeur universelle : restez dans la plage constructeur puis affinez au bruit, aux vibrations et au groupement.`);
    }

    if (tiller === null) {
      lines.push("Tiller : mesurez-le avant correction. En barebow, un tiller faible/proche de 0 mm est un point de depart courant, pas une obligation.");
    } else if (Math.abs(tiller) <= 2) {
      lines.push(`Tiller mesure : ${tiller.toFixed(1)} mm. Valeur faible : conservez-la comme base si l'arc est stable, puis validez sur plusieurs crawls.`);
    } else {
      lines.push(`Tiller mesure : ${tiller.toFixed(1)} mm. Ne le ramenez pas automatiquement a 0 : verifiez d'abord la recommandation fabricant et l'equilibre sur vos crawls.`);
    }

    if (nocking === null) {
      lines.push("Detalonnage : utilisez 5 a 6 mm comme point de depart pratique, puis affinez a une distance/crawl intermediaire.");
    } else if (nocking >= 5 && nocking <= 6) {
      lines.push(`Detalonnage mesure : ${nocking.toFixed(1)} mm. Vous etes dans la zone de depart 5-6 mm ; passez maintenant a la validation au tir, sans chercher a rester absolument dans cette plage.`);
    } else {
      lines.push(`Detalonnage mesure : ${nocking.toFixed(1)} mm. La base 5-6 mm est seulement un point de depart ; si votre vol et vos groupements sont meilleurs ainsi sur plusieurs crawls, ne corrigez pas uniquement pour revenir a 5-6 mm.`);
    }

    box.innerHTML = `<h3>Lecture de vos mesures</h3><ul class="measurement-list">${lines.map((line) => `<li>${line}</li>`).join("")}</ul><p><strong>Etape suivante :</strong> apres band/tiller/detalonnage, reglez centrage + berger button, puis validez courte / moyenne / longue distance avant d'enregistrer vos crawls.</p>`;
  }

  window.renderBarebowArcSetup = function renderBarebowArcSetupGuided(input) {
    const result = originalRenderBarebowArcSetup(input);
    renderMeasuredGuidance();
    return result;
  };

  window.updateArcSetupCopyForBowStyle = function updateArcSetupCopyForBowStyleGuided(style) {
    originalUpdateArcSetupCopyForBowStyle(style);
    if (window.normalizeBowStyle(style) !== "barebow") return;
    ensureBarebowGuide();
    const ref = document.getElementById("arcSetupDocRef");
    if (ref) {
      ref.innerHTML = 'References barebow : <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Arc nu</a> pour l\'equipement et le stringwalking, et <a href="https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf" target="_blank" rel="noopener noreferrer">World Archery Coaching Manual Level 2</a> pour les principes de band, tiller, berger button, detalonnage et validation au tir.';
    }
    renderMeasuredGuidance();
  };

  ["arcBbBandMeasured", "arcBbTillerMeasured", "arcBbNockingMeasured"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderMeasuredGuidance);
  });

  queueMicrotask(() => {
    ensureBarebowGuide();
    if (window.currentBowStyle?.() === "barebow") renderMeasuredGuidance();
  });
})();
