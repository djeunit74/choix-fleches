/* Conseil de pointe compact : plage du modele, base de depart, puis affinage au tir. */
(() => {
  function enhancePointAdvice(){
    const result=document.getElementById('result');
    if(!result)return;
    const paragraphs=[...result.querySelectorAll('p')];
    const point=paragraphs.find(p=>p.textContent.trim().startsWith('Pointe conseillee'));
    if(!point||point.dataset.pointGuidance==='1')return;
    const match=point.textContent.match(/Pointe conseillee\s*:\s*(\d+)\s*gr.*?(\d+)\s*-\s*(\d+)\s*gr/i);
    if(!match)return;
    const recommended=Number(match[1]),min=Number(match[2]),max=Number(match[3]);
    point.dataset.pointGuidance='1';
    point.innerHTML=`<strong>Pointe conseillee</strong> : ${recommended} gr <span class="result-subvalue">(plage fabricant ${min}-${max} gr)</span>`;
    const quick=paragraphs.find(p=>p.textContent.trim().startsWith('Ajustement rapide'));
    if(quick){
      quick.innerHTML='<strong>Affinage au tir</strong> : une pointe plus lourde assouplit dynamiquement la fleche ; une pointe plus legere la raidit. Restez dans la plage compatible du tube.';
    }
  }
  const result=document.getElementById('result');
  if(result)new MutationObserver(enhancePointAdvice).observe(result,{childList:true,subtree:true});
  enhancePointAdvice();
})();