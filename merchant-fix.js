/* Restaure les offres marchands : correspondance exacte en priorite, offres compatibles en secours. */
(() => {
  const originalRenderDeals = window.renderDeals;
  if (typeof originalRenderDeals !== 'function') return;

  function escapeText(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function priceValue(price){
    const match=String(price||'').replace(/\s/g,'').replace(',','.').match(/(\d+(?:\.\d+)?)/);
    return match?Number(match[1]):Number.POSITIVE_INFINITY;
  }

  function compatibleDeals(preferredBrand, shaftMaterial, bowType, shootingProfile, allowedBrands){
    const list=(typeof dealsState!=='undefined' && Array.isArray(dealsState?.deals))?dealsState.deals:[];
    return list.filter(deal=>{
      const brandOk=preferredBrand==='all'||deal.brand===preferredBrand;
      const visibleBrandOk=!allowedBrands||allowedBrands.includes(deal.brand);
      const materialOk=shaftMaterial==='all'||deal.material===shaftMaterial;
      const bowOk=!deal.bowTypes||deal.bowTypes.includes(bowType);
      const outdoorOk=shootingProfile!=='recurve_outdoor'||deal.material==='carbon';
      return brandOk&&visibleBrandOk&&materialOk&&bowOk&&outdoorOk;
    }).sort((a,b)=>priceValue(a.price)-priceValue(b.price));
  }

  window.renderDeals=function(preferredBrand, shaftMaterial, bowType, shootingProfile, allowedBrands=null, recommendedModels=[]){
    const exact=originalRenderDeals(preferredBrand, shaftMaterial, bowType, shootingProfile, allowedBrands, recommendedModels);
    if (exact && !exact.includes('Aucune offre marchande') && !exact.includes('Aucune offre correspondant')) return exact;

    const fallback=compatibleDeals(preferredBrand, shaftMaterial, bowType, shootingProfile, allowedBrands).slice(0,8);
    if(!fallback.length) return exact;

    const groups=fallback.reduce((acc,deal)=>{(acc[deal.shop]??=[]).push(deal);return acc;},{});
    const content=Object.entries(groups).map(([shop,deals])=>`<li class="merchant-shop"><p class="merchant-shop-name">${escapeText(shop)}</p><ul class="merchant-deals">${deals.map(deal=>`<li><a href="${escapeText(deal.url)}" target="_blank" rel="noopener noreferrer">${escapeText(deal.title)}</a> - ${escapeText(deal.price)}</li>`).join('')}</ul></li>`).join('');
    return `<section class="merchant-block"><p class="merchant-intro">Aucune offre exacte pour le modele conseille. Voici des offres compatibles avec la marque, la matiere et le type d arc :</p><ul class="merchant-shops">${content}</ul></section>`;
  };
})();