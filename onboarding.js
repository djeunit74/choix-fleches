/* Mini tutoriel Assistant Archer - affiche une seule fois, relancable depuis les reglages. */
(() => {
  const KEY = 'assistant-archer-onboarding-v1';
  const steps = [
    { title: 'Bienvenue dans Assistant Archer', text: 'L’app vous accompagne du choix des flèches jusqu’au réglage au tir. Commencez par indiquer votre type d’arc et vos mesures.', tab: null },
    { title: '1. Flèches', text: 'Entrez votre puissance réellement tirée et la longueur de flèche. L’app compare les tableaux fabricants et propose des références cohérentes.', tab: 'spine' },
    { title: '2. Réglage de base', text: 'Réglez d’abord l’arc sans tirer : band, tiller, détalonnage, centrage et berger. Les conseils s’adaptent au classique ou au barebow.', tab: 'arc-setup' },
    { title: '3. Réglage dynamique', text: 'Une fois la base correcte, suivez le test fût nu pas à pas. Faites une seule correction à la fois, puis recommencez le test.', tab: 'dynamic' },
    { title: '4. Mes réglages et repères', text: 'Gardez vos valeurs finales dans Mes réglages. Repères sert au viseur en classique et aux crawls/stringwalking en barebow.', tab: 'notebook' }
  ];
  let index = 0;
  function selectTab(tab) {
    if (!tab) return;
    document.querySelector(`.tab-button[data-tab="${tab}"]`)?.click();
  }
  function closeTutorial(done = true) {
    document.getElementById('aaOnboarding')?.remove();
    if (done) localStorage.setItem(KEY, 'done');
  }
  function render() {
    let modal = document.getElementById('aaOnboarding');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aaOnboarding'; modal.className = 'aa-onboarding';
      modal.innerHTML = '<div class="aa-onboarding-backdrop"></div><section class="aa-onboarding-card" role="dialog" aria-modal="true" aria-labelledby="aaTutorialTitle"><button class="aa-tutorial-close" type="button" aria-label="Fermer">×</button><div class="aa-tutorial-progress"></div><h2 id="aaTutorialTitle"></h2><p class="aa-tutorial-text"></p><div class="aa-tutorial-actions"><button type="button" class="secondary aa-tutorial-back">Retour</button><button type="button" class="aa-tutorial-next">Suivant</button></div></section>';
      document.body.appendChild(modal);
      modal.querySelector('.aa-tutorial-close').onclick = () => closeTutorial(true);
      modal.querySelector('.aa-onboarding-backdrop').onclick = () => closeTutorial(true);
      modal.querySelector('.aa-tutorial-back').onclick = () => { if (index > 0) { index--; render(); } };
      modal.querySelector('.aa-tutorial-next').onclick = () => { if (index === steps.length - 1) closeTutorial(true); else { index++; render(); } };
    }
    const step = steps[index]; selectTab(step.tab);
    modal.querySelector('#aaTutorialTitle').textContent = step.title;
    modal.querySelector('.aa-tutorial-text').textContent = step.text;
    modal.querySelector('.aa-tutorial-progress').innerHTML = steps.map((_,i)=>`<span class="${i===index?'is-active':''}"></span>`).join('');
    modal.querySelector('.aa-tutorial-back').hidden = index === 0;
    modal.querySelector('.aa-tutorial-next').textContent = index === steps.length - 1 ? 'Commencer' : 'Suivant';
  }
  function start() { index = 0; render(); }
  function addSettingsLink() {
    const body = document.querySelector('.app-settings-body');
    if (!body || document.getElementById('restartTutorialBtn')) return;
    const b = document.createElement('button'); b.type='button'; b.id='restartTutorialBtn'; b.className='secondary'; b.textContent='Revoir le mini tutoriel'; b.style.marginTop='.7rem'; b.onclick=start; body.appendChild(b);
  }
  window.startAssistantArcherTutorial = start;
  setTimeout(() => { addSettingsLink(); if (!localStorage.getItem(KEY)) start(); }, 500);
})();