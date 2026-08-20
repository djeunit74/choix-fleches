/* Mini tutoriel Assistant Archer + gestion des mises a jour PWA. */
(() => {
  const KEY = 'assistant-archer-onboarding-v1';
  const CSS = `
    .aa-onboarding{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:end center;padding:16px}
    .aa-onboarding-backdrop{position:absolute;inset:0;background:rgba(5,15,28,.72);backdrop-filter:blur(3px)}
    .aa-onboarding-card{position:relative;width:min(520px,100%);padding:22px;border:1px solid rgba(255,255,255,.16);border-radius:22px;background:linear-gradient(160deg,#0d1b2b,#102b4e);color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.4)}
    .aa-onboarding-card h2{margin:12px 36px 8px 0;color:#fff;font-size:1.35rem}
    .aa-tutorial-text{margin:0 0 16px;line-height:1.5;color:#e8eef7}
    .aa-first-choice{margin:0 0 18px;display:grid;gap:14px}
    .aa-first-choice label{display:block;margin-bottom:7px;font-weight:700;color:#fff}
    .aa-first-choice select{width:100%;min-height:48px;padding:.7rem .8rem;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:#fff;color:#102033;font:inherit}
    .aa-choice-help{margin:6px 0 0;color:#d7e3f3;font-size:.9rem;line-height:1.4}
    .aa-tutorial-close{position:absolute;right:12px;top:10px;width:38px;min-height:38px;padding:0;border:0;background:transparent;color:#fff;font-size:1.8rem}
    .aa-tutorial-progress{display:flex;gap:6px}
    .aa-tutorial-progress span{height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.2)}
    .aa-tutorial-progress span.is-active{background:#2585e6}
    .aa-tutorial-actions{display:flex;gap:10px;justify-content:flex-end}
    .aa-tutorial-actions button{min-width:110px}
    .aa-tutorial-next{background:#1976d2!important;border-color:#1976d2!important;color:#fff!important}
    .aa-tutorial-next:disabled{opacity:.45!important;cursor:not-allowed}
    .aa-tutorial-back{background:transparent!important;border-color:rgba(255,255,255,.35)!important;color:#fff!important}
    .aa-update{position:fixed;z-index:2147482000;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:10px;max-width:560px;margin:auto;padding:12px 14px;border:1px solid rgba(255,255,255,.15);border-radius:16px;background:#0d1b2b;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.35)}
    .aa-update p{margin:0;flex:1;font-size:.92rem}
    .aa-update button{width:auto;min-width:112px;margin:0;padding:.7rem .9rem;background:#1976d2!important;border-color:#1976d2!important;color:#fff!important}
    .hero::after{background:var(--hero-badge)!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important;opacity:.98!important}
    .tab-button.is-active{background:linear-gradient(90deg,var(--accent),var(--accent-2))!important;border-color:var(--accent)!important;color:#fff!important}
    .app-settings-toggle{display:flex!important;align-items:center!important;gap:.45rem!important;width:auto!important;min-width:46px!important;padding:.55rem .7rem!important;border:2px solid var(--accent-2)!important;border-radius:14px!important;background:rgba(255,255,255,.94)!important;color:var(--accent-2)!important;font-weight:700!important;box-shadow:0 4px 14px rgba(0,0,0,.16)!important}
    .app-settings[open] .app-settings-toggle{background:linear-gradient(90deg,var(--accent),var(--accent-2))!important;color:#fff!important;border-color:var(--accent)!important}
    .app-settings-toggle .gear-icon{font-size:1.05rem!important}
    .app-settings-toggle .gear-icon::after{content:''}
    .app-settings-toggle .aa-settings-label{font-size:.9rem;line-height:1}
    .card h2,.subcard h3,.measurement-guide h3{color:var(--accent-2)!important}
    button[type="submit"],.row-actions button:first-child{background:linear-gradient(90deg,var(--accent),var(--accent-2))!important;border-color:var(--accent)!important;color:#fff!important}
    @media(min-width:700px){.aa-onboarding{place-items:center}.aa-onboarding-card{padding:28px}}
  `;

  if (!document.getElementById('aaOnboardingStyle')) {
    const style = document.createElement('style');
    style.id = 'aaOnboardingStyle';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const steps = [
    {
      title: 'Bienvenue dans Assistant Archer',
      text: 'Pour commencer, indiquez votre type d’arc et votre pratique principale. L’application adaptera ses conseils à ce profil.',
      tab: null,
      firstChoices: true
    },
    { title: '1. Flèches', text: 'Saisissez votre puissance réellement tirée et la longueur de flèche. L’app propose une base à comparer ensuite au tableau du fabricant et à votre pratique.', tab: 'spine' },
    { title: '2. Réglage de base', text: 'Band, tiller, détalonnage, centrage et berger donnent des points de départ. Les valeurs restent à adapter à votre matériel et à valider au tir.', tab: 'arc-setup' },
    { title: '3. Réglage dynamique', text: 'Le test fût nu peut aider à dégager une tendance. Faites une seule petite modification à la fois, puis vérifiez si le résultat est reproductible.', tab: 'dynamic' },
    { title: '4. Mes réglages et repères', text: 'Gardez une trace de votre configuration et de vos repères pour pouvoir comparer vos essais dans le temps.', tab: 'notebook' }
  ];

  let index = 0;
  let firstBowChoice = '';
  let firstThemeChoice = '';

  function selectTab(tab) {
    if (tab) document.querySelector(`.tab-button[data-tab="${tab}"]`)?.click();
  }

  function applyBowChoice(value) {
    if (!value) return;
    const select = document.getElementById('bowStyle');
    if (!select) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    localStorage.setItem('bowStyle', value);
  }

  function applyThemeChoice(value) {
    if (!['cible', 'campagne', '3d'].includes(value)) return;
    const select = document.getElementById('themeSelect');
    if (!select) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    localStorage.setItem('appTheme', value);
  }

  function firstStepComplete() {
    return Boolean(firstBowChoice && firstThemeChoice);
  }

  function closeTutorial() {
    if (index === 0 && steps[0].firstChoices && !firstStepComplete()) return;
    document.getElementById('aaOnboarding')?.remove();
    localStorage.setItem(KEY, 'done');
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'aaOnboarding';
    modal.className = 'aa-onboarding';
    modal.innerHTML = `
      <div class="aa-onboarding-backdrop"></div>
      <section class="aa-onboarding-card" role="dialog" aria-modal="true" aria-labelledby="aaTutorialTitle">
        <button class="aa-tutorial-close" type="button" aria-label="Fermer">×</button>
        <div class="aa-tutorial-progress"></div>
        <h2 id="aaTutorialTitle"></h2>
        <p class="aa-tutorial-text"></p>
        <div class="aa-first-choice" hidden>
          <div>
            <label for="aaBowChoice">Type d’arc</label>
            <select id="aaBowChoice">
              <option value="">Choisissez votre arc</option>
              <option value="classique">Classique</option>
              <option value="barebow">Barebow</option>
            </select>
          </div>
          <div>
            <label for="aaThemeChoice">Quelle est votre pratique principale ?</label>
            <select id="aaThemeChoice">
              <option value="">Choisissez votre pratique</option>
              <option value="cible">Cible</option>
              <option value="campagne">Campagne</option>
              <option value="3d">3D</option>
            </select>
            <p class="aa-choice-help">Choisissez celle qui correspond le mieux à votre pratique actuelle. Vous pourrez la modifier à tout moment dans Réglages paramètres.</p>
          </div>
        </div>
        <div class="aa-tutorial-actions">
          <button type="button" class="secondary aa-tutorial-back">Retour</button>
          <button type="button" class="aa-tutorial-next">Suivant</button>
        </div>
      </section>`;

    document.body.appendChild(modal);
    modal.querySelector('.aa-tutorial-close').onclick = closeTutorial;
    modal.querySelector('.aa-onboarding-backdrop').onclick = closeTutorial;
    modal.querySelector('.aa-tutorial-back').onclick = () => { if (index > 0) { index--; render(); } };
    modal.querySelector('.aa-tutorial-next').onclick = () => {
      if (index === 0 && steps[0].firstChoices) {
        firstBowChoice = modal.querySelector('#aaBowChoice')?.value || '';
        firstThemeChoice = modal.querySelector('#aaThemeChoice')?.value || '';
        if (!firstStepComplete()) return;
        applyBowChoice(firstBowChoice);
        applyThemeChoice(firstThemeChoice);
      }
      if (index === steps.length - 1) closeTutorial();
      else { index++; render(); }
    };
    const refreshFirstStep = () => {
      firstBowChoice = modal.querySelector('#aaBowChoice')?.value || '';
      firstThemeChoice = modal.querySelector('#aaThemeChoice')?.value || '';
      modal.querySelector('.aa-tutorial-next').disabled = !firstStepComplete();
    };
    modal.querySelector('#aaBowChoice').addEventListener('change', refreshFirstStep);
    modal.querySelector('#aaThemeChoice').addEventListener('change', refreshFirstStep);
    return modal;
  }

  function render() {
    document.querySelector('.app-settings[open]')?.removeAttribute('open');
    const modal = document.getElementById('aaOnboarding') || createModal();
    const step = steps[index];
    selectTab(step.tab);
    modal.querySelector('#aaTutorialTitle').textContent = step.title;
    modal.querySelector('.aa-tutorial-text').textContent = step.text;
    modal.querySelector('.aa-tutorial-progress').innerHTML = steps.map((_, i) => `<span class="${i === index ? 'is-active' : ''}"></span>`).join('');
    modal.querySelector('.aa-tutorial-back').hidden = index === 0;
    modal.querySelector('.aa-tutorial-next').textContent = index === steps.length - 1 ? 'Commencer' : 'Suivant';

    const choiceWrap = modal.querySelector('.aa-first-choice');
    choiceWrap.hidden = !step.firstChoices;
    if (step.firstChoices) {
      const savedTheme = document.getElementById('themeSelect')?.value || localStorage.getItem('appTheme') || 'cible';
      modal.querySelector('#aaBowChoice').value = firstBowChoice || '';
      modal.querySelector('#aaThemeChoice').value = firstThemeChoice || savedTheme;
      firstThemeChoice = modal.querySelector('#aaThemeChoice').value;
      modal.querySelector('.aa-tutorial-next').disabled = !firstStepComplete();
      modal.querySelector('.aa-tutorial-close').hidden = true;
    } else {
      modal.querySelector('.aa-tutorial-next').disabled = false;
      modal.querySelector('.aa-tutorial-close').hidden = false;
    }
  }

  function start() {
    index = 0;
    firstBowChoice = '';
    firstThemeChoice = document.getElementById('themeSelect')?.value || localStorage.getItem('appTheme') || 'cible';
    render();
  }

  function enhanceSettingsToggle() {
    const toggle = document.querySelector('.app-settings-toggle');
    if (!toggle) return false;
    toggle.setAttribute('aria-label', 'Ouvrir Réglages Paramètres');
    let label = toggle.querySelector('.aa-settings-label');
    if (!label) {
      label = document.createElement('span');
      label.className = 'aa-settings-label';
      toggle.appendChild(label);
    }
    label.textContent = 'Réglages Paramètres';
    return true;
  }

  function bindButton() {
    const body = document.querySelector('.app-settings-body');
    if (!body) return false;
    let button = document.getElementById('restartTutorialBtn');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'restartTutorialBtn';
      button.className = 'secondary';
      button.textContent = 'Revoir le mini tutoriel';
      button.style.marginTop = '.7rem';
      body.appendChild(button);
    }
    button.onclick = event => { event.preventDefault(); event.stopPropagation(); start(); };
    enhanceSettingsToggle();
    return true;
  }

  window.startAssistantArcherTutorial = start;
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    enhanceSettingsToggle();
    if (bindButton() || tries > 20) clearInterval(timer);
  }, 200);
  setTimeout(() => { enhanceSettingsToggle(); bindButton(); if (!localStorage.getItem(KEY)) start(); }, 700);

  function showUpdate(registration) {
    if (document.getElementById('aaUpdateBanner')) return;
    const bar = document.createElement('div');
    bar.id = 'aaUpdateBanner';
    bar.className = 'aa-update';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<p><strong>Mise à jour disponible.</strong><br>Vos réglages enregistrés sont conservés.</p><button type="button">Mettre à jour</button>';
    bar.querySelector('button').onclick = () => {
      const worker = registration.waiting;
      if (!worker) return;
      worker.postMessage({ type: 'SKIP_WAITING' });
      bar.querySelector('button').disabled = true;
      bar.querySelector('button').textContent = 'Mise à jour…';
    };
    document.body.appendChild(bar);
  }

  async function setupUpdates() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      if (registration.waiting && navigator.serviceWorker.controller) showUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(registration);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (sessionStorage.getItem('aa-reloading')) return;
        sessionStorage.setItem('aa-reloading', '1');
        window.location.reload();
      });
      window.addEventListener('focus', () => registration.update().catch(() => {}));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      });
      registration.update().catch(() => {});
    } catch {}
  }

  setupUpdates();
})();