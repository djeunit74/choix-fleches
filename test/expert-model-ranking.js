/* Assistant Archer TEST - classement expert des modeles, Pré-alpha v14.
   Les faits fabricant restent dans manufacturer-reference*.json.
   Ce module ne modifie ni le tableau de spine ni les caractéristiques : il classe seulement
   les modèles déjà techniquement compatibles et explique l'interprétation de l'app. */
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v14';
  let patched = false;
  let observer = null;

  const norm = value => String(value || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

  const ALIASES = [
    ['x10 parallel pro 3 2 mm','x10 parallel pro 3.2 mm'],
    ['3 2mm x10 parallel pro','x10 parallel pro 3.2 mm'],
    ['x10 parallel pro 4 mm','x10 parallel pro 4 mm'],
    ['4mm x10 parallel pro','x10 parallel pro 4 mm'],
    ['xx75 platinum plus','xx75 platinum plus'],['platinum plus','xx75 platinum plus'],
    ['superdrive micro','superdrive micro'],['avance','avance'],['vector','vector'],
    ['a c e','a/c/e'],['ace','a/c/e'],['x23','x23'],['rx7','rx7'],['x7','x7'],['x10','x10'],
    ['preminens','preminens'],['premiens','preminens'],['precium','precium'],['paragon','paragon'],['performa','performa'],
    ['brixxon','brixxon'],['radius','radius'],['edge','edge'],['bruxx','bruxx'],['empros','empros'],
    ['vxt','vxt'],['vap','vap']
  ].sort((a,b)=>b[0].length-a[0].length);

  function modelKey(name) {
    const text = norm(name);
    for (const [alias,key] of ALIASES) if (text.includes(alias)) return key;
    return '';
  }

  function objective() {
    return document.getElementById('expertObjective')?.value || 'performance';
  }

  function installObjectiveInput() {
    const form = document.getElementById('spine-form');
    if (!form || document.getElementById('expertObjective')) return;
    const discipline = document.getElementById('disciplineWrap');
    const label = document.createElement('label');
    label.id = 'expertObjectiveWrap';
    label.innerHTML = `Objectif de pratique
      <select id="expertObjective">
        <option value="progression">Progression / club</option>
        <option value="performance" selected>Performance</option>
        <option value="competition">Compétition</option>
        <option value="elite">Compétition haut niveau</option>
      </select>
      <small class="field-hint">Ce choix ne change pas le spine fabricant. Il sert uniquement à départager plusieurs modèles techniquement compatibles.</small>`;
    if (discipline?.nextSibling) form.insertBefore(label, discipline.nextSibling);
    else form.appendChild(label);
  }

  function context(input) {
    return {
      objective: objective(),
      discipline: input?.discipline || document.getElementById('discipline')?.value || 'target',
      environment: input?.shootingEnvironment || 'outdoor',
      bowType: input?.bowType || 'recurve'
    };
  }

  function objectiveWeight(ctx, tiers) {
    return Number(tiers?.[ctx.objective] || 0);
  }

  function eastonRule(key, ctx) {
    const indoor = ctx.environment === 'indoor';
    const field = ctx.discipline === 'field';
    const rules = {
      'x10 parallel pro 3.2 mm': { tiers:{progression:-6,performance:7,competition:13,elite:18}, outdoor:9, field:5, indoor:-8, why:'Micro-diamètre 3,2 mm aluminium/carbone, conçu par Easton pour la compétition extérieure de très haut niveau, faible dérive et réglage parallèle.' },
      'x10': { tiers:{progression:-5,performance:8,competition:14,elite:18}, outdoor:8, field:2, indoor:-8, why:'X10 barrelled aluminium/carbone : référence compétition extérieure, très haute précision, mais mise au point plus exigeante qu’un tube parallèle.' },
      'x10 parallel pro 4 mm': { tiers:{progression:-2,performance:9,competition:13,elite:14}, outdoor:7, field:8, indoor:-5, why:'Parallel Pro 4 mm : niveau X10, profil parallèle plus simple à régler et usage fabricant cible/campagne/barebow.' },
      'a/c/e': { tiers:{progression:-1,performance:9,competition:10,elite:7}, outdoor:7, field:4, indoor:-6, why:'A/C/E aluminium/carbone léger et précis : excellent choix performance extérieure quand le X10 n’est pas nécessaire.' },
      'avance': { tiers:{progression:8,performance:8,competition:4,elite:0}, outdoor:5, field:2, indoor:-5, why:'Avance : tube carbone cible orienté progression vers la performance, plus rationnel qu’un tube élite pour un archer encore en développement.' },
      'superdrive micro': { tiers:{progression:4,performance:8,competition:8,elite:5}, outdoor:5, field:10, indoor:-4, why:'SuperDrive Micro : petit diamètre et positionnement tournoi/campagne/3D ; pertinent quand la polyvalence parcours prime.' },
      'vector': { tiers:{progression:10,performance:2,competition:-2,elite:-5}, outdoor:2, field:0, indoor:-2, why:'Vector : gamme club/progression ; priorité à la simplicité et au coût d’usage plutôt qu’au dernier niveau de performance.' },
      'rx7': { tiers:{progression:2,performance:9,competition:14,elite:13}, outdoor:-12, field:-8, indoor:18, why:'RX7 : tube aluminium à arrière conique spécifiquement conçu par Easton pour le recurve en salle et le dégagement.' },
      'x7': { tiers:{progression:3,performance:9,competition:12,elite:9}, outdoor:-10, field:-7, indoor:14, why:'X7 Eclipse : aluminium cible de précision, rectitude ±.001", particulièrement cohérent pour la salle.' },
      'x23': { tiers:{progression:-2,performance:7,competition:12,elite:10}, outdoor:-12, field:-8, indoor:13, why:'X23 : grand diamètre de compétition salle ; avantage de coupe de ligne mais masse et diamètre élevés.' },
      'xx75 platinum plus': { tiers:{progression:8,performance:7,competition:4,elite:1}, outdoor:-8, field:-5, indoor:10, why:'XX75 Platinum Plus : aluminium salle/intermédiaire, robuste et cohérent pour progression et performance club.' }
    };
    const r = rules[key];
    if (!r) return {score:0, why:''};
    const env = indoor ? r.indoor : r.outdoor;
    return { score: objectiveWeight(ctx,r.tiers) + env + (field ? (r.field||0) : 0), why:r.why };
  }

  function victoryRule(key, ctx) {
    if (key === 'vxt') {
      const score = objectiveWeight(ctx,{progression:-4,performance:7,competition:13,elite:17}) + (ctx.environment==='indoor'?-4:7);
      return {score, why:'VXT : cible haut de gamme à avant parallèle/arrière conique. Potentiel élevé mais réglage/coupe plus technique ; à privilégier quand l’archer maîtrise déjà son tuning.'};
    }
    if (key === 'vap') {
      const score = objectiveWeight(ctx,{progression:5,performance:10,competition:11,elite:9}) + (ctx.environment==='indoor'?-2:7);
      return {score, why:'VAP : micro-diamètre parallèle .166, spine aligné et poids appairé ; choix très cohérent de performance/compétition avec réglage plus conventionnel que VXT.'};
    }
    return {score:0,why:''};
  }

  function skylonRule(key, ctx) {
    const indoor = ctx.environment === 'indoor';
    const field = ctx.discipline === 'field';
    const rules = {
      preminens:{tiers:{progression:-4,performance:8,competition:14,elite:16},outdoor:10,indoor:-5,field:5,why:'Preminens : positionné par Skylon comme “ultimate outdoor arrow”; micro-diamètre 3,2 mm et niveau de précision le plus élevé de la famille extérieure.'},
      paragon:{tiers:{progression:0,performance:10,competition:12,elite:10},outdoor:9,indoor:-5,field:5,why:'Paragon : 40T, ID 3,2 mm et rectitude serrée ; choix compétition/performance extérieur.'},
      precium:{tiers:{progression:2,performance:10,competition:9,elite:6},outdoor:8,indoor:-4,field:5,why:'Precium : famille outdoor 3,2 mm ; compromis performance/précision sans viser nécessairement le niveau ultime.'},
      performa:{tiers:{progression:5,performance:9,competition:6,elite:2},outdoor:8,indoor:-4,field:5,why:'Performa : 40T, ID 3,2 mm, clairement orientée outdoor ; pertinente pour progresser vers la compétition.'},
      brixxon:{tiers:{progression:9,performance:6,competition:2,elite:-2},outdoor:4,indoor:0,field:2,why:'Brixxon : Skylon la positionne comme flèche intermédiaire recurve/compound ; bon choix club/performance accessible.'},
      radius:{tiers:{progression:10,performance:2,competition:-3,elite:-5},outdoor:2,indoor:0,field:1,why:'Radius : gamme débutant/progression recurve/compound selon Skylon ; priorité à la tolérance d’usage.'},
      bruxx:{tiers:{progression:3,performance:8,competition:10,elite:8},outdoor:-5,indoor:12,field:8,why:'Bruxx : Skylon la classe indoor et 3D ; grand diamètre 8 mm adapté à ces usages.'},
      empros:{tiers:{progression:2,performance:9,competition:12,elite:10},outdoor:-5,indoor:13,field:8,why:'Empros : 24T 3K, ID 8 mm et rectitude ±.003", positionnée salle/3D par Skylon.'},
      edge:{tiers:{progression:-20,performance:-20,competition:-20,elite:-20},outdoor:-20,indoor:-20,field:-20,why:'Edge est positionnée par Skylon pour compound outdoor/hunting : elle est exclue d’une recommandation recurve.'}
    };
    const r=rules[key]; if(!r)return {score:0,why:''};
    return {score:objectiveWeight(ctx,r.tiers)+(indoor?r.indoor:r.outdoor)+(field?(r.field||0):0),why:r.why};
  }

  function ruleFor(brand,key,ctx) {
    if (brand === 'easton') return eastonRule(key,ctx);
    if (brand === 'victory') return victoryRule(key,ctx);
    if (brand === 'skylon') return skylonRule(key,ctx);
    return {score:0,why:''};
  }

  function rankRecommendation(rec,input) {
    if (!rec || !Array.isArray(rec.models) || !['easton','victory','skylon'].includes(rec.brand)) return rec;
    const ctx=context(input);
    const ranked=[];
    for (const entry of rec.models) {
      const key=modelKey(entry.model);
      if (rec.brand==='skylon' && key==='edge' && ctx.bowType==='recurve') continue;
      const expert=ruleFor(rec.brand,key,ctx);
      const base=Number.isFinite(Number(entry.score))?Number(entry.score):0;
      ranked.push({...entry,expertRankScore:base+expert.score,expertWhy:expert.why,expertModelKey:key});
    }
    ranked.sort((a,b)=>b.expertRankScore-a.expertRankScore);
    rec.models=ranked;
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),`Interprétation app ${VERSION} : classement entre modèles compatibles selon discipline, environnement et objectif de pratique. Le spine fabricant n’est pas modifié par ce classement.`];
    return rec;
  }

  function patchRecommendationEngine() {
    if (patched || typeof window.buildBrandRecommendation !== 'function' || !window.AssistantArcherManufacturerReference) return false;
    const original=window.buildBrandRecommendation;
    window.buildBrandRecommendation=function expertRankedRecommendation(input,brand){
      const rec=original.apply(this,arguments);
      return rankRecommendation(rec,input);
    };
    patched=true;
    window.AssistantArcherExpertModelRanking=Object.freeze({version:VERSION,rankRecommendation});
    return true;
  }

  function decorateInterpretation() {
    const result=document.getElementById('result');
    if(!result)return;
    result.querySelectorAll('li').forEach(li=>{
      if(li.querySelector(':scope > .expert-model-why'))return;
      const strong=li.querySelector('strong');if(!strong)return;
      const key=modelKey(strong.textContent);if(!key)return;
      const brand = ['vap','vxt'].includes(key)?'victory':(['preminens','precium','paragon','performa','brixxon','radius','bruxx','empros','edge'].includes(key)?'skylon':'easton');
      const why=ruleFor(brand,key,context({})).why;if(!why)return;
      const p=document.createElement('p');p.className='expert-model-why muted';p.style.cssText='margin:.25rem 0 .15rem;font-size:.82rem;line-height:1.35';
      p.innerHTML=`<strong>Interprétation app :</strong> ${why}`;
      li.appendChild(p);
    });
  }

  function refresh(){installObjectiveInput();patchRecommendationEngine();decorateInterpretation();const release=document.getElementById('appReleaseStatic');if(release&&patched)release.textContent=`Version : ${VERSION}`;}

  function install(){
    refresh();
    let attempts=0;
    const timer=setInterval(()=>{attempts++;refresh();if(patched||attempts>80)clearInterval(timer);},100);
    const result=document.getElementById('result');
    if(result){let queued=false;observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateInterpretation();});});observer.observe(result,{childList:true,subtree:true});}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
