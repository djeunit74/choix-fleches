/* Assistant Archer TEST - Victory point + insert + rear assembly + FOC, Pré-alpha v53.
   S'applique uniquement au constructeur quand le tube choisi est Victory.
   La table de spine reste centralisée dans AssistantArcherVictorySelector.
   Le FOC distingue masse avant et masse arrière réellement sélectionnées.
   Les pointes Victory sont filtrées par compatibilité de spine avant le classement FOC.
   Aucun observer global ni boucle permanente : mise à jour sur événements utiles seulement.
*/
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v53';
  let selectedInsert = 0;
  let selectedPoint = null;
  let selectedRearWeight = null;

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
    if (key === 'vft') return { values:[0,11,22,33], note:'Inserts avant VForce 11/22 gr ou VForce SS 33 gr.' };
    if (key === 'v-tac 23' || key === 'v-tac 25') return { values:[0,44], note:'Insert avant Victory 44 gr disponible.' };
    if (key === 'vap' || key === 'vxt') return { values:[0], note:'Pas d’insert avant ajouté dans le montage cible documenté : les pin bushings sont des composants arrière.' };
    return { values:[0], note:'Aucun insert avant documenté pour ce montage dans la base active.' };
  }

  function rearConfig(key) {
    if (key === 'vap') return {
      baseWeight:8,
      options:[
        { weight:8, label:'IP Nock .166 — 8 gr (livré d’origine)' },
        { weight:15, label:'Pin Bushing 12 gr + Pin Nock 3 gr — 15 gr (option)' }
      ],
      note:'Victory VAP : les deux montages arrière sont publiés par le fabricant.'
    };
    if (key === 'vxt') return {
      baseWeight:15,
      options:[{ weight:15, label:'Gold Pin Bushing 12 gr + Pin Nock 3 gr — 15 gr (livrés d’origine)' }],
      note:'Victory VXT : montage arrière livré d’origine.'
    };
    return { baseWeight:0, options:[], note:'' };
  }

  function selectorFor(front) {
    return window.AssistantArcherVictorySelector?.selectorResultForFront?.(front) || null;
  }

  function parseOriginalLine(text) {
    const point = Number(text.match(/(\d+(?:\.\d+)?)\s*gr/i)?.[1]);
    const foc = Number(text.match(/FOC\s*estim[eé]\s*(\d+(?:[.,]\d+)?)\s*%/i)?.[1]?.replace(',','.'));
    const mass = Number(text.match(/masse\s*estim[eé]e?\s*(\d+(?:[.,]\d+)?)\s*gr/i)?.[1]?.replace(',','.'));
    return { point, foc, mass };
  }

  function parseCard(card) {
    const line = card.querySelector('.arrow-balance-numbers');
    const source = line?.dataset?.victoryOriginal || line?.textContent || '';
    return parseOriginalLine(source);
  }

  function correctionContext(tube) {
    const rear = rearConfig(family(tube.model));
    if (selectedRearWeight === null || !rear.options.some(option => option.weight === selectedRearWeight)) {
      selectedRearWeight = rear.options[0]?.weight ?? rear.baseWeight;
    }
    return { rear, rearDelta:Number(selectedRearWeight || 0) - Number(rear.baseWeight || 0) };
  }

  function correctedEstimate(oldFoc, oldMass, insert, rearDelta) {
    const length = Number(document.getElementById('arrowLength')?.value);
    if (![oldFoc,oldMass,insert,rearDelta,length].every(Number.isFinite) || length <= 0) return null;
    const oldBalance = length / 2 + (oldFoc / 100) * length;
    const oldMoment = oldBalance * oldMass;
    const newMass = oldMass + insert + rearDelta;
    if (!(newMass > 0)) return null;
    const newMoment = oldMoment + insert * length;
    const newBalance = newMoment / newMass;
    const foc = ((newBalance - length / 2) / length) * 100;
    return { foc, mass:newMass };
  }

  function ensureAssemblyChooser(panel,tube) {
    if (!panel || tube.brand !== 'victory') return;
    const key = family(tube.model);
    const front = insertConfig(key);
    const rear = rearConfig(key);
    if (!front.values.includes(selectedInsert)) selectedInsert = front.values[0];
    if (selectedRearWeight === null || !rear.options.some(option => option.weight === selectedRearWeight)) selectedRearWeight = rear.options[0]?.weight ?? rear.baseWeight;

    let box = panel.querySelector('#victoryBuilderFrontV49');
    if (!box) {
      box = document.createElement('div');
      box.id = 'victoryBuilderFrontV49';
      box.className = 'arrow-builder-callout victory-front-control';
      const head = panel.querySelector('.arrow-builder-panel-head') || panel.firstElementChild;
      head?.insertAdjacentElement('afterend',box) || panel.prepend(box);
    }
    const signature = `${key}|${selectedInsert}|${selectedRearWeight}`;
    if (box.dataset.signature === signature) return;
    box.dataset.signature = signature;
    const rearSelect = rear.options.length
      ? `<label style="display:block;margin:.4rem 0 0">Montage arrière
          <select id="victoryBuilderRearV52" style="margin-left:.35rem">
            ${rear.options.map(option => `<option value="${option.weight}"${option.weight===selectedRearWeight?' selected':''}>${option.label}</option>`).join('')}
          </select>
        </label>`
      : '';
    box.innerHTML = `<strong>Montage Victory</strong>
      <label style="display:block;margin:.4rem 0 0">Insert avant
        <select id="victoryBuilderInsertV49" style="margin-left:.35rem">
          ${front.values.map(v => `<option value="${v}"${v===selectedInsert?' selected':''}>${v} gr</option>`).join('')}
        </select>
      </label>
      ${rearSelect}
      <small style="display:block;margin-top:.3rem">${front.note}${rear.note ? ` ${rear.note}` : ''} Le spine dépend du poids avant ; le FOC dépend aussi du montage arrière.</small>`;

    box.querySelector('#victoryBuilderInsertV49')?.addEventListener('change',event => {
      selectedInsert = Number(event.target.value) || 0;
      box.dataset.signature = '';
      const mainInsert = document.getElementById('victoryInsertWeightV48');
      if (mainInsert && [...mainInsert.options].some(o => Number(o.value) === selectedInsert)) mainInsert.value = String(selectedInsert);
      patchPanel();
    });
    box.querySelector('#victoryBuilderRearV52')?.addEventListener('change',event => {
      selectedRearWeight = Number(event.target.value);
      box.dataset.signature = '';
      patchPanel();
      patchSummary();
    });
  }

  function pointCompatibility(pointWeight,tube) {
    const front = Number(pointWeight) + selectedInsert;
    const result = selectorFor(front);
    const compatible = Boolean(result && Number.isFinite(tube.spine) && Number(result.spine) === Number(tube.spine));
    return { front, result, compatible };
  }

  function patchAdvancedPointChoices(panel,tube) {
    panel.querySelectorAll('[data-point-raw]').forEach(button => {
      const raw = String(button.dataset.pointRaw || '').split('|');
      const pointWeight = Number(raw[raw.length - 1]);
      if (!Number.isFinite(pointWeight)) return;
      const { front, result, compatible } = pointCompatibility(pointWeight,tube);
      button.disabled = !compatible;
      button.setAttribute('aria-disabled',String(!compatible));
      if (!compatible) button.title = result ? `Victory recommande spine ${result.spine} avec ${front} gr devant` : 'Poids avant hors tableau Victory publié';
      else button.removeAttribute('title');
      if (compatible && !button.dataset.victoryFrontBoundV53) {
        button.dataset.victoryFrontBoundV53='1';
        button.addEventListener('click',() => {
          selectedPoint = pointWeight;
          const mainPoint = document.getElementById('victoryPointWeightV48');
          if (mainPoint && [...mainPoint.options].some(o => Number(o.value) === pointWeight)) mainPoint.value = String(pointWeight);
        },{capture:true});
      }
    });
  }

  function patchPointCards(panel,tube) {
    const { rearDelta } = correctionContext(tube);
    const cards = [...panel.querySelectorAll('.arrow-point-recommendation')];
    const ranked = [];

    cards.forEach((card,index) => {
      const parsed = parseCard(card);
      if (!Number.isFinite(parsed.point)) return;
      const { front, result, compatible } = pointCompatibility(parsed.point,tube);
      const button = card.querySelector('[data-point-config]');
      const badge = card.querySelector('.arrow-builder-badge');
      let status = card.querySelector('.victory-front-status-v49');
      if (!status) {
        status = document.createElement('p');
        status.className = 'victory-front-status-v49 muted';
        (card.querySelector('.arrow-balance-numbers') || card.querySelector('h4'))?.insertAdjacentElement('afterend',status);
      }
      if (!result) status.innerHTML = `<strong>Avant total : ${front} gr.</strong> Hors des bandes Victory publiées (100–125 / 150–175 gr) : aucun spine extrapolé.`;
      else if (compatible) status.innerHTML = `<strong>Avant total : ${parsed.point} + ${selectedInsert} = ${front} gr.</strong> Victory recalcule spine <strong>${result.spine}</strong> : cohérent avec le tube choisi.`;
      else status.innerHTML = `<strong>Avant total : ${front} gr.</strong> Victory recalcule spine <strong>${result.spine}</strong>, alors que le tube choisi est ${tube.spine || 'non précisé'} : combinaison non validable.`;

      if (button) {
        button.disabled = !compatible;
        button.setAttribute('aria-disabled',String(!compatible));
        if (!compatible) button.title = result ? `Victory recommande spine ${result.spine} avec ${front} gr devant` : 'Poids avant hors tableau Victory publié';
        else button.removeAttribute('title');
      }

      const line = card.querySelector('.arrow-balance-numbers');
      const corrected = correctedEstimate(parsed.foc,parsed.mass,selectedInsert,rearDelta);
      if (line && !line.dataset.victoryOriginal) line.dataset.victoryOriginal = line.textContent;
      if (line && corrected) {
        const rearText = selectedRearWeight ? ` · arrière ${selectedRearWeight} gr` : '';
        line.innerHTML = `<strong>${parsed.point} gr</strong> + insert ${selectedInsert} gr · avant <strong>${front} gr</strong>${rearText} · FOC estimé <strong>${corrected.foc.toFixed(1)} %</strong> · masse estimée <strong>${Math.round(corrected.mass)} gr</strong>`;
      }

      if (button && compatible && !button.dataset.victoryFrontBoundV53) {
        button.dataset.victoryFrontBoundV53='1';
        button.addEventListener('click',() => {
          selectedPoint = parsed.point;
          const mainPoint = document.getElementById('victoryPointWeightV48');
          if (mainPoint && [...mainPoint.options].some(o => Number(o.value) === parsed.point)) mainPoint.value = String(parsed.point);
          setTimeout(() => { patchPanel(); patchSummary(); },0);
        },{capture:true});
      }

      ranked.push({card,index,parsed,compatible});
      card.dataset.victoryCompatible = compatible ? '1' : '0';
      card.classList.toggle('victory-incompatible-v53',!compatible);
      if (!compatible && badge) badge.textContent = 'Hors table Victory';
    });

    const parent = cards[0]?.parentElement;
    if (parent) {
      ranked.sort((a,b) => Number(b.compatible)-Number(a.compatible) || a.index-b.index).forEach(entry => parent.appendChild(entry.card));
    }

    const compatibleCards = ranked.filter(entry => entry.compatible).sort((a,b)=>a.index-b.index);
    compatibleCards.forEach((entry,position) => {
      const button = entry.card.querySelector('[data-point-config]');
      const badge = entry.card.querySelector('.arrow-builder-badge');
      entry.card.classList.toggle('is-recommended',position === 0);
      if (badge) badge.textContent = position === 0 ? 'Présélection Victory' : 'Compatible Victory';
      if (button) {
        button.classList.toggle('arrow-select-recommended',position === 0);
        if (!/Configuration selectionnee/i.test(button.textContent || '')) button.textContent = position === 0 ? 'Choisir cette présélection' : 'Choisir cette configuration';
      }
    });

    const invalidCards = ranked.filter(entry => !entry.compatible);
    invalidCards.forEach(entry => {
      const button = entry.card.querySelector('[data-point-config]');
      entry.card.classList.remove('is-recommended');
      button?.classList.remove('arrow-select-recommended');
    });

    let notice = panel.querySelector('.victory-point-priority-v53');
    if (!notice) {
      notice = document.createElement('p');
      notice.className = 'arrow-builder-callout victory-point-priority-v53';
      const list = panel.querySelector('.arrow-point-recommendations');
      list?.insertAdjacentElement('beforebegin',notice);
    }
    if (notice) {
      notice.innerHTML = compatibleCards.length
        ? `<strong>Victory :</strong> ${compatibleCards.length} combinaison(s) conservent le spine ${tube.spine}. Elles sont classées avant l'optimisation du FOC.`
        : `<strong>Victory :</strong> aucune masse avant affichée ne conserve le spine ${tube.spine}. Aucune pointe n'est validable sans revoir la configuration.`;
    }

    patchAdvancedPointChoices(panel,tube);
  }

  function patchBalancePanel(panel,tube) {
    if (!selectedPoint || tube.brand !== 'victory') return;
    const summary = panel.querySelector('.arrow-balance-summary');
    if (!summary || summary.dataset.victoryFrontV53) return;
    const strongs = [...summary.querySelectorAll('strong')];
    const massEl = strongs.find(el => /gr/i.test(el.textContent));
    const focEl = strongs.find(el => /%/.test(el.textContent));
    const oldMass = Number(massEl?.textContent.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'));
    const oldFoc = Number(focEl?.textContent.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'));
    const { rearDelta } = correctionContext(tube);
    const corrected = correctedEstimate(oldFoc,oldMass,selectedInsert,rearDelta);
    if (!corrected) return;
    if (massEl) massEl.textContent = `${Math.round(corrected.mass)} gr`;
    if (focEl) focEl.textContent = `${corrected.foc.toFixed(1)} %`;
    summary.dataset.victoryFrontV53='1';
    const note = document.createElement('p');
    note.className='muted victory-front-balance-note-v49';
    note.textContent=`Victory : pointe ${selectedPoint} gr + insert avant ${selectedInsert} gr = ${selectedPoint + selectedInsert} gr devant ; montage arrière ${selectedRearWeight ?? 'non précisé'} gr. Le FOC affiché intègre ces masses aux bonnes extrémités.`;
    summary.insertAdjacentElement('afterend',note);
  }

  function patchSummary() {
    if (!selectedPoint) return;
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary || document.getElementById('preferredBrand')?.value !== 'victory') return;
    const pointSpan = [...summary.querySelectorAll('span')].find(s => /Pointe\s*:/i.test(s.textContent));
    if (pointSpan) pointSpan.innerHTML = `<strong>Pointe :</strong> ${selectedPoint} gr + insert ${selectedInsert} gr · avant ${selectedPoint + selectedInsert} gr${selectedRearWeight ? ` · arrière ${selectedRearWeight} gr` : ''}`;
  }

  function patchPanel() {
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel) return;
    const tube = currentTube();
    if (tube.brand !== 'victory') return;
    const title = document.getElementById('arrowBuilderDialogTitle')?.textContent || '';
    if (/Pointe/i.test(title)) { ensureAssemblyChooser(panel,tube); patchPointCards(panel,tube); }
    else if (/Equilibre|Équilibre/i.test(title)) { patchBalancePanel(panel,tube); patchSummary(); }
  }

  function install() {
    document.addEventListener('click',event => {
      if (event.target.closest('[data-arrow-part="point"],[data-arrow-part="balance"],[data-vane]')) setTimeout(patchPanel,0);
    });
    window.AssistantArcherVictoryFrontBalance = Object.freeze({version:VERSION,patchPanel,insertConfig,rearConfig});
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',install,{once:true}) : install();
})();
