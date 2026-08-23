/* Assistant Archer TEST - groupes fabricant Easton, Pré-alpha v34.
   Principe: paramètres -> groupe Easton -> taille(s) propres au modèle.
   Les correspondances X10/A-C-E proviennent des pages officielles Group Txx.
   Les autres modèles Easton restent gérés par le moteur historique tant que leur
   correspondance de groupe actuelle n'est pas assez documentée. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v34';

  const RANGE_TO_GROUP = Object.freeze({
    '2000':'00','2000-1800':'00','1800-1700':'00','1750-1400':'01',
    '1450-1200':'02','1250-1050':'03','1080-880':'T01','900-750':'T2',
    '800-700':'T3','720-625':'T4','675-600':'T5','640-570':'T6',
    '575-500':'T7','525-450':'T8','475-400':'T9','440-370':'T10',
    '400-340':'T11','370-310':'T12','340-300':'T13','300-250':'T14','250-200':'T14'
  });

  const MODEL_GROUPS = Object.freeze({
    x10: Object.freeze({
      T01:[900,1000], T2:[750,830], T3:[700,750], T4:[650,700],
      T5:[600,650], T6:[550,600], T7:[500,550], T8:[450,500],
      T9:[410,450], T10:[380,410], T11:[380], T12:[350], T13:[325]
    }),
    ace: Object.freeze({
      '03':[1100], T01:[920,1000], T2:[780,850], T3:[720,780], T4:[670,720],
      T5:[620,670], T6:[570,620], T7:[520,570], T8:[470,520],
      T9:[430,470], T10:[400,430], T11:[370,400], T12:[370]
    })
  });

  const norm = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

  function modelKey(name) {
    const n = norm(name);
    if (/^x10(?:\s|$)/.test(n) && !/parallel pro/.test(n)) return 'x10';
    if (n === 'a c e' || n === 'ace' || /^a c e\s/.test(n)) return 'ace';
    return '';
  }

  function spineOf(entry) {
    const direct = Number(entry?.advisedSpine ?? entry?.spine ?? entry?.manufacturerSpec?.spine);
    if (Number.isFinite(direct)) return direct;
    const matches = String(entry?.model || '').match(/(?:^|\s)(\d{3,4})(?=\s|$)/g);
    return matches?.length ? Number(matches[matches.length - 1].trim()) : null;
  }

  function currentRange() {
    return window.AssistantArcherEastonMode?.manufacturerRange?.() || null;
  }

  function currentGroup() {
    const range = currentRange();
    return range?.label ? (RANGE_TO_GROUP[range.label] || null) : null;
  }

  function exactSizes(name, group = currentGroup()) {
    const key = modelKey(name);
    return key && group ? (MODEL_GROUPS[key]?.[group] || null) : null;
  }

  function rankExact(rec) {
    if (!rec || rec.brand !== 'easton' || !Array.isArray(rec.models)) return rec;
    const group = currentGroup();
    if (!group) return rec;

    const decorated = rec.models.map((entry,index) => {
      const key = modelKey(entry.model);
      const sizes = key ? MODEL_GROUPS[key]?.[group] : null;
      const spine = spineOf(entry);
      const exact = Boolean(sizes && Number.isFinite(spine) && sizes.includes(spine));
      const familyKnown = Boolean(sizes);
      return {entry,index,key,sizes,spine,exact,familyKnown};
    });

    decorated.sort((a,b) => Number(b.exact)-Number(a.exact)
      || Number(b.familyKnown)-Number(a.familyKnown)
      || a.index-b.index);
    rec.models = decorated.map(x => x.entry);

    const exactCount = decorated.filter(x => x.exact).length;
    const x10 = MODEL_GROUPS.x10[group];
    const ace = MODEL_GROUPS.ace[group];
    rec.confidenceReasons = [...(rec.confidenceReasons || []),
      `Easton ${VERSION} : groupe fabricant ${group}. Correspondances exactes prioritaires${x10 ? ` · X10 ${x10.join('/')}` : ''}${ace ? ` · A/C/E ${ace.join('/')}` : ''}. ${exactCount} candidat(s) affiché(s) correspondent exactement au groupe ; les autres familles Easton ne sont pas supprimées tant que leur table groupe actuelle n'est pas documentée.`
    ];
    return rec;
  }

  function wrapRecommendation() {
    if (window.buildBrandRecommendation?.__eastonGroupsV34) return true;
    if (typeof window.buildBrandRecommendation !== 'function') return false;
    const original = window.buildBrandRecommendation;
    const wrapped = function(input,brand) {
      return rankExact(original.apply(this,arguments));
    };
    wrapped.__eastonGroupsV34 = true;
    window.buildBrandRecommendation = wrapped;
    return true;
  }

  function decorateHint() {
    const hint = document.getElementById('eastonRangeHint');
    if (!hint || document.getElementById('preferredBrand')?.value !== 'easton') return;
    const range = currentRange(), group = currentGroup();
    if (!range || !group) return;
    const x10 = MODEL_GROUPS.x10[group];
    const ace = MODEL_GROUPS.ace[group];
    hint.textContent = `Référence Easton : ${range.label} → groupe ${group}${x10 ? ` · X10 ${x10.join(' / ')}` : ''}${ace ? ` · A/C/E ${ace.join(' / ')}` : ''}. Les tailles sont propres au modèle, pas une plage générique.`;
  }

  function refresh() {
    wrapRecommendation();
    decorateHint();
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }

  function install() {
    refresh();
    let tries=0;
    const timer=setInterval(()=>{tries++;refresh();if(window.buildBrandRecommendation?.__eastonGroupsV34||tries>80)clearInterval(timer);},100);
    new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.body,{childList:true,subtree:true});
    window.AssistantArcherEastonGroups = Object.freeze({version:VERSION,currentGroup,exactSizes,modelGroups:MODEL_GROUPS});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
