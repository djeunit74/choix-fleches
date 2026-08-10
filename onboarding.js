/* Mini tutoriel Assistant Archer - autonome, affiche une seule fois et relancable depuis les reglages. */
(() => {
  const KEY = 'assistant-archer-onboarding-v1';
  const STYLE_ID = 'aaOnboardingStyles';
  const steps = [
    { title: 'Bienvenue dans Assistant Archer', text: 'L’app vous accompagne du choix des flèches jusqu’au réglage au tir. Commencez par indiquer votre type d’arc et vos mesures.', tab: null },
    { title: '1. Flèches', text: 'Entrez votre puissance réellement tirée et la longueur de flèche. L’app compare les tableaux fabricants et propose des références cohérentes.', tab: 'spine' },
    { title: '2. Réglage de base', text: 'Réglez d’abord l’arc sans tirer : band, tiller, détalonnage, centrage et berger. Les conseils s’adaptent au classique ou au barebow.', tab: 'arc-setup' },
    { title: '3. Réglage dynamique', text: 'Une fois la base correcte, suivez le test fût nu pas à pas. Faites une seule correction à la fois, puis recommencez le test.', tab: 'dynamic' },
    { title: '4. Mes réglages et repères', text: 'Gardez vos valeurs finales dans Mes réglages. Repères sert au viseur en classique et aux crawls/stringwalking en barebow.', tab: 'notebook' }
  ];
  let index = 0;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .aa-onboarding{position:fixed;inset:0;z-index:99999;display:grid;place-items:end center;padding:16px}
      .aa-onboarding-backdrop{position:absolute;inset:0;background:rgba(5,15,28,.72);backdrop-filter:blur(3px)}
      .aa-onboarding-card{position:relative;width:min(520px,100%);padding:22px;border:1px solid rgba(255,255,255,.15);border-radius:22px;background:linear-gradient(160deg,#0d1b2b,#102b4e);color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.38)}
      .aa-onboarding-card h2{margin:12px 36px 8px 0;color:#fff;font-size:1.35rem}.aa-tutorial-text{margin:0 0 20px;line-height:1.5;color:#e8eef7}
      .aa-tutorial-close{position:absolute;right:12px;top:10px;width:38px;min-height:38px;padding:0;border:0;background:transparent;color:#fff;font-size:1.8rem}
      .aa-tutorial-progress{display:flex;gap:6px}.aa-tutorial-progress span{height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.2)}.aa-tutorial-progress span.is-active{background:#2585e6}
      .aa-tutorial-actions{display:flex;gap:10px;justify-content:flex-end}.aa-tutorial-actions button{min-width:110px;background:#1976d2;border-color:#1976d2;color:#fff}.aa-tutorial-actions .secondary{background:transparent;border-color:rgba(255,255,255,.35)}
      @media(min-width:700px){.aa-onboarding{place-items:center}.aa-onboarding-card{padding:28px}}
    `;
    document.head.appendChild(style);
  }

  function selectTab(tab) {
    if (!tab) return;
    document.querySelector(`.tab-button[data-tab="${tab}"]`)?.click();
  }
  function closeTutorial(done = true) {
    document.getElementById('aaOnboarding')?.remove();
    document.body.style.overflow = '';
    if (done) localStorage.setItem(KEY, 'done');
  }
  function render() {
    ensureStyles();
    let modal = document.getElementById('aaOnboarding');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aaOnboarding';
      modal.className = 'aa-onboarding';
      modal.innerHTML = '<div class="aa-onboarding-backdrop"></div><section class="aa-onboarding-card" role="dialog" aria-modal="true" aria-labelledby="aaTutorialTitle"><button class="aa-tutorial-close" type="button" aria-label="Fermer">×</button><div class="aa-tutorial-progress"></div><h2 id="aaTutorialTitle"></h2><p class="aa-tutorial-text"></p><div class="aa-tutorial-actions"><button type="button" class="secondary aa-tutorial-back">Retour</button><button type="button" class="aa-tutorial-next">Suivant</button></div></section>';
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
      modal.querySelector('.aa-tutorial-close').onclick = () => closeTutorial(true);
      modal.querySelector('.aa-onboarding-backdrop').onclick = () => closeTutorial(true);
      modal.querySelector('.aa-tutorial-back').onclick = () => { if (index > 0) { index--; render(); } };
      modal.querySelector('.aa-tutorial-next').onclick = () => { if (index === steps.length - 1) closeTutorial(true); else { index++; render(); } };
    }
    const step = steps[index];
    selectTab(step.tab);
    modal.querySelector('#aaTutorialTitle').textContent = step.title;
    modal.querySelector('.aa-tutorial-text').textContent = step.text;
    modal.querySelector('.aa-tutorial-progress').innerHTML = steps.map((_,i)=>`<span class="${i===index?'is-active':''}"></span>`).join('');
    modal.querySelector('.aa-tutorial-back').hidden = index === 0;
    modal.querySelector('.aa-tutorial-next').textContent = index === steps.length - 1 ? 'Commencer' : 'Suivant';
  }
  function start() {
    document.querySelector('.app-settings')?.removeAttribute('open');
    index = 0;
    render();
  }
  function addSettingsLink() {
    const body = document.querySelector('.app-settings-body');
    if (!body) return;
    let b = document.getElementById('restartTutorialBtn');
    if (!b) {
      b = document.createElement('button');
      b.type = 'button';
      b.id = 'restartTutorialBtn';
      b.className = 'secondary';
      b.textContent = 'Revoir le mini tutoriel';
      b.style.marginTop = '.7rem';
      body.appendChild(b);
    }
    b.onclick = (event) => { event.preventDefault(); event.stopPropagation(); start(); };
  }
  window.startAssistantArcherTutorial = start;
  ensureStyles();
  setTimeout(() => { addSettingsLink(); if (!localStorage.getItem(KEY)) start(); }, 400);
})();