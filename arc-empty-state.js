(() => {
  function hasTillerMeasurements(){
    const upper=document.getElementById('upperTiller');
    const lower=document.getElementById('lowerTillerMeasured');
    return Boolean(upper?.value.trim() && lower?.value.trim());
  }

  function resetArcResult(){
    const result=document.getElementById('arcSetupResult');
    if(!result)return;
    result.innerHTML='<h2>Reglage de l\'arc</h2><p>Renseignez vos mesures puis lancez le calcul.</p>';
  }

  function install(){
    const form=document.getElementById('arc-setup-form');
    const upper=document.getElementById('upperTiller');
    const lower=document.getElementById('lowerTillerMeasured');
    if(!form||!upper||!lower||form.dataset.emptyStateGuard)return;
    form.dataset.emptyStateGuard='1';

    if(!hasTillerMeasurements())resetArcResult();

    form.addEventListener('submit',event=>{
      if(hasTillerMeasurements())return;
      event.preventDefault();
      event.stopImmediatePropagation();
      resetArcResult();
    },true);

    [upper,lower].forEach(input=>input.addEventListener('input',()=>{
      if(!hasTillerMeasurements())resetArcResult();
    }));
  }

  setTimeout(install,300);
  setTimeout(install,1500);
})();