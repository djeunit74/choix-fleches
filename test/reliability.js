/* Mesures, traçabilité et sauvegarde. Aucune validation fabricant implicite. */
(() => {
  'use strict';
  const sources = `<a href="https://eastonarchery.com/selector/" target="_blank" rel="noopener noreferrer">Sélecteur officiel Easton</a> · <a href="https://eastonarchery.com/foc-calculator/" target="_blank" rel="noopener noreferrer">Calculateur FOC Easton</a>`;
  const card = document.createElement('section');
  card.className = 'card reliability-card';
  card.innerHTML = `<details><summary>Sources et limites de l’application</summary><p>Les transcriptions Easton, Victory et Skylon ont été contrôlées le 21 octobre 2026. Elles donnent une référence de tableau, sans certifier un modèle ou un montage complet.</p><p><strong>Mesuré</strong> : vos relevés. <strong>Calculé</strong> : une opération sur ces relevés. <strong>À confirmer au tir</strong> : le choix final du montage.</p><p>${sources}</p><p><a href="audit-report.md">Rapport des vérifications</a> · <a href="audit-inventory.json">Inventaire des données</a></p><p>Le catalogue historique, les prix et les compatibilités non démontrés restent exclus des conseils automatiques. Les consignes de la notice de votre matériel restent prioritaires.</p></details>`;
  document.querySelector('main')?.append(card);

  // Make measurement confirmation available in both search modes.
  const checks = document.querySelector('.measurement-check');
  document.getElementById('guidedQuestions')?.after(checks);
  window.validateGuidedMeasurements = () => {
    if (!document.getElementById('drawWeightKnown').checked || !document.getElementById('arrowLengthKnown').checked)
      return 'Confirmez les deux mesures : puissance réelle au peson à votre allonge et longueur de la flèche. Ces confirmations sont nécessaires dans les deux modes.';
    return '';
  };
  for (const id of ['drawWeight', 'arrowLength']) {
    document.getElementById(id)?.addEventListener('input', () => {
      document.getElementById(id === 'drawWeight' ? 'drawWeightKnown' : 'arrowLengthKnown').checked = false;
    });
  }

  // Only report observed measurements; no universal target or inferred draw weight.
  window.renderArcSetup = input => {
    const tiller = input.upperTiller - input.lowerTillerMeasured;
    const signed = `${tiller > 0 ? '+' : ''}${tiller.toFixed(1)}`;
    document.getElementById('arcSetupResult').innerHTML = `<h2>Vos mesures de réglage</h2><p><strong>Tiller calculé : ${signed} mm</strong> (haut moins bas).</p><p>Band mesuré : ${Number.isFinite(input.braceMeasured) ? input.braceMeasured.toFixed(1) + ' cm' : 'non renseigné'}.</p><p>Ces mesures ne permettent pas de dire si le réglage est bon sans la notice du matériel et une validation au tir. La taille de l’arc seule ne définit pas un band cible. La puissance marquée et l’allonge ne suffisent pas à calculer la puissance réelle : mesurez-la au peson.</p><p>Pour modifier les vis de branches, suivez la procédure et les limites de la notice du modèle exact.</p>`;
    // Prevent the notebook from reusing an obsolete computed target.
    if (typeof lastArcSetupSnapshot !== 'undefined') lastArcSetupSnapshot = null;
  };

  const backup = document.createElement('details');
  backup.id = 'backup-card';
  backup.className = 'card';
  backup.innerHTML = `<summary>Sauvegarder ou retrouver mes fiches</summary><p>Vos fiches restent dans ce navigateur. Gardez une sauvegarde pour changer d’appareil ou les retrouver après un effacement.</p><button type="button">Télécharger ma sauvegarde</button><p role="status"></p>`;
  document.querySelector('[data-panel="notebook"]')?.append(backup);
  backup.querySelector('button').addEventListener('click', () => {
    const status = backup.querySelector('[role="status"]');
    try {
      const data = {};
      for (const key of ['archerNotebook', 'sightNotebook', 'spineHistory', 'barebowArcSetup']) {
        const raw = localStorage.getItem(key);
        data[key] = raw === null ? null : JSON.parse(raw);
      }
      const url = URL.createObjectURL(new Blob([JSON.stringify({ schema: 'assistant-archer-backup-v1', exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'assistant-archer-sauvegarde.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Sauvegarde préparée. Conservez le fichier téléchargé.';
    } catch { status.textContent = 'Sauvegarde impossible : les données locales sont illisibles ou inaccessibles.'; }
  });
})();
