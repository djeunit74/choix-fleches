/* Assistant Archer TEST - bibliothèque empennages Pré-alpha v25. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v25';
  const DATA_URL = './vane-catalog-v25.json?v=20260822-prealpha-v25';
  let catalog = null;
  let index = new Map();

  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function installStyles() {
    if (document.getElementById('vaneLibraryV25Styles')) return;
    const style = document.createElement('style');
    style.id = 'vaneLibraryV25Styles';
    style.textContent = `
      .vane-brand-group{display:grid;gap:.65rem;margin:.8rem 0 1rem;padding:.7rem;border:1px solid color-mix(in srgb,var(--accent-2) 18%,var(--line));border-radius:14px;background:color-mix(in srgb,var(--accent-2) 3%,white)}
      .vane-brand-head{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;padding:.15rem .15rem .2rem;border-bottom:1px solid color-mix(in srgb,var(--accent-2) 18%,var(--line))}
      .vane-brand-head h4{margin:0;color:var(--accent-2);font-size:1.02rem}
      .vane-brand-head p{margin:.18rem 0 0;font-size:.78rem;opacity:.78}
      .vane-brand-head>span{font-size:.72rem;font-weight:800;white-space:nowrap;padding:.24rem .45rem;border-radius:999px;background:color-mix(in srgb,var(--accent-2) 10%,white);color:var(--accent-2)}
      .vane-brand-group>.arrow-component-card{margin:0}
      .vane-product-media{display:grid;grid-template-columns:minmax(92px,150px) 1fr;align-items:center;gap:.65rem;margin:.45rem 0 .55rem;padding:.4rem;border:1px solid color-mix(in srgb,var(--line) 76%,transparent);border-radius:10px;background:#fff}
      .vane-product-media img{display:block;width:100%;max-height:92px;object-fit:contain;border-radius:7px;background:#fff}
      .vane-product-media figcaption{margin:0;font-size:.72rem;opacity:.66}
      .vane-context-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin:.35rem 0 .5rem}
      .vane-context-tags span{display:inline-flex;padding:.2rem .42rem;border-radius:999px;background:color-mix(in srgb,var(--accent-2) 8%,white);border:1px solid color-mix(in srgb,var(--accent-2) 18%,var(--line));font-size:.7rem;font-weight:750}
      @media(max-width:560px){.vane-brand-group{padding:.55rem}.vane-product-media{grid-template-columns:92px 1fr}.vane-product-media img{max-height:78px}}
    `;
    document.head.appendChild(style);
  }

  async function loadCatalog() {
    if (catalog) return catalog;
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    catalog = await response.json();
    index = new Map((catalog.vanes || []).map(v => [v.id, v]));
    return catalog;
  }

  function badgeRank(card) {
    const text = norm(card.querySelector('.arrow-builder-badge')?.textContent);
    if (text.includes('tres coherente')) return 3;
    if (text.includes('envisager')) return 2;
    return 1;
  }

  function manufacturerFromCard(card) {
    const text = card.querySelector('.arrow-component-brand')?.textContent || '';
    return text.split('·')[0].trim() || 'Autres';
  }

  function addImage(card, vane) {
    if (!vane?.imageUrl || card.querySelector('.vane-product-media')) return;
    const specs = card.querySelector('.arrow-component-specs');
    if (!specs) return;
    const figure = document.createElement('figure');
    figure.className = 'vane-product-media';
    figure.innerHTML = `<img src="${esc(vane.imageUrl)}" alt="${esc(vane.imageAlt || vane.model)}" loading="lazy" referrerpolicy="no-referrer" /><figcaption>Photo fabricant</figcaption>`;
    const img = figure.querySelector('img');
    img?.addEventListener('error', () => figure.remove(), { once: true });
    specs.before(figure);
  }

  function addContext(card, vane) {
    if (!vane || card.querySelector('.vane-context-tags')) return;
    const tags = Array.isArray(vane.contexts) ? vane.contexts : [];
    if (!tags.length) return;
    const line = document.createElement('div');
    line.className = 'vane-context-tags';
    line.innerHTML = tags.map(tag => `<span>${esc(tag)}</span>`).join('');
    const specs = card.querySelector('.arrow-component-specs');
    if (specs) specs.after(line);
  }

  function brandSummary(manufacturer, cards) {
    const best = Math.max(...cards.map(badgeRank));
    const label = best >= 3 ? 'Très cohérente avec la discipline actuelle' : best === 2 ? 'À envisager pour cette configuration' : 'Usage plus spécifique';
    return `<div><h4>${esc(manufacturer)}</h4><p>${label}</p></div><span>${cards.length} modèle${cards.length > 1 ? 's' : ''}</span>`;
  }

  function organizeVanes(root) {
    const list = root.querySelector('.arrow-component-list');
    if (!list || list.dataset.vaneLibraryV25 === '1') return;
    const cards = [...list.querySelectorAll(':scope > .arrow-component-card')].filter(card => card.querySelector('[data-vane]'));
    if (!cards.length) return;

    cards.forEach(card => {
      const id = card.querySelector('[data-vane]')?.dataset.vane || '';
      const vane = index.get(id);
      addImage(card, vane);
      addContext(card, vane);
      card.dataset.vaneBrand = vane?.manufacturer || manufacturerFromCard(card);
    });

    const groups = new Map();
    cards.forEach(card => {
      const brand = card.dataset.vaneBrand || 'Autres';
      if (!groups.has(brand)) groups.set(brand, []);
      groups.get(brand).push(card);
    });

    const ordered = [...groups.entries()].sort((a, b) => {
      const ar = Math.max(...a[1].map(badgeRank));
      const br = Math.max(...b[1].map(badgeRank));
      return br - ar || a[0].localeCompare(b[0], 'fr');
    });

    const frag = document.createDocumentFragment();
    ordered.forEach(([brand, brandCards]) => {
      const section = document.createElement('section');
      section.className = 'vane-brand-group';
      const head = document.createElement('div');
      head.className = 'vane-brand-head';
      head.innerHTML = brandSummary(brand, brandCards);
      section.appendChild(head);
      brandCards.forEach(card => section.appendChild(card));
      frag.appendChild(section);
    });

    list.replaceChildren(frag);
    list.dataset.vaneLibraryV25 = '1';
  }

  function refresh() {
    document.querySelectorAll('.arrow-builder-dialog, .arrow-builder-panel, [data-arrow-builder]').forEach(organizeVanes);
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }

  async function install() {
    try {
      installStyles();
      await loadCatalog();
      refresh();
      let queued = false;
      const observer = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; refresh(); });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.AssistantArcherVaneLibrary = Object.freeze({ version: VERSION, data: catalog });
    } catch (error) {
      console.warn('[Assistant Archer] bibliothèque empennages v25 indisponible', error);
    }
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, { once: true }) : install();
})();
