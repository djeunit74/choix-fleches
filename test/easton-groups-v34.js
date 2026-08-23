/* Assistant Archer TEST - groupes fabricant Easton, Pré-alpha v34.
   Principe: paramètres -> groupe Easton -> taille RECURVE propre au modèle.
   Dans les tableaux Easton, la taille marquée R est la recommandation recurve.
   Exemple T4: X10 *650•700R => X10 700 en recurve ; A/C/E *670•720R => A/C/E 720.
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

  /* Valeurs RECURVE uniquement: deuxième valeur lorsqu'Easton publie *A•BR. */
  const MODEL_GROUPS = Object.freeze({
    x10: Object.freeze({
      T01:1000, T2:830, T3:750, T4:700, T5:650, T6:600, T7:550,
      T8:500, T9:450, T10:410, T11:380, T12:350, T13:325
    }),
    ace: Object.freeze({
      '03':1100, T01:1000, T2:850, T3:780, T4:720, T5:670, T6:620,
      T7:570, T8:520, T9:470, T10:430, T11:400, T12:370
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

  function currentRange() {
    return window.AssistantArcherEastonMode?.manufacturerRange?.() || null;
  }

  function currentGroup() {
    const range = currentRange();
    return range?.label ? (RANGE_TO_GROUP[range.label] || null) : null;
  }

  function exactSpine(name, group = currentGroup()) {
    const key = modelKey(name);
    return key && group ? (MODEL_GROUPS[key]?.[group] ?? null) : null;
  }

  function applyExactGroupSpines(rec) {
    if (!rec || rec.brand !== 'easton' || !Array.isArray(rec.models)) return rec;
    const group = currentGroup();
    if (!group) return rec;

    let exactCount = 0;
    rec.models = rec.models.map(entry => {
      const exact = exactSpine(entry.model, group);
      if (!Number.isFinite(exact)) return entry;
      exactCount++;
      return {
        ...entry,
        advisedSpine: exact,
        eastonGroup: group,
        eastonGroupVerified: true,
        eastonGroupSource: `https://eastonarchery.com/group-${String(group).toLowerCase()}/`
      };
    });

    /* Les familles dont la table groupe est vérifiée passent devant, sans supprimer
       les autres références Easton encore gérées par le moteur historique. */
    rec.models = rec.models
      .map((entry,index)=>({entry,index,verified:entry.eastonGroupVerified===true}))
      .sort((a,b)=>Number(b.verified)-Number(a.verified)||a.index-b.index)
      .map(({entry})=>entry);

    const x10 = MODEL_GROUPS.x10[group];
    const ace = MODEL_GROUPS.ace[group];
    rec.confidenceReasons = [...(rec.confidenceReasons || []),
      `Easton ${VERSION} : groupe fabricant ${group}. Taille recurve exacte${Number.isFinite(x10) ? ` · X10 ${x10}` : ''}${Number.isFinite(ace) ? ` · A/C/E ${ace}` : ''}. ${exactCount} famille(s) affichée(s) utilisent directement la taille marquée R par Easton ; les autres modèles ne sont pas extrapolés.`
    ];
    return rec;
  }

  function wrapRecommendation() {
    if (window.buildBrandRecommendation?.__eastonGroupsV34) return true;
    if (typeof window.buildBrandRecommendation !== 'function') return false;
    const original = window.buildBrandRecommendation;
    const wrapped = function(input,brand) {
      return applyExactGroupSpines(original.apply(this,arguments));
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
    hint.textContent = `Référence Easton : ${range.label} → groupe ${group}${Number.isFinite(x10) ? ` · X10 recurve ${x10}` : ''}${Number.isFinite(ace) ? ` · A/C/E recurve ${ace}` : ''}. La taille marquée R du tableau fabricant est utilisée directement.`;
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
    window.AssistantArcherEastonGroups = Object.freeze({version:VERSION,currentGroup,exactSpine,modelGroups:MODEL_GROUPS});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
