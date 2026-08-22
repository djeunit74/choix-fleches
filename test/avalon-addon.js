/* Assistant Archer TEST - Avalon enrichi Pré-alpha v18. */
(() => {
  'use strict';
  const VERSION='Pré-alpha v18';
  const AVALON_2016='https://www.bogentandler.at/pdf-attachments/tables/20160816_arrowselector.pdf';
  const AVALON_CURRENT='https://www.avalon-archery.com/fletched_arrows_shafts';
  const LENGTHS=[21,22,23,24,25,26,27,28,29,30,31,32];
  const ROWS=[
    {range:[16,19],cells:[null,null,null,null,'A1','A1','A1','A2',null,null,null,null]},
    {range:[20,23],cells:[null,null,null,null,'A2','A3','A4','A5','A6',null,null,null]},
    {range:[24,29],cells:[null,null,'A1','A2','A3','A4','A5','A6','A7','A8',null,null]},
    {range:[30,35],cells:[null,null,'A2','A3','A4','A5','A6','A7','A8','A9','A10','A11']},
    {range:[36,40],cells:[null,null,'A3','A4','A5','A6','A7','A8','A9','A10','A12','A13']},
    {range:[41,45],cells:[null,null,'A4','A5','A6','A7','A8','A9','A10','A12','A14','A15']},
    {range:[46,50],cells:[null,null,'A5','A6','A7','A8','A9','A10','A12','A14','A15','A16']},
    {range:[51,55],cells:[null,null,'A6','A7','A8','A9','A10','A12','A14','A15','A16','A17']},
    {range:[56,60],cells:[null,null,'A7','A8','A9','A10','A12','A14','A15','A16','A17','A17']},
    {range:[61,65],cells:[null,null,'A8','A9','A10','A12','A14','A15','A16','A17','A17','A18']},
    {range:[66,70],cells:[null,null,'A9','A10','A12','A14','A15','A16','A17','A17','A18','A18']}
  ];

  /* Correspondances explicites visibles dans le selector Avalon 2016.
     "composite" est conservé comme libellé historique et n'est pas présenté comme
     un renommage officiel de Hybrid. */
  const HISTORICAL={
    A1:{tyro:[1500,1800],classic:[1500,1800],composite:[1500,1800]},
    A2:{tyro:[1300],classic:[1300],composite:[1300]},
    A3:{tyro:[1100],classic:[1100],composite:[1100]},
    A4:{tyro:[1000],classic:[1000],composite:[1000]},
    A5:{tyro:[900],classic:[900],composite:[900]},
    A6:{tyro:[800,900],classic:[800,900],composite:[800,900]},
    A7:{tyro:[700,800],classic:[700,800],composite:[700,800]},
    A8:{tyro:[600,700],classic:[600,700],composite:[600,700]},
    A9:{tyro:[600],classic:[600],composite:[600]},
    A10:{tyro:[600],classic:[500,600],composite:[600]},
    A12:{classic:[500]},
    A14:{classic:[500]}
  };

  const CURRENT={
    tyro:{key:'tyro carbon arrows',label:'Avalon Tyro Carbon Arrows',spines:[600,700,800,900,1000,1100,1300,1500,1800,2000],lengths:[26,27,28,29,30,31],straightness:0.007,points:[50,70,90],basis:'direct'},
    classic:{key:'classic carbon arrows',label:'Avalon Classic Carbon Arrows',spines:[400,500,600,700,800,900,1000,1100,1300,1500,1800,2000],stock:32,straightness:0.005,points:[50,60,70,80,90,100,110,120],basis:'direct'},
    hybrid:{key:'hybrid carbon arrows',label:'Avalon Hybrid Carbon Arrows',spines:[500,600,700,800,900,1000,1100,1300,1500,1800,2000],stock:32,straightness:0.009,points:[50,70,90],basis:'spine-current'},
    shaft:{key:'tyro carbon shafts',label:'Avalon Tyro Carbon Shafts',spines:[600,700,800,900,1000,1100,1300,1500,1800],stock:32,straightness:0.007,points:[50,70,90],basis:'spine-current'}
  };

  const spineOf=name=>String(name).match(/(\d{3,4})$/)?.[1]||null;
  function groupFor(input){
    const length=Math.round(Number(input.arrowLength));
    const column=LENGTHS.indexOf(length);if(column<0)return null;
    const row=ROWS.find(x=>Number(input.drawWeight)>=x.range[0]&&Number(input.drawWeight)<=x.range[1]);
    if(!row)return null;const group=row.cells[column];
    return group?{group,rowLabel:`${row.range[0]}-${row.range[1]} lbs`,length}:null;
  }
  function lengthCompatible(family,input){
    const requested=Number(input.arrowLength);if(!Number.isFinite(requested))return true;
    if(Array.isArray(family.lengths))return family.lengths.some(v=>v+1e-9>=requested);
    if(Number.isFinite(family.stock))return family.stock+1e-9>=requested;
    return true;
  }
  function modelMeta(family,spine){
    return {material:'carbon',diameters:['thin'],environments:['outdoor','mixed','indoor'],disciplines:['target','field'],bowTypes:['recurve'],
      goals:family===CURRENT.classic?['club','performance']:['club','polyvalent'],pointRange:[Math.min(...family.points),Math.max(...family.points)],pointChoices:family.points,
      note:`Avalon actuel : ID 4,2 mm, rectitude ±.${String(family.straightness).split('.')[1]}\".`,seriesTier:family===CURRENT.classic?'performance':'club',
      massClass:'medium',toleranceClass:family===CURRENT.classic?'performance':'standard',componentSystem:'insert',useCase:'club',distanceBand:'mixed',dataPrecision:'manufacturer-current',spine};
  }
  function candidatesFor(hit,input){
    const h=HISTORICAL[hit.group]||{},out=[];
    const add=(family,spines,basis,note)=>{
      if(!lengthCompatible(family,input))return;
      for(const spine of spines||[]){
        if(!family.spines.includes(spine))continue;
        out.push({name:`${family.label} ${spine}`,family,spine,basis,note});
      }
    };
    add(CURRENT.tyro,h.tyro,'direct','Tyro est cité directement dans le tableau Avalon 2016 pour ce groupe.');
    add(CURRENT.classic,h.classic,'direct','Classic est cité directement dans le tableau Avalon 2016 pour ce groupe.');
    add(CURRENT.hybrid,h.composite,'current-spine','Le tableau 2016 cite Avalon Carbon Composite ; la gamme actuelle Hybrid existe dans le même spine. Continuité de gamme non confirmée explicitement par Avalon.');
    add(CURRENT.shaft,h.tyro,'current-spine','Le tableau 2016 cite Tyro dans ce spine et Avalon vend aujourd’hui un Tyro Carbon Shaft dans ce même spine ; la version shaft n’est pas listée séparément dans le tableau 2016.');
    return out;
  }
  function emptyRecommendation(input,profile,reason){return {brand:'avalon',mode:'avalon-table',primary:'Hors tableau',softer:null,stiffer:null,load:input.drawWeight,confidence:'Faible',confidenceReasons:[reason,'Aucune extrapolation automatique.'],models:[],alternativeModels:[],fallbackLabel:'',recommendedMaterial:'carbon',recommendedDiameter:'thin',recommendedPointRange:profile.pointRange,recommendedPointWeight:input.pointWeight,recommendedPointChoices:[],recommendedPointProfile:'standard',recommendedPointSofter:null,recommendedPointStiffer:null,pointWeightNote:'Vérifier le tableau fabricant.',recommendedSeries:'club',recommendedMass:'medium',recommendedTolerance:'standard',recommendedComponentSystem:'insert',recommendedUseCase:'club',recommendedDistanceBand:'mixed',notes:['Avalon : aucune correspondance suffisamment documentée pour cette combinaison.']};}

  function installCatalog(){
    const select=document.getElementById('preferredBrand');if(select&&!select.querySelector('option[value="avalon"]')){const o=document.createElement('option');o.value='avalon';o.textContent='Avalon';select.appendChild(o);}
    if(typeof BRAND_ORDER!=='undefined'&&!BRAND_ORDER.includes('avalon'))BRAND_ORDER.push('avalon');
    const catalog={};
    for(const family of Object.values(CURRENT))for(const spine of family.spines){const name=`${family.label} ${spine}`;(catalog[String(spine)]??=[]).push(name);if(typeof catalogState!=='undefined')catalogState.models[normalizeModelKey(name)]=modelMeta(family,spine);}
    if(typeof arrowCatalog!=='undefined')arrowCatalog.avalon=catalog;
    if(typeof catalogState!=='undefined')catalogState.catalog.avalon=catalog;
  }

  function installRecommendation(){
    if(window.__avalonWrappedV18||typeof buildBrandRecommendation!=='function')return;
    const original=buildBrandRecommendation;
    buildBrandRecommendation=function(input,brand){
      if(brand!=='avalon')return original(input,brand);
      const profile=deriveTargetProfile(input),hit=groupFor(input);
      if(!hit)return emptyRecommendation(input,profile,'Combinaison hors des cases documentées du tableau Avalon 2016.');
      const candidates=candidatesFor(hit,input);
      if(!candidates.length)return emptyRecommendation(input,profile,`Groupe ${hit.group} documenté, mais aucune famille Avalon actuelle ne peut être reliée sans extrapolation à cette combinaison.`);
      const map=new Map(candidates.map(c=>[c.name,c]));
      const ranked=rankModels(candidates.map(c=>c.name),input,profile).map(entry=>{const c=map.get(entry.model);return {...entry,advisedSpine:String(c?.spine||spineOf(entry.model)),avalonMappingBasis:c?.basis||'',avalonMappingNote:c?.note||'',manufacturerVerified:true,manufacturerSource:AVALON_CURRENT};});
      const top=ranked[0]?.meta||null,point=estimatePointSetup(input,top?.pointRange||profile.pointRange,top);
      const direct=ranked.filter(x=>x.avalonMappingBasis==='direct').length;
      return {brand:'avalon',mode:'avalon-table-v18',primary:hit.group,comparisonSpine:ranked[0]?.advisedSpine||null,softer:null,stiffer:null,load:input.drawWeight,
        confidence:direct?'Moyenne':'Prudente',confidenceReasons:[`Groupe ${hit.group} du tableau Avalon 2016 (${hit.rowLabel}, ${hit.length}\").`,`${direct} correspondance(s) directe(s) Tyro/Classic ; les autres sont signalées comme correspondances actuelles par spine.`],
        models:ranked,alternativeModels:[],fallbackLabel:'',recommendedMaterial:'carbon',recommendedDiameter:'thin',recommendedPointRange:top?.pointRange||profile.pointRange,recommendedPointWeight:point.recommended,recommendedPointChoices:point.pointChoices,recommendedPointProfile:point.profile,recommendedPointSofter:point.softerOption,recommendedPointStiffer:point.stifferOption,pointWeightNote:point.note,recommendedSeries:top?.seriesTier||'club',recommendedMass:top?.massClass||'medium',recommendedTolerance:top?.toleranceClass||'standard',recommendedComponentSystem:top?.componentSystem||'insert',recommendedUseCase:top?.useCase||'club',recommendedDistanceBand:top?.distanceBand||'mixed',
        notes:['Tyro et Classic : correspondance directe du selector Avalon 2016.','Hybrid et Tyro shafts : présence actuelle fabricant vérifiée ; lorsqu’ils apparaissent, la correspondance est indiquée comme rapprochement par spine et non comme continuité historique certifiée.']};
    };
    window.__avalonWrappedV18=true;
  }

  function decorateAvalonMapping(){
    const result=document.getElementById('result');if(!result)return;
    result.querySelectorAll('li').forEach(li=>{if(li.querySelector(':scope > .avalon-mapping-note'))return;const text=li.textContent||'';if(!/Avalon/i.test(text))return;const model=[...Object.values(CURRENT)].find(f=>text.includes(f.label));if(!model)return;const p=document.createElement('p');p.className='avalon-mapping-note muted';p.style.cssText='margin:.25rem 0 .15rem;font-size:.82rem;line-height:1.35';p.innerHTML=model===CURRENT.hybrid?'<strong>Lecture Avalon :</strong> gamme actuelle vérifiée ; rapprochement par spine avec le libellé historique Composite, sans affirmer un renommage fabricant.':model===CURRENT.shaft?'<strong>Lecture Avalon :</strong> shaft actuel vérifié ; spine rapproché du Tyro cité dans le selector 2016.':'<strong>Lecture Avalon :</strong> famille citée directement dans le selector Avalon 2016 et toujours présente dans la gamme actuelle.';li.appendChild(p);});
  }
  function integrateSources(){
    const important=[...document.querySelectorAll('[data-panel="spine"] .card.notes')].find(card=>/Important/i.test(card.querySelector('h3')?.textContent||''));const list=important?.querySelector('ul');if(!list)return;
    const sourceLine=[...list.querySelectorAll('li')].find(li=>/Tableaux officiels|Tableaux fabricants|fabricants a consulter/i.test(li.textContent||''));if(!sourceLine||sourceLine.querySelector('a[data-avalon-source]'))return;
    const a=document.createElement('a');a.href=AVALON_2016;a.target='_blank';a.rel='noopener noreferrer';a.dataset.avalonSource='2016';a.textContent='Avalon selector 2016';const c=document.createElement('a');c.href=AVALON_CURRENT;c.target='_blank';c.rel='noopener noreferrer';c.dataset.avalonSource='current';c.textContent='gamme Avalon actuelle';sourceLine.append(document.createTextNode(', '),a,document.createTextNode(' et '),c,document.createTextNode('.'));
  }
  function installComparisonGuard(){if(window.__avalonComparisonGuardV18||typeof renderComparisonBrandCard!=='function')return;const original=renderComparisonBrandCard;renderComparisonBrandCard=function(entry,input){if(entry?.brand==='avalon'&&!(entry.rec?.models||[]).length)return'';return original(entry,input);};window.__avalonComparisonGuardV18=true;}
  function install(){try{installCatalog();installRecommendation();installComparisonGuard();integrateSources();decorateAvalonMapping();const r=document.getElementById('appReleaseStatic');if(r)r.textContent=`Version : ${VERSION}`;const result=document.getElementById('result');if(result&&!result.dataset.avalonV18Observer){result.dataset.avalonV18Observer='1';new MutationObserver(()=>requestAnimationFrame(decorateAvalonMapping)).observe(result,{childList:true,subtree:true});}}catch(e){console.warn('Avalon v18 non chargé',e);}}
  setTimeout(install,700);setTimeout(install,1800);
})();