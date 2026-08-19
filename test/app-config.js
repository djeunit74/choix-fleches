/* Configuration centrale Assistant Archer TEST. */
window.AssistantArcherConfig = Object.freeze({
  version: '2026.08.19-v36',
  channel: 'test',
  historyLimit: 5,
  principles: Object.freeze({
    advisoryOnly: true,
    manufacturerSourcesFirst: true,
    coachValidationRecommended: true,
    measuredDrawWeightPreferred: true
  })
});

/* TEST v36 : ne plus afficher de spines alternatifs dans la recommandation.
   Le moteur conserve son calcul interne ; seule la recommandation principale est presentee a l'archer. */
function removeAlternativeSpines() {
  const result = document.getElementById('result');
  if (!result) return;
  result.querySelectorAll('p').forEach(p => {
    if (/^\s*Alternatives?\s+spine\s*:/i.test(p.textContent || '')) p.remove();
  });
}

function installAlternativeSpineGuard() {
  const result = document.getElementById('result');
  if (!result) return;
  removeAlternativeSpines();
  new MutationObserver(removeAlternativeSpines).observe(result, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installAlternativeSpineGuard, { once: true });
else installAlternativeSpineGuard();
