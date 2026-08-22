/* Assistant Archer TEST - Avalon robuste, Pré-alpha v20. */
(() => {
  'use strict';
  const VERSION='Pré-alpha v20';
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
  const HISTORICAL={
    A1:{tyro:[1500,1800],classic:[1500,1800],composite:[1500,1800]},A2:{tyro:[1300],classic:[1300],composite:[1300]},
    A3:{tyro:[1100],classic:[1100],composite:[1100]},A4:{tyro:[1000],classic:[1000],composite:[1000]},
    A5:{tyro:[900],classic:[900],composite:[900]},A6:{tyro:[800,900],classic:[800,900],composite:[800,900]},
    A7:{tyro:[700,800],classic:[700,800],composite:[700,800]},A8:{tyro:[600,700],classic:[600,700],composite:[600,700]},
    A9:{tyro:[600],classic:[600],composite:[600]},A10:{tyro:[600],classic:[500,600],composite:[600]},A12:{classic:[500]},A14:{classic:[500]}
  };
  const CURRENT={
    tyro:{key:'tyro carbon arrows',label:'Avalon Tyro Carbon Arrows',spines:[600,700,800,900,1000,1100,1300,1500,1800,2000],lengths:[26,27,28,29,30,31],straightness:0.007,points:[50,70,90]},
    classic:{key:'classic carbon arrows',label:'Avalon Classic Carbon Arrows',spines:[400,500,600,700,800,900,1000,1100,1300,1500,1800,2000],stock:32,straightness:0.005,points:[50,60,70,80,90,100,110,120]},
    hybrid:{key:'hybrid carbon arrows',label:'Avalon Hybrid Carbon Arrows',spines:[500,600,700,800,900,1000,1100,1300,1500,1800,2000],stock:32,straightness:0.009,points:[50,70,90]},
    shaft:{key:'tyro carbon shafts',label:'Avalon Tyro Carbon Shafts',spines:[600,700,800,900,1000,1100,1300,1500,1800],stock:32,straightness:0.007,points:[50,70,90]}
  };
  function groupFor(input){const length=Math.round(Number(input.arrowLength)),col=LENGTHS.indexOf(length);if(col<0)return null;const row=ROWS.find(x=>Number(input.drawWeight)>=x.range[0]&&Number(input.drawWeight)<=x.range[1]);if(!row)return null;const group=row.cells[col];return group?{group,rowLabel:`${row.range[0]}-${row.range[1]} lbs`,length}:null;}
  function lengthCompatible(f,input){const requested=Number(input.arrowLength);if(!Number.isFinite(requested))return true;if(Array.isArray(f.lengths))return f.lengths.includes(Math.round(requested));return !Number.isFinite(f.stock)||f.stock+1e-9>=requested;}
  function modelMeta(f,spine){return {material:'carbon',diameters:['thin'],environments:['outdoor','mixed','indoor'],disciplines:['target','field'],bowTypes:['recurve'],goals:f===CURRENT.classic?['club','performance']:['club','polyvalent'],pointRange:[Math.min(...f.points),Math.max(...f.points)],pointChoices:f.points,note:`Avalon actuel : ID 4,2 mm, rectitude ±${f.straightness}\".`,seriesTier:f===CURRENT.classic?'performance':'club',massClass:'medium',toleranceClass:f===CURRENT.classic?'performance':'standard',componentSystem:'insert',useCase:'club',distanceBand:'mixed',dataPrecision:'manufacturer-current',spine};}
  function candidatesFor(hit,input){const h=HISTORICAL[hit.group]||{},out=[];const add=(f,spines,basis,note)=>{if(!lengthCompatible(f,input))return;for(const spine of spines||[]){if(!f.spines.includes(spine))continue;out.push({name:`${f.label} ${spine}`,family:f,spine,basis,note});}};add(CURRENT.tyro,h.tyro,'direct','Tyro est cité directement dans le tableau Avalon 2016 pour ce groupe.');add(CURRENT.classic,h.classic,'direct','Classic est cité directement dans le tableau Avalon 2016 pour ce groupe.');add(CURRENT.hybrid,h.composite,'current-spine','Le tableau 2016 cite Carbon Composite ; Hybrid existe actuellement dans le même spine, sans continuité de gamme affirmée.');add(CURRENT.shaft,h.tyro,'current-spine','Tyro Shaft existe actuellement dans le même spine que le Tyro cité au selector 2016.');return out;}
  function emptyRecommendation(input,profile,reason){return {brand:'avalon',mode:'avalon-table-v20',primary:'Hors tableau',softer:null,stiffer:null,load:input.drawWeight,confidence:'Faible',confidenceReasons:[reason,'Aucune extrapolation automatique.'],models:[],alternativeModels:[],fallbackLabel:'',recommendedMaterial:'carbon',recommendedDiameter:'thin',recommendedPointRange:profile?.pointRange||[50,120],recommendedPointWeight:input.pointWeight||90,recommendedPointChoices:[],recommendedPointProfile:'standard',recommendedPointSofter:null,recommendedPointStiffer:null,pointWeightNote:'Vérifier le tableau fabricant.',recommendedSeries:'club',recommendedMass:'medium',recommendedTolerance:'standard',recommendedComponentSystem:'insert',recommendedUseCase:'club',recommendedDistanceBand:'mixed',notes:['Avalon : aucune correspondance suffisamment documentée pour cette combinaison.']};}
  function buildAvalonRecommendation(input){
    if(typeof deriveTargetProfile!=='function'||typeof estimatePointSetup!=='function')return null;
    const profile=deriveTargetProfile(input),hit=groupFor(input);if(!hit)return emptyRecommendation(input,profile,'Combinaison hors des cases documentées du tableau Avalon 2016.');
    const candidates=candidatesFor(hit,input);if(!candidates.length)return emptyRecommendation(input,profile,`Groupe ${hit.group} documenté mais aucune famille Avalon actuelle compatible en longueur/spine.`);
    /* Important : ne pas passer par rankModels/getModelMetadata ici. refreshCatalogState()
       peut remplacer catalogState après le chargement de l'add-on. Les métadonnées
       Avalon vérifiées sont donc attachées directement aux candidats. */
    const ranked=candidates.map((c,index)=>({model:c.name,score:100-index,meta:modelMeta(c.family,c.spine),advisedSpine:String(c.spine),avalonMappingBasis:c.basis,avalonMappingNote:c.note,manufacturerVerified:true,manufacturerSource:AVALON_CURRENT,catalogAuditKey:c.family.key}));
    const top=ranked[0].meta,point=estimatePointSetup(input,top.pointRange,top),direct=ranked.filter(x=>x.avalonMappingBasis==='direct').length;
    return {brand:'avalon',mode:'avalon-table-v20',primary:hit.group,comparisonSpine:ranked[0].advisedSpine,softer:null,stiffer:null,load:input.drawWeight,confidence:direct?'Moyenne':'Prudente',confidenceReasons:[`Groupe ${hit.group} du tableau Avalon 2016 (${hit.rowLabel}, ${hit.length}\").`,`${direct} correspondance(s) directe(s) Tyro/Classic ; les rapprochements Hybrid/Tyro Shaft restent signalés séparément.`,'Les modèles Avalon sont attachés directement à la recommandation afin qu’un rechargement du catalogue global ne puisse pas les supprimer.'],models:ranked,alternativeModels:[],fallbackLabel:'',recommendedMaterial:'carbon',recommendedDiameter:'thin',recommendedPointRange:top.pointRange,recommendedPointWeight:point.recommended,recommendedPointChoices:point.pointChoices,recommendedPointProfile:point.profile,recommendedPointSofter:point.softerOption,recommendedPointStiffer:point.stifferOption,pointWeightNote:point.note,recommendedSeries:top.seriesTier,recommendedMass:top.massClass,recommendedTolerance:top.toleranceClass,recommendedComponentSystem:top.componentSystem,recommendedUseCase:top.useCase,recommendedDistanceBand:top.distanceBand,notes:['Tyro et Classic : correspondance directe du selector Avalon 2016.','Hybrid et Tyro Shaft : rapprochement par spine actuel, sans prétendre à une continuité historique certifiée.']};
  }
  function installCatalog(){const select=document.getElementById('preferredBrand');if(select&&!select.querySelector('option[value="avalon"]')){const o=document.createElement('option');o.value='avalon';o.textContent='Avalon';select.appendChild(o);}if(typeof BRAND_ORDER!=='undefined'&&!BRAND_ORDER.includes('avalon'))BRAND_ORDER.push('avalon');const catalog={};for(const f of Object.values(CURRENT))for(const spine of f.spines){const name=`${f.label} ${spine}`;(catalog[String(spine)]??=[]).push(name);}if(typeof arrowCatalog!=='undefined')arrowCatalog.avalon=catalog;if(typeof catalogState!=='undefined')catalogState.catalog.avalon=catalog;}
  function exposeApi(){window.AssistantArcherAvalon=Object.freeze({version:VERSION,recommend:buildAvalonRecommendation,groupFor,candidatesFor});}
  function installWrapper(){if(window.__avalonWrappedV20||typeof buildBrandRecommendation!=='function')return;const original=buildBrandRecommendation;buildBrandRecommendation=function(input,brand){if(brand==='avalon')return buildAvalonRecommendation(input)||original(input,brand);return original(input,brand);};window.__avalonWrappedV20=true;}
  function install(){try{installCatalog();exposeApi();installWrapper();const release=document.getElementById('appReleaseStatic');if(release)release.textContent=`Version : ${VERSION}`;}catch(e){console.warn('Avalon v20 non chargé',e);}}
  install();setTimeout(install,250);setTimeout(install,900);setTimeout(install,2200);
})();