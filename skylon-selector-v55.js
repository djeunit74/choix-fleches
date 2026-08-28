/* Assistant Archer TEST - Skylon official target/field/3D chart, Pré-alpha v56.
   Source fabricant : https://www.skylonarchery.com/images/chart/chart%20target.pdf
   La longueur Skylon est mesurée CUT TO CUT. Le tableau donne d'abord un groupe,
   puis une ou plusieurs tailles par famille. Aucune formule générique n'est utilisée.
*/
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v56';
  const SOURCE = 'https://www.skylonarchery.com/images/chart/chart%20target.pdf';
  const LENGTHS = Object.freeze([23,24,25,26,27,28,29,30,31,32]);

  const ROWS = Object.freeze([
    {min:16,max:19,values:['Y1','Y1','Y2','Y3','Y4',null,null,null,null,null]},
    {min:20,max:23,values:['Y1','Y2','Y3','Y4','A1','A2','A3','A4',null,null]},
    {min:24,max:29,values:['Y2','Y3','Y4','A1','A2','A3','A4','A5','A6',null]},
    {min:30,max:35,values:[null,null,'A1','A2','A3','A4','A5','A6','A7',null]},
    {min:36,max:40,values:[null,'A1','A2','A3','A4','A5','A6','A7','A8','A9']},
    {min:41,max:45,values:['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10']},
    {min:46,max:50,values:['A2','A3','A4','A5','A6','A7','A8','A9','A10','A11']},
    {min:51,max:55,values:['A3','A4','A5','A6','A7','A8','A9','A10','A11','A12']},
    {min:56,max:60,values:['A4','A5','A6','A7','A8','A9','A10','A11','A12','A13']},
    {min:61,max:65,values:['A5','A6','A7','A8','A9','A10','A11','A12','A13',null]},
    {min:66,max:70,values:['A6','A7','A8','A9','A10','A11','A12','A13',null,null]}
  ]);

  const GROUPS = Object.freeze({
    Y1:[['Radius',[2000]]],
    Y2:[['Radius',[1800]]],
    Y3:[['Radius',[1500]]],
    Y4:[['Brixxon',[1100]],['Paragon',[1000]],['Performa',[1000]],['Precium',[1000]],['Radius',[1300,1100]]],
    A1:[['Brixxon',[1000]],['Paragon',[1000,900]],['Performa',[1000,900]],['Precium',[1000,900]],['Radius',[1000,900]]],
    A2:[['Brixxon',[900,850]],['Paragon',[900,850]],['Performa',[900,850]],['Precium',[900,850]],['Radius',[850,800]]],
    A3:[['Brixxon',[850,800]],['Paragon',[850,800]],['Performa',[850,800]],['Precium',[850,800]],['Radius',[850,800]]],
    A4:[['Brixxon',[750,700]],['Paragon',[750,700]],['Performa',[750,700]],['Precium',[750,700]],['Radius',[700,650]]],
    A5:[['Brixxon',[700,650]],['Paragon',[700,650]],['Performa',[700,650]],['Precium',[700,650]],['Radius',[650,600]]],
    A6:[['Brixxon',[600,550]],['Edge',[700,600]],['Empros',[500]],['Paragon',[600,550]],['Performa',[600,550]],['Precium',[600,550]],['Radius',[600,550]]],
    A7:[['Brixxon',[550,500]],['Edge',[500]],['Empros',[500,400]],['Maverick',[500]],['Paragon',[550,500]],['Performa',[550,500]],['Precium',[550,500]],['Radius',[550,500]]],
    A8:[['Brixxon',[500]],['Edge',[500,400]],['Empros',[400]],['Maverick',[500,400]],['Paragon',[500,400]],['Performa',[500,400]],['Precium',[500,400]],['Radius',[500,450]]],
    A9:[['Brixxon',[450]],['Edge',[400]],['Empros',[400,350]],['Maverick',[400]],['Paragon',[450,400]],['Performa',[450,400]],['Precium',[450,400]],['Radius',[450,400]]],
    A10:[['Brixxon',[400]],['Edge',[400,350]],['Empros',[350]],['Maverick',[400,350]],['Paragon',[400]],['Performa',[400]],['Precium',[400]],['Radius',[400]]],
    A11:[['Bruxx',[350,300]],['Edge',[350]],['Empros',[350,300]],['Maverick',[350]],['Paragon',[400]],['Performa',[400]],['Precium',[400]]],
    A12:[['Bruxx',[300]],['Edge',[350,300]],['Empros',[300]],['Maverick',[350,300]]],
    A13:[['Bruxx',[300]],['Edge',[300]],['Empros',[300]],['Maverick',[300]]]
  });

  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roundLength = value => { const n=Number(value); return Number.isFinite(n)?Math.floor(n+0.5):null; };

  function selectorResult(drawValue=document.getElementById('drawWeight')?.value,lengthValue=document.getElementById('arrowLength')?.value) {
    const draw=Number(drawValue), length=roundLength(lengthValue);
    if (!Number.isFinite(draw) || !Number.isFinite(length)) return null;
    const col=LENGTHS.indexOf(length); if (col<0) return null;
    const row=ROWS.find(r=>draw>=r.min && draw<=r.max); if (!row) return null;
    const group=row.values[col]; if (!group) return null;
    return {drawWeight:draw,length,group,models:GROUPS[group]||[],source:SOURCE};
  }

  function existingMeta(model) {
    try {
      if (typeof window.getModelMetadata === 'function') return window.getModelMetadata(model) || null;
      if (typeof window.normalizeModelKey === 'function' && typeof window.catalogState !== 'undefined') return window.catalogState?.models?.[window.normalizeModelKey(model)] || null;
    } catch {}
    return null;
  }

  function buildEntries(result) {
    const entries=[];
    result.models.forEach(([model,spines],familyIndex)=>{
      spines.forEach((spine,index)=>entries.push({
        model,
        advisedSpine:String(spine),
        score:100-familyIndex-index/10,
        manufacturerVerified:true,
        manufacturerSource:SOURCE,
        manufacturerChartExact:true,
        skylonChartExact:true,
        skylonGroup:result.group,
        skylonChartChoices:spines.map(String),
        meta:existingMeta(model),
        skylonSelectionBasis:`Tableau Skylon officiel : ${result.drawWeight} lbs, ${result.length}\" cut-to-cut → groupe ${result.group}; ${model} ${spines.join(' / ')}.`
      }));
    });
    return entries;
  }

  function applySelector(rec,input) {
    if (!rec || rec.brand!=='skylon') return rec;
    const result=selectorResult(input?.drawWeight,input?.arrowLength);
    if (!result) {
      rec.models=[];
      rec.confidence='low';
      rec.confidenceReasons=[`Tableau Skylon : aucune case publiée pour ${Number(input?.drawWeight)||'?'} lbs et ${roundLength(input?.arrowLength)||'?'}\". Aucun spine extrapolé.`];
      return rec;
    }
    const entries=buildEntries(result);
    rec.primary=result.group;
    rec.comparisonSpine=null;
    rec.models=entries;
    rec.skylonSelector={version:VERSION,...result,entryCount:entries.length};
    rec.confidenceReasons=[
      `Tableau fabricant Skylon : ${result.drawWeight} lbs, longueur ${result.length}\" cut-to-cut → groupe ${result.group}.`,
      `Les tailles affichées sont celles du groupe ${result.group}. Lorsqu'une famille possède deux tailles, l'app conserve les deux : le tableau fabricant ne désigne pas arbitrairement l'une comme meilleure.`
    ];
    return rec;
  }

  function ensureRecommendationWrapper() {
    const current=window.buildBrandRecommendation;
    if (typeof current!=='function' || current.__skylonChartV56) return false;
    const wrapped=function(input,brand){ return applySelector(current.apply(this,arguments),input); };
    wrapped.__skylonChartV56=true;
    window.buildBrandRecommendation=wrapped;
    return true;
  }

  function renderEntries(rec) {
    return (rec.models||[]).map(entry=>{
      const choices=(entry.skylonChartChoices||[]).join(' / ');
      return `<li data-skylon-chart="1" data-skylon-spine="${esc(entry.advisedSpine)}"><strong>${esc(entry.model)}</strong> - spine conseillé <strong>${esc(entry.advisedSpine)}</strong>${choices?` <span class="result-subvalue">(tableau fabricant, groupe ${esc(entry.skylonGroup)} : ${esc(choices)})</span>`:''}<div class="aa-model-why" style="margin-top:.28rem;line-height:1.35"><strong>Pourquoi ce modèle :</strong> taille explicitement publiée dans le groupe Skylon ${esc(entry.skylonGroup)} pour cette puissance et cette longueur.</div></li>`;
    }).join('');
  }

  function ensureRenderWrapper() {
    const current=window.renderModelList;
    if (typeof current!=='function' || current.__skylonChartV56) return false;
    const wrapped=function(recommendation,input){
      if (recommendation?.brand==='skylon' && recommendation?.skylonSelector) {
        const html=renderEntries(recommendation);
        return html || '<li>Aucune taille Skylon publiée pour cette case du tableau fabricant.</li>';
      }
      return current.apply(this,arguments);
    };
    wrapped.__skylonChartV56=true;
    window.renderModelList=wrapped;
    return true;
  }

  function installUi() {
    const form=document.getElementById('spine-form'), brand=document.getElementById('preferredBrand');
    if (!form || !brand) return;
    if (!document.getElementById('skylonSelectorV55')) {
      const box=document.createElement('fieldset');
      box.id='skylonSelectorV55'; box.hidden=true; box.className='manufacturer-selector skylon-selector';
      box.innerHTML=`<legend>Tableau Skylon — recurve</legend><p id="skylonSelectorResultV55" class="field-hint"></p><small class="field-hint">Source fabricant Skylon Target · Field · 3D. Longueur mesurée cut-to-cut. Aucun spine n'est extrapolé hors tableau.</small>`;
      const anchor=document.getElementById('arrowLength')?.closest('label');
      anchor?.insertAdjacentElement('afterend',box) || form.appendChild(box);
    }
    const update=()=>{
      const box=document.getElementById('skylonSelectorV55'), out=document.getElementById('skylonSelectorResultV55');
      if (!box) return;
      box.hidden=brand.value!=='skylon';
      if (brand.value!=='skylon' || !out) return;
      const r=selectorResult();
      out.innerHTML=r?`<strong>Skylon :</strong> groupe <strong>${esc(r.group)}</strong> · ${r.drawWeight} lbs · ${r.length}\" cut-to-cut`:'Aucune case Skylon publiée pour ces valeurs.';
    };
    if (!brand.dataset.skylonSelectorV55) { brand.dataset.skylonSelectorV55='1'; brand.addEventListener('change',update); }
    ['drawWeight','arrowLength'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.skylonSelectorV55){el.dataset.skylonSelectorV55='1';el.addEventListener('input',update);}});
    update();
  }

  function install(){
    installUi(); ensureRecommendationWrapper(); ensureRenderWrapper();
    [250,800,1800].forEach(ms=>setTimeout(()=>{ensureRecommendationWrapper();ensureRenderWrapper();},ms));
    window.AssistantArcherSkylonSelector=Object.freeze({version:VERSION,source:SOURCE,selectorResult,groups:GROUPS});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
