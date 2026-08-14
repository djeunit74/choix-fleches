(() => {
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
  const GROUPS={
    A1:['Avalon Tyro 1500','Avalon Tyro 1800','Avalon Classic 1500','Avalon Classic 1800'],
    A2:['Avalon Tyro 1300','Avalon Classic 1300'],
    A3:['Avalon Tyro 1100','Avalon Classic 1100'],
    A4:['Avalon Tyro 1000','Avalon Classic 1000'],
    A5:['Avalon Tyro 900','Avalon Classic 900'],
    A6:['Avalon Tyro 800','Avalon Tyro 900','Avalon Classic 800','Avalon Classic 900'],
    A7:['Avalon Tyro 700','Avalon Tyro 800','Avalon Classic 700','Avalon Classic 800'],
    A8:['Avalon Tyro 600','Avalon Tyro 700','Avalon Classic 600','Avalon Classic 700'],
    A9:['Avalon Tyro 600','Avalon Classic 600'],
    A10:['Avalon Tyro 600','Avalon Classic 500','Avalon Classic 600'],
    A12:['Avalon Classic 500'],
    A14:['Avalon Classic 500']
  };
  const spineOf=name=>String(name).match(/(\d{3,4})$/)?.[1]||null;
  function groupFor(input){const len=Math.round(input.arrowLength),col=LENGTHS.indexOf(len);if(col<0)return null;const row=ROWS.find(r=>input.drawWeight>=r.range[0]&&input.drawWeight<=r.range[1]);if(!row)return null;const group=row.cells[col];return group?{group,rowLabel:`${row.range[0]}-${row.range[1]} lbs`,length:len}:null;}
  function meta(name){const spine=Number(spineOf(name)||800),tyro=name.includes('Tyro');const points=tyro?(spine>=1800?[50]:spine>=900?[70]:[90]):[60,70,80,90,100,110,120];return {material:'carbon',diameters:['standard'],environments:['outdoor','mixed'],disciplines:['target','field'],bowTypes:['recurve'],goals:['club','polyvalent'],pointRange:[Math.min(...points),Math.max(...points)],pointChoices:points,note:'Correspondance issue du tableau Avalon 2016, gamme actuelle controlee.',seriesTier:'club',massClass:spine>=1000?'light':'medium',toleranceClass:'standard',componentSystem:'insert',useCase:'club',distanceBand:'mixed',dataPrecision:'model'};}
  function install(){
    try{
      const select=document.getElementById('preferredBrand');
      if(select&&!select.querySelector('option[value="avalon"]')){const o=document.createElement('option');o.value='avalon';o.textContent='Avalon';select.appendChild(o);}
      if(typeof BRAND_ORDER!=='undefined'&&!BRAND_ORDER.includes('avalon'))BRAND_ORDER.push('avalon');
      const models=[...new Set(Object.values(GROUPS).flat())],catalog={};
      models.forEach(name=>{const s=spineOf(name);(catalog[s]??=[]).push(name);});
      if(typeof arrowCatalog!=='undefined')arrowCatalog.avalon=catalog;
      if(typeof catalogState!=='undefined'){catalogState.catalog.avalon=catalog;models.forEach(name=>catalogState.models[normalizeModelKey(name)]=meta(name));}
      if(!window.__avalonWrapped&&typeof buildBrandRecommendation==='function'){
        const original=buildBrandRecommendation;
        buildBrandRecommendation=function(input,brand){
          if(brand!=='avalon')return original(input,brand);
          const hit=groupFor(input),profile=deriveTargetProfile(input);
          if(!hit)return {brand:'avalon',mode:'avalon-table',primary:'Hors tableau',softer:null,stiffer:null,load:input.drawWeight,confidence:'Faible',confidenceReasons:['Combinaison hors des cases documentees du tableau Avalon 2016.','Aucune extrapolation automatique.'],models:[],alternativeModels:[],fallbackLabel:'',recommendedMaterial:'carbon',recommendedDiameter:'standard',recommendedPointRange:profile.pointRange,recommendedPointWeight:input.pointWeight,recommendedPointChoices:[],recommendedPointProfile:'standard',recommendedPointSofter:null,recommendedPointStiffer:null,pointWeightNote:'Verifier le tableau fabricant.',recommendedSeries:'club',recommendedMass:'medium',recommendedTolerance:'standard',recommendedComponentSystem:'insert',recommendedUseCase:'club',recommendedDistanceBand:'mixed',notes:['Avalon : pas de correspondance automatique fiable pour cette combinaison.']};
          const names=GROUPS[hit.group]||[];
          const ranked=rankModels(names,input,profile).map(e=>({...e,advisedSpine:spineOf(e.model)}));
          const top=ranked[0]?.meta||null,point=estimatePointSetup(input,top?.pointRange||profile.pointRange,top);
          return {brand:'avalon',mode:'avalon-table',primary:hit.group,comparisonSpine:ranked[0]?.advisedSpine||null,softer:null,stiffer:null,load:input.drawWeight,confidence:names.length?'Moyenne':'Faible',confidenceReasons:[`Groupe ${hit.group} du tableau Avalon 2016 (${hit.rowLabel}, ${hit.length}\").`,names.length?'Seuls les Tyro / Classic encore presents dans la gamme actuelle sont proposes.':'Aucun Tyro / Classic actuel directement documente dans ce groupe.','Le spine 2000 actuel n est pas extrapole.'],models:ranked,alternativeModels:[],fallbackLabel:'',recommendedMaterial:top?.material||'carbon',recommendedDiameter:top?.diameters?.[0]||'standard',recommendedPointRange:top?.pointRange||profile.pointRange,recommendedPointWeight:point.recommended,recommendedPointChoices:point.pointChoices,recommendedPointProfile:point.profile,recommendedPointSofter:point.softerOption,recommendedPointStiffer:point.stifferOption,pointWeightNote:point.note,recommendedSeries:top?.seriesTier||'club',recommendedMass:top?.massClass||'medium',recommendedTolerance:top?.toleranceClass||'standard',recommendedComponentSystem:top?.componentSystem||'insert',recommendedUseCase:top?.useCase||'club',recommendedDistanceBand:top?.distanceBand||'mixed',notes:['Tableau Avalon historique utilise avec controle de la gamme actuelle.','Validation finale au tir recommandee.']};
        };
        window.__avalonWrapped=true;
      }
      if(!document.getElementById('avalonSourceNote')){
        const panel=document.querySelector('[data-panel="spine"]');
        if(panel){const d=document.createElement('details');d.id='avalonSourceNote';d.className='card notes expert-audit-note';d.innerHTML=`<summary>Source Avalon</summary><p>L app utilise le tableau Avalon / ArrowSelector 2016 pour les groupes A1 a A18, puis ne conserve que les Tyro / Classic encore presents dans la gamme actuelle.</p><p><a href="${AVALON_2016}" target="_blank" rel="noopener noreferrer">Tableau Avalon 2016</a> · <a href="${AVALON_CURRENT}" target="_blank" rel="noopener noreferrer">Gamme actuelle Avalon</a></p><p>Le spine 2000 actuel n est pas extrapole automatiquement.</p>`;panel.appendChild(d);}}
    }catch(e){console.warn('Avalon non charge',e);}
  }
  function installArcEmptyState(){
    const form=document.getElementById('arc-setup-form'),upper=document.getElementById('upperTiller'),lower=document.getElementById('lowerTillerMeasured'),result=document.getElementById('arcSetupResult');
    if(!form||!upper||!lower||!result||form.dataset.emptyStateGuard)return;
    form.dataset.emptyStateGuard='1';
    const hasMeasurements=()=>Boolean(upper.value.trim()&&lower.value.trim());
    const reset=()=>{result.innerHTML='<h2>Reglage de l\'arc</h2><p>Renseignez vos mesures puis lancez le calcul.</p>';};
    if(!hasMeasurements())reset();
    form.addEventListener('submit',event=>{if(hasMeasurements())return;event.preventDefault();event.stopImmediatePropagation();reset();},true);
    [upper,lower].forEach(input=>input.addEventListener('input',()=>{if(!hasMeasurements())reset();}));
  }
  setTimeout(()=>{install();installArcEmptyState();},1200);
  setTimeout(()=>{install();installArcEmptyState();},3000);
})();