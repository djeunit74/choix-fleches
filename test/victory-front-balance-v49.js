/* Assistant Archer TEST - Victory point + insert + FOC, Pré-alpha v49.
   S'applique uniquement au constructeur quand le tube choisi est Victory.
   La table de spine reste centralisée dans AssistantArcherVictorySelector.
   Observation limitée au panneau du constructeur, jamais au document global.
*/
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v49';
  let selectedInsert = 0;
  let selectedPoint = null;
  let panelObserver = null;

  const norm = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

  function currentTube() {
    const summary = document.getElementById('arrowBuilderSummary');
    const text = summary?.textContent || '';
    const tubePart = text.match(/Tube\s*:\s*([^\n]+?)(?=Empennage\s*:|$)/i)?.[1]?.trim() || '';
    const spine = tubePart.match(/\b(\d{3,4})\b(?!.*\d)/)?.[1] || '';
    const model = tubePart.replace(new RegExp(`\\s+${spine}$`),'').trim();
    const brand = document.getElementById('preferredBrand')?.value || '';
    return { brand, model, spine:Number(spine) || null };
  }

  function family(model) {
    const n = norm(model);
    if (n.includes('v tac 23')) return 'v-tac 23';
    if (n.includes('v tac 25')) return 'v-tac 25';
    if (n.includes('v tac 27')) return 'v-tac 27';
    if (n.includes('vxt')) return 'vxt';
    if (n.includes('vft')) return 'vft';
    if (/\bvap\b/.test(n)) return 'vap';
    if (n.includes('3dhv')) return '3dhv';
    if (n.includes('vx 27')) return 'vx-27';
    return '';
  }

  function insertConfig(key) {
    if (key === 'vft') return { values:[0,11,22,33], source:'Victory VFT', note:'Inserts avant VForce 11/22 gr ou VForce SS 33 gr.' };
    if (key === 'v-tac 23' || key === 'v-tac 25') return { values:[0,44], source:'Victory V-Tac', note:'Insert avant Victory 44 gr disponible.' };
    if (key === 'vap' || key === 'vxt') return { values:[0], source:`Victory ${key.toUpperCase()}`, note:'Pas d’insert avant ajouté dans le montage cible documenté : les pin bushings sont des composants arrière.' };
    return { values:[0], source:'Victory', note:'Aucun insert avant documenté pour ce montage dans la base active.' };
  }

  function selectorFor(front) {
    return window.AssistantArcherVictorySelector?.selectorResultForFront?.(front) || null;
  }

  function parseCard(card) {
    const line = card.querySelector('.arrow-balance-numbers')?.textContent || '';
    const point = Number(line.match(/(\d+(?:\.\d+)?)\s*gr/i)?.[1]);
    const foc = Number(line.match(/FOC\s*estim[eé]\s*(\d+(?:[.,]\d+)?)\s*%/i)?.[1]?.replace(',','.'));
    const mass = Number(line.match(/masse\s*estim[eé]e?\s*(\d+(?:[.,]\d+)?)\s*gr/i)?.[1]?.replace(',','.'));
    return { point, foc, mass };
  }

  function correctedEstimate(oldFoc, oldMass, insert) {
    const length = Number(document.getElementById('arrowLength')?.value);
    if (![oldFoc,oldMass,insert,length].every(Number.isFinite) || length <= 0) return null;
    const oldBalance = length / 2 + (oldFoc / 100) * length;
    const oldMoment = oldBalance * oldMass;
    const newMass = oldMass + insert;
    const newBalance = (oldMoment + insert * length) / newMass;
    const foc = ((newBalance - length / 2) / length) * 100;
    return { foc, mass:newMass };
  }

  function ensureInsertChooser(panel,tube) {
    if (!panel || tube.brand !== 'victory') return;
    const key = family(tube.model);
    const config = insertConfig(key);
    if (!config.values.includes(selectedInsert)) selectedInsert = config.values[0];
    let box = panel.querySelector('#victoryBuilderFrontV49');
    if (!box) {
      box = document.createElement('div');
      box.id = 'victoryBuilderFrontV49';
      box.className = 'arrow-builder-callout victory-front-control';
      const head = panel.querySelector('.arrow-builder-panel-head') || panel.firstElementChild;
      head?.insertAdjacentElement('afterend',box) || panel.prepend(box);
    }
    box.innerHTML = `<strong>Montage avant Victory</strong>
      <label style="display:block;margin:.4rem 0 0">Insert avant
        <select id="victoryBuilderInsertV49" style="margin-left:.35rem">
          ${config.values.map(v => `<option value="${v}"${v===selectedInsert?' selected':''}>${v} gr</option>`).join('')}
        </select>
      </label>
      <small style="display:block;margin-top:.3rem">${config.note} Le spine est recalculé avec pointe + insert avant.</small>`;
    box.querySelector('#victoryBuilderInsertV49')?.addEventListener('change',event => {
      selectedInsert = Number(event.target.value) || 0;
      const mainInsert = document.getElementById('victoryInsertWeightV48');
      if (mainInsert && [...mainInsert.options].some(o => Number(o.value) === selectedInsert)) mainInsert.value = String(selectedInsert);
      patchPanel();
    },{once:true});
  }

  function patchPointCards(panel,tube) {
    const cards = [...panel.querySelectorAll('.arrow-point-recommendation')];
    cards.forEach(card => {
      const parsed = parseCard(card);
      if (!Number.isFinite(parsed.point)) return;
      const front = parsed.point + selectedInsert;
      const result = selectorFor(front);
      const compatible = Boolean(result && Number.isFinite(tube.spine) && Number(result.spine) === Number(tube.spine));
      const button = card.querySelector('[data-point-config]');
      let status = card.querySelector('.victory-front-status-v49');
      if (!status) {
        status = document.createElement('p');
        status.className = 'victory-front-status-v49 muted';
        (card.querySelector('.arrow-balance-numbers') || card.querySelector('h4'))?.insertAdjacentElement('afterend',status);
      }
      if (!result) {
        status.innerHTML = `<strong>Avant total : ${front} gr.</strong> Hors des bandes Victory publiées (100–125 / 150–175 gr) : aucun spine extrapolé.`;
      } else if (compatible) {
        status.innerHTML = `<strong>Avant total : ${parsed.point} + ${selectedInsert} = ${front} gr.</strong> Victory recalcule spine <strong>${result.spine}</strong> : cohérent avec le tube choisi.`;
      } else {
        status.innerHTML = `<strong>Avant total : ${front} gr.</strong> Victory recalcule spine <strong>${result.spine}</strong>, alors que le tube choisi est ${tube.spine || 'non précisé'} : combinaison non validable.`;
      }
      if (button) {
        button.disabled = !compatible;
        button.setAttribute('aria-disabled',String(!compatible));
        if (!compatible) button.title = result ? `Victory recommande spine ${result.spine} avec ${front} gr devant` : 'Poids avant hors tableau Victory publié';
        else button.removeAttribute('title');
      }
      const line = card.querySelector('.arrow-balance-numbers');
      const corrected = correctedEstimate(parsed.foc,parsed.mass,selectedInsert);
      if (line && corrected && !line.dataset.victoryOriginal) {
        line.dataset.victoryOriginal = line.textContent;
      }
      if (line && corrected) {
        line.innerHTML = `<strong>${parsed.point} gr</strong> + insert ${selectedInsert} gr · avant <strong>${front} gr</strong> · FOC estimé <strong>${corrected.foc.toFixed(1)} %</strong> · masse estimée <strong>${Math.round(corrected.mass)} gr</strong>`;
      }
      if (button && !button.dataset.victoryFrontBoundV49) {
        button.dataset.victoryFrontBoundV49='1';
        button.addEventListener('click',() => {
          if (button.disabled) return;
          selectedPoint = parsed.point;
          const mainPoint = document.getElementById('victoryPointWeightV48');
          if (mainPoint && [...mainPoint.options].some(o => Number(o.value) === parsed.point)) mainPoint.value = String(parsed.point);
          setTimeout(() => { patchPanel(); patchSummary(); },0);
        },{capture:true});
      }
    });
  }

  function patchBalancePanel(panel,tube) {
    if (!selectedPoint || tube.brand !== 'victory') return;
    const summary = panel.querySelector('.arrow-balance-summary');
    if (!summary || summary.dataset.victoryFrontV49) return;
    const strongs = [...summary.querySelectorAll('strong')];
    const massEl = strongs.find(el => /gr/i.test(el.textContent));
    const focEl = strongs.find(el => /%/.test(el.textContent));
    const oldMass = Number(massEl?.textContent.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'));
    const oldFoc = Number(focEl?.textContent.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'));
    const corrected = correctedEstimate(oldFoc,oldMass,selectedInsert);
    if (!corrected) return;
    if (massEl) massEl.textContent = `${Math.round(corrected.mass)} gr`;
    if (focEl) focEl.textContent = `${corrected.foc.toFixed(1)} %`;
    summary.dataset.victoryFrontV49='1';
    const note = document.createElement('p');
    note.className='muted victory-front-balance-note-v49';
    note.textContent=`Victory : pointe ${selectedPoint} gr + insert avant ${selectedInsert} gr = ${selectedPoint + selectedInsert} gr devant. Le FOC affiché intègre cet insert à l’avant.`;
    summary.insertAdjacentElement('afterend',note);
  }

  function patchSummary() {
    if (!selectedPoint) return;
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary || document.getElementById('preferredBrand')?.value !== 'victory') return;
    const pointSpan = [...summary.querySelectorAll('span')].find(s => /Pointe\s*:/i.test(s.textContent));
    if (pointSpan) pointSpan.innerHTML = `<strong>Pointe :</strong> ${selectedPoint} gr + insert ${selectedInsert} gr · avant ${selectedPoint + selectedInsert} gr`;
  }

  function patchPanel() {
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel) return;
    const tube = currentTube();
    if (tube.brand !== 'victory') return;
    const title = document.getElementById('arrowBuilderDialogTitle')?.textContent || '';
    if (/Pointe/i.test(title)) {
      ensureInsertChooser(panel,tube);
      patchPointCards(panel,tube);
    } else if (/Equilibre|Équilibre/i.test(title)) {
      patchBalancePanel(panel,tube);
      patchSummary();
    }
  }

  function install() {
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel) { setTimeout(install,250); return; }
    if (!panelObserver) {
      panelObserver = new MutationObserver(() => queueMicrotask(patchPanel));
      panelObserver.observe(panel,{childList:true,subtree:true});
    }
    document.addEventListener('click',event => {
      if (event.target.closest('[data-arrow-part="point"],[data-arrow-part="balance"]')) setTimeout(patchPanel,0);
    });
    window.AssistantArcherVictoryFrontBalance = Object.freeze({version:VERSION,patchPanel,insertConfig});
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',install,{once:true}) : install();
})();
