/* Assistant Archer TEST - Victory Recurve front-weight band UI, Pré-alpha v57.
   Source: Victory Recurve Spine Chart. The chart publishes two front-weight bands:
   100–125 gr and 150–175 gr. The detailed point + insert choice remains in the builder.
*/
(() => {
  'use strict';
  const VERSION='Pré-alpha v57';

  function installBandSelector(){
    const wrap=document.getElementById('victorySelectorV48');
    const point=document.getElementById('victoryPointWeightV48');
    const insert=document.getElementById('victoryInsertWeightV48');
    if(!wrap||!point||!insert) return false;

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
    if(hint) hint.textContent='Victory Recurve Spine Chart : le spine dépend de la bande de poids avant total. Le choix réel pointe + insert se fait ensuite dans le constructeur ; aucune valeur hors 100–125 / 150–175 gr n’est extrapolée.';

    sync();
    return true;
  }

  function install(){
    if(installBandSelector()) return;
    [100,300,700,1400].forEach(ms=>setTimeout(installBandSelector,ms));
    window.AssistantArcherVictoryFrontBand=Object.freeze({version:VERSION,install:installBandSelector});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
