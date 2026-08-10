/* Mini tutoriel Assistant Archer - autonome, relancable depuis Parametres. */
(() => {
  const KEY='assistant-archer-onboarding-v1';
  const CSS=`.aa-onboarding{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:end center;padding:16px}.aa-onboarding-backdrop{position:absolute;inset:0;background:rgba(5,15,28,.72);backdrop-filter:blur(3px)}.aa-onboarding-card{position:relative;width:min(520px,100%);padding:22px;border:1px solid rgba(255,255,255,.16);border-radius:22px;background:linear-gradient(160deg,#0d1b2b,#102b4e);color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.4)}.aa-onboarding-card h2{margin:12px 36px 8px 0;color:#fff;font-size:1.35rem}.aa-tutorial-text{margin:0 0 20px;line-height:1.5;color:#e8eef7}.aa-tutorial-close{position:absolute;right:12px;top:10px;width:38px;min-height:38px;padding:0;border:0;background:transparent;color:#fff;font-size:1.8rem}.aa-tutorial-progress{display:flex;gap:6px}.aa-tutorial-progress span{height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.2)}.aa-tutorial-progress span.is-active{background:#2585e6}.aa-tutorial-actions{display:flex;gap:10px;justify-content:flex-end}.aa-tutorial-actions button{min-width:110px}.aa-tutorial-next{background:#1976d2!important;border-color:#1976d2!important;color:#fff!important}.aa-tutorial-back{background:transparent!important;border-color:rgba(255,255,255,.35)!important;color:#fff!important}@media(min-width:700px){.aa-onboarding{place-items:center}.aa-onboarding-card{padding:28px}}`;
  if(!document.getElementById('aaOnboardingStyle')){const s=document.createElement('style');s.id='aaOnboardingStyle';s.textContent=CSS;document.head.appendChild(s)}
  const steps=[
    {title:'Bienvenue dans Assistant Archer',text:'L’app vous accompagne du choix des flèches jusqu’au réglage au tir. Commencez par choisir votre type d’arc dans les paramètres.',tab:null},
    {title:'1. Flèches',text:'Saisissez votre puissance réellement tirée et la longueur de flèche. L’app compare les tableaux fabricants pour proposer une base cohérente.',tab:'spine'},
    {title:'2. Réglage de base',text:'Réglez d’abord band, tiller, détalonnage, centrage et berger. Les paramètres complets restent disponibles pour classique et barebow.',tab:'arc-setup'},
    {title:'3. Réglage dynamique',text:'Une fois la base correcte, suivez le test fût nu étape par étape. Une seule correction à la fois, puis vous recommencez le test.',tab:'dynamic'},
    {title:'4. Mes réglages et repères',text:'Enregistrez votre configuration complète et vos repères. En classique : viseur. En barebow : crawls et stringwalking.',tab:'notebook'}
  ];
  let index=0;
  function selectTab(tab){if(!tab)return;document.querySelector(`.tab-button[data-tab="${tab}"]`)?.click()}
  function closeTutorial(){document.getElementById('aaOnboarding')?.remove();localStorage.setItem(KEY,'done')}
  function render(){
    document.querySelector('.app-settings[open]')?.removeAttribute('open');
    let modal=document.getElementById('aaOnboarding');
    if(!modal){modal=document.createElement('div');modal.id='aaOnboarding';modal.className='aa-onboarding';modal.innerHTML='<div class="aa-onboarding-backdrop"></div><section class="aa-onboarding-card" role="dialog" aria-modal="true" aria-labelledby="aaTutorialTitle"><button class="aa-tutorial-close" type="button" aria-label="Fermer">×</button><div class="aa-tutorial-progress"></div><h2 id="aaTutorialTitle"></h2><p class="aa-tutorial-text"></p><div class="aa-tutorial-actions"><button type="button" class="secondary aa-tutorial-back">Retour</button><button type="button" class="aa-tutorial-next">Suivant</button></div></section>';document.body.appendChild(modal);modal.querySelector('.aa-tutorial-close').onclick=closeTutorial;modal.querySelector('.aa-onboarding-backdrop').onclick=closeTutorial;modal.querySelector('.aa-tutorial-back').onclick=()=>{if(index>0){index--;render()}};modal.querySelector('.aa-tutorial-next').onclick=()=>{if(index===steps.length-1)closeTutorial();else{index++;render()}}}
    const step=steps[index];selectTab(step.tab);modal.querySelector('#aaTutorialTitle').textContent=step.title;modal.querySelector('.aa-tutorial-text').textContent=step.text;modal.querySelector('.aa-tutorial-progress').innerHTML=steps.map((_,i)=>`<span class="${i===index?'is-active':''}"></span>`).join('');modal.querySelector('.aa-tutorial-back').hidden=index===0;modal.querySelector('.aa-tutorial-next').textContent=index===steps.length-1?'Commencer':'Suivant';
  }
  function start(){index=0;render()}
  function bindButton(){const body=document.querySelector('.app-settings-body');if(!body)return false;let b=document.getElementById('restartTutorialBtn');if(!b){b=document.createElement('button');b.type='button';b.id='restartTutorialBtn';b.className='secondary';b.textContent='Revoir le mini tutoriel';b.style.marginTop='.7rem';body.appendChild(b)}b.onclick=(e)=>{e.preventDefault();e.stopPropagation();start()};return true}
  window.startAssistantArcherTutorial=start;
  let tries=0;const timer=setInterval(()=>{tries++;if(bindButton()||tries>20)clearInterval(timer)},200);
  setTimeout(()=>{bindButton();if(!localStorage.getItem(KEY))start()},700);
})();