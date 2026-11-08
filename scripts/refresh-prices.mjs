/* Un HTTP 200 ne certifie ni le stock ni un prix pour une variante donnée. */
import fs from 'node:fs/promises';
const state=JSON.parse(await fs.readFile('deals.json','utf8'));
for(const deal of state.deals){
  deal.priceVerification='unverified';
  deal.availability='unknown';
  deal.lastCheckedAt=new Date().toISOString();
  try{
    const response=await fetch(deal.url,{redirect:'follow',signal:AbortSignal.timeout(12000)});
    deal.pageStatus=response.status;
    deal.checkReason=response.ok?'page-reachable-stock-and-price-not-verified':'http-'+response.status;
    await response.body?.cancel();
  }catch{deal.pageStatus=null;deal.checkReason='page-not-retrieved';}
}
state.updatedAt=new Date().toISOString();
await fs.writeFile('deals.json',JSON.stringify(state,null,2)+'\n');
console.log('Liens contrôlés. Aucun prix ni stock certifié ; valeurs historiques conservées.');
