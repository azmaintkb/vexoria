export async function storage() {
 if(process.env.VEXORIA_LOCAL==='1') {
  const fs=await import('node:fs/promises');const path=await import('node:path');const root=path.resolve(process.env.VEXORIA_DATA_DIR||'.local-data');await fs.mkdir(root,{recursive:true});
  const file=key=>path.join(root,encodeURIComponent(key)+'.json');
  return {get:async key=>{try{return JSON.parse(await fs.readFile(file(key),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}},set:async(key,value)=>fs.writeFile(file(key),JSON.stringify(value)),create:async(key,value)=>{try{await fs.writeFile(file(key),JSON.stringify(value),{flag:'wx'});return true;}catch(e){if(e.code==='EEXIST')return false;throw e;}},list:async prefix=>(await fs.readdir(root)).map(x=>decodeURIComponent(x.replace(/\.json$/,''))).filter(x=>x.startsWith(prefix))};
 }
 const {getStore}=await import('@netlify/blobs');const store=getStore({name:'vexoria-store',consistency:'strong'});
 return {get:key=>store.get(key,{type:'json'}),set:(key,value)=>store.setJSON(key,value),create:async(key,value)=>(await store.setJSON(key,value,{onlyIfNew:true})).modified,list:async prefix=>{const {blobs}=await store.list({prefix});return blobs.map(x=>x.key);}};
}
