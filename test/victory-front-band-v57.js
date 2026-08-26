/* Assistant Archer TEST - Victory Recurve front-weight band UI, Pré-alpha v58.
   Source: Victory Recurve Spine Chart. The chart publishes two front-weight bands:
   100–125 gr and 150–175 gr. The detailed point + front insert choice remains in the builder.
*/
(() => {
  'use strict';
  const VERSION='Pré-alpha v58';

  function ensureStyle(){
    if(document.getElementById('victoryFrontDiagramStyleV58')) return;
    const style=document.createElement('style');
    style.id='victoryFrontDiagramStyleV58';
    style.textContent=`
      .victory-front-diagram{margin:.45rem 0 .55rem;padding:.55rem .6rem;border:1px solid #d5deea;border-radius:.55rem;background:#f7f9fc}
      .victory-front-diagram-title{font-size:.78rem;font-weight:800;margin:0 0 .35rem;color:#17365d}
      .victory-front-diagram-row{display:grid;grid-template-columns:auto auto minmax(72px,1fr) auto;align-items:center;gap:.28rem;font-size:.72rem}
      .victory-front-part{display:flex;align-items:center;justify-content:center;min-height:28px;padding:.18rem .32rem;border-radius:.35rem;border:1px solid #b9c8da;background:#fff;text-align:center;line-height:1.1}
      .victory-front-part.is-point{font-weight:800;border-color:#d88a8a;background:#fff4f4}
      .victory-front-part.is-insert{font-weight:800;border-color:#8aa8d8;background:#f1f6ff}
      .victory-front-part.is-shaft{min-width:78px;background:#eef3f8}
      .victory-front-part.is-rear{font-size:.67rem;color:#4d5967;background:#f5f5f5}
      .victory-front-arrow{font-weight:900;color:#4d5967}
      .victory-front-diagram-note{margin:.35rem 0 0;font-size:.7rem;line-height:1.25;color:#4d5967}
      @media(max-width:520px){.victory-front-diagram-row{grid-template-columns:auto auto minmax(54px,1fr) auto;font-size:.66rem;gap:.18rem}.victory-front-part{padding:.15rem .2rem}}
    `;
    document.head.appendChild(style);
  }

  function diagramHtml(){
    return `<div class="victory-front-diagram" data-victory-front-diagram-v58>
      <p class="victory-front-diagram-title">Où se trouve l’insert dont parle Victory ?</p>
      <div class="victory-front-diagram-row" role="img" aria-label="Schéma d’une flèche : pointe puis insert avant puis tube, et à l’arrière pin ou encoche">
        <span class="victory-front-part is-point">Pointe<br><small>AVANT</small></span>
        <span class="victory-front-part is-insert">Insert<br><small>AVANT</small></span>
        <span class="victory-front-part is-shaft">──── TUBE ────</span>
        <span class="victory-front-part is-rear">Pin / encoche<br><small>ARRIÈRE</small></span>
      </div>
      <p class="victory-front-diagram-note"><strong>Poids avant Victory = pointe + insert avant éventuel.</strong> Le pin, bushing ou l’encoche arrière ne fait pas partie du poids avant utilisé par le tableau de spine.</p>
    </div>`;
  }

  function installBandSelector(){
    const wrap=document.getElementById('victorySelectorV48');
    const point=document.getElementById('victoryPointWeightV48');
    const insert=document.getElementById('victoryInsertWeightV48');
    if(!wrap||!point||!insert) return false;

    ensureStyle();

    const pointLabel=point.closest('label');
    const insertLabel=insert.closest('label');
    if(pointLabel) pointLabel.hidden=true;
    if(insertLabel) insertLabel.hidden=true;

    let label=wrap.querySelector('[data-victory-front-band-v57]');
    if(!label){
      label=document.createElement('label');
      label.dataset.victoryFrontBandV57='1';
      label.innerHTML=`Poids avant total (tableau Victory)
        <select id="victoryFrontBandV57">
          <option value="100" selected>100–125 grains devant</option>
          <option value="150">150–175 grains devant</option>
        </select>`;
      const legend=wrap.querySelector('legend');
      legend?.insertAdjacentElement('afterend',label) || wrap.prepend(label);
    }

    if(!wrap.querySelector('[data-victory-front-diagram-v58]')) label.insertAdjacentHTML('afterend',diagramHtml());

    const select=label.querySelector('#victoryFrontBandV57');
    const sync=()=>{
      const representative=Number(select?.value)===150?150:100;
      point.value=String(representative);
      insert.value='0';
      point.dispatchEvent(new Event('change',{bubbles:true}));
    };
    if(select&&!select.dataset.bound){
      select.dataset.bound='1';
      select.addEventListener('change',sync);
    }

    const hint=wrap.querySelector('small.field-hint');
    if(hint) hint.textContent='Victory Recurve Spine Chart : choisissez ici la bande de poids avant total. Le montage réel pointe + insert avant est vérifié ensuite dans le constructeur. Les composants arrière sont exclus de ce poids avant.';

    sync();
    return true;
  }

  function install(){
    if(installBandSelector()) {
      window.AssistantArcherVictoryFrontBand=Object.freeze({version:VERSION,install:installBandSelector});
      return;
    }
    [100,300,700,1400].forEach(ms=>setTimeout(installBandSelector,ms));
    window.AssistantArcherVictoryFrontBand=Object.freeze({version:VERSION,install:installBandSelector});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
