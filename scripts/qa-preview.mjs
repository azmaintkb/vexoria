// Isolated browser QA. No sample prices or orders enter the real local store.
import {mkdtemp} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {storage} from '../netlify/lib/storage.mjs';import {drafts} from '../netlify/lib/core.mjs';
process.env.VEXORIA_LOCAL='1';process.env.VEXORIA_DATA_DIR=await mkdtemp(path.join(tmpdir(),'vexoria-browser-qa-'));
const db=await storage();for(const p of drafts)await db.set('products/'+p.id,p.id==='red-cat'?{...p,name:'QA Red Cat Thermal Pot',price:850,stock:10,description:'Sample details for an isolated checkout test. Not a real product listing.',published:true}:p);
console.log('Isolated QA data directory: '+process.env.VEXORIA_DATA_DIR);
await import('./dev.mjs');
