/* Assistant Archer TEST - zone FOC recommandee sur le graphique d'equilibre, Pre-alpha v29. */
(() => {
  'use strict';
  const VERSION = 'Pre-alpha v29';

  function installStyles() {
    if (document.getElementById('focZoneV29Styles')) return;
    const style = document.createElement('style');
    style.id = 'focZoneV29Styles';
    style.textContent = `
      .arrow-balance-visual{height:72px!important;margin:.9rem 0 1.15rem!important}
      .arrow-foc-zone{position:absolute;top:16px;height:18px;border-radius:7px;background:color-mix(in srgb,var(--accent-2) 22%,transparent);border:1px solid color-mix(in srgb,var(--accent-2) 48%,transparent);z-index:1;pointer-events:none}
      .arrow-foc-target{position:absolute;top:10px;width:2px;height:31px;background:var(--accent-2);z-index:2;pointer-events:none}
      .arrow-foc-target::before{content:'FOC cible';position:absolute;left:50%;top:-13px;transform:translateX(-50%);white-space:nowrap;font-size:.6rem;font-weight:850;color:var(--accent-2)}
      .arrow-foc-zone-label{position:absolute;top:47px;transform:translateX(-50%);white-space:nowrap;font-size:.62rem;font-weight:800;color:var(--accent-2);z-index:4}
      .arrow-foc-reading{margin:-.25rem 0 .7rem;text-align:center;font-size:.78rem;font-weight:800;color:var(--ink)}
      .arrow-foc-reading.is-ok{color:var(--accent-2)}
      .arrow-foc-reading.is-out{color:var(--accent)}
      .arrow-balance-track{z-index:0}
      .arrow-balance-center{z-index:2}
      .arrow-balance-cg{z-index:3}
      @media(max-width:560px){.arrow-foc-zone-label{font-size:.58rem}.arrow-foc-target::before{font-size:.56rem}.arrow-foc-reading{font-size:.72rem}}
    `;
    document.head.appendChild(style);
  }

  function numberFrom(text) {
    const m = String(text || '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : null;
  }

  function decorateVisual(visual) {
    if (!visual || visual.dataset.focZoneV29 === '1') return;
    const panel = visual.closest('#arrowBuilderPanel, .arrow-builder-dialog-body, .arrow-builder-panel') || visual.parentElement;
    const summary = panel?.querySelector('.arrow-balance-summary');
    if (!summary) return;
    const blocks = [...summary.children];
    const foc = numberFrom(blocks.find(el => /foc estime/i.test(el.textContent))?.querySelector('strong')?.textContent);
    const zoneText = blocks.find(el => /zone de depart/i.test(el.textContent))?.querySelector('strong')?.textContent || '';
    const nums = String(zoneText).replace(/,/g, '.').match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
    const minFoc = Number.isFinite(nums[0]) ? nums[0] : 10;
    const maxFoc = Number.isFinite(nums[1]) ? nums[1] : 15;
    const target = 12;

    const zoneLeft = Math.max(3, Math.min(97, 50 + minFoc));
    const zoneRight = Math.max(zoneLeft, Math.min(97, 50 + maxFoc));
    const targetLeft = Math.max(3, Math.min(97, 50 + target));

    const zone = document.createElement('span');
    zone.className = 'arrow-foc-zone';
    zone.style.left = `${zoneLeft}%`;
    zone.style.width = `${zoneRight - zoneLeft}%`;
    zone.title = `Zone FOC recommandee ${minFoc}-${maxFoc} %`;

    const targetLine = document.createElement('span');
    targetLine.className = 'arrow-foc-target';
    targetLine.style.left = `${targetLeft}%`;
    targetLine.title = `FOC cible ${target} %`;

    const label = document.createElement('span');
    label.className = 'arrow-foc-zone-label';
    label.style.left = `${(zoneLeft + zoneRight) / 2}%`;
    label.textContent = `zone FOC ${minFoc}-${maxFoc} %`;

    visual.append(zone, targetLine, label);
    visual.dataset.focZoneV29 = '1';

    if (Number.isFinite(foc) && !visual.nextElementSibling?.classList?.contains('arrow-foc-reading')) {
      const ok = foc >= minFoc && foc <= maxFoc;
      const reading = document.createElement('p');
      reading.className = `arrow-foc-reading ${ok ? 'is-ok' : 'is-out'}`;
      reading.textContent = `FOC ${foc.toFixed(1)} % · ${ok ? 'dans la zone recommandee' : foc < minFoc ? 'sous la zone recommandee' : 'au-dessus de la zone recommandee'}`;
      visual.insertAdjacentElement('afterend', reading);
    }
  }

  function refresh() {
    document.querySelectorAll('#arrowBuilderPanel .arrow-balance-visual').forEach(decorateVisual);
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }

  function install() {
    installStyles();
    refresh();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; refresh(); });
    }).observe(document.body, { childList: true, subtree: true });
    window.AssistantArcherFocZone = Object.freeze({ version: VERSION, refresh });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, { once: true }) : install();
})();
