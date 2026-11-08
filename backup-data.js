(() => {
  'use strict';
  const keys=['archerNotebook','sightNotebook'];
  const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
  function records(value,key) {
    if(value==null)return [];
    if(!Array.isArray(value)||value.length>50)throw Error('Chaque carnet doit contenir au maximum 50 fiches.');
    return value.map(item=>{
      if(!plain(item))throw Error('Fiche invalide.');
      const next={};
      for(const [name,v]of Object.entries(item)) {
        if(['__proto__','constructor','prototype'].includes(name))throw Error('Champ de sauvegarde invalide.');
        if(key==='sightNotebook'&&name==='marks'){
          if(!plain(v)||Object.keys(v).length>120)throw Error('Repères invalides.');
          const marks={};
          for(const [distance,mark]of Object.entries(v)){
            if(!/^\d+$/.test(distance)||Number(distance)<1||Number(distance)>120||typeof mark!=='string'||mark.length>100)throw Error('Distance ou repère invalide.');
            marks[distance]=mark;
          }
          next.marks=marks;
        }else{
          if(typeof v!=='string'||v.length>10000)throw Error('Une fiche contient un champ illisible ou trop long.');
          next[name]=v;
        }
      }
      if(key==='sightNotebook'&&!next.marks)next.marks={};
      return next;
    });
  }
  function parse(text) {
    if(text.length>2000000)throw Error('Fichier trop volumineux (2 Mo maximum).');
    let payload;try{payload=JSON.parse(text);}catch{throw Error('Ce fichier n’est pas un JSON lisible.');}
    if(payload?.schema!=='assistant-archer-backup-v1'||!plain(payload.data))throw Error('Format de sauvegarde Assistant Archer non reconnu.');
    return Object.fromEntries(keys.map(key=>[key,records(payload.data[key],key)]));
  }
  function signature(record){return JSON.stringify(Object.fromEntries(Object.entries(record).filter(([k])=>!['id','updatedAt'].includes(k)).sort(([a],[b])=>a.localeCompare(b))));}
  function merge(existing,incoming,key) {
    const result=records(existing,key),items=records(incoming,key),seen=new Set(result.map(signature)),ids=new Set(result.map(r=>r.id));
    let added=0;
    for(const item of items){
      if(seen.has(signature(item)))continue;
      let id=item.id||'import-'+(result.length+1);let suffix=1;
      while(ids.has(id))id=(item.id||'import')+'-copie-'+suffix++;
      const record={...item,id};result.push(record);ids.add(id);seen.add(signature(item));added++;
    }
    if(result.length>50)throw Error('La fusion dépasserait 50 fiches. Aucune fiche n’a été importée.');
    return {records:result,added};
  }
  const api=Object.freeze({parse,merge});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.AssistantArcherBackup=api;
})();
