import {emailOrder} from '../lib/email.mjs';
import {randomUUID} from 'node:crypto';
import {storage} from '../lib/storage.mjs';
import {passwordMatches,signSession,validSession,clean,productInput,orderInput,defaults,drafts,orderKey} from '../lib/core.mjs';
const response=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
export default async function handler(request,context={}) {
 try {
 const url=new URL(request.url);const path=url.pathname.replace(/^\/(?:\.netlify\/functions\/api|api)/,'')||'/';const method=request.method;
 if(method==='OPTIONS')return response({},405);
 if(method!=='GET'&&request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return response({error:'Invalid origin.'},403);
 const db=await storage();const secret=process.env.SESSION_SECRET;const token=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('vexoria_session='))?.slice(16);
 const authenticated=validSession(token,secret);
 const body=async()=>{const text=await request.text();if(Buffer.byteLength(text)>4_000_000)throw new Error('Upload must be smaller than 3 MB.');try{return JSON.parse(text);}catch{throw new Error('Invalid request.');}};
 const products=async()=>{const keys=await db.list('products/');return keys.length?Promise.all(keys.map(k=>db.get(k))):drafts;};
 if(path==='/catalog'&&method==='GET'){const [allProducts,storedSettings]=await Promise.all([products(),db.get('settings')]);return response({products:allProducts.filter(p=>p.published),settings:{...defaults,...storedSettings},previewImages:allProducts.map(p=>({id:p.id,name:p.name,image:p.image,stock:p.stock,price:p.price,originalPrice:p.originalPrice??null,description:p.description,published:false}))},200,{'Cache-Control':'public, max-age=0, must-revalidate','Netlify-CDN-Cache-Control':'public, s-maxage=20, stale-while-revalidate=40'});}
 if(path.startsWith('/images/')&&method==='GET'){const image=await db.get('images/'+path.split('/').pop());if(!image)return response({error:'Not found'},404);return new Response(Buffer.from(image.data,'base64'),{headers:{'Content-Type':image.type,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});}
 if(path==='/login'&&method==='POST') {
  if(!secret||!process.env.ADMIN_PASSWORD_HASH)return response({error:'Admin access needs configuration. See the setup guide.'},503);
  const ip=clean(context.ip||request.headers.get('x-nf-client-connection-ip')||'local',100);const rateKey='login/'+orderKey(ip);const rate=await db.get(rateKey);if(rate&&rate.until>Date.now()&&rate.count>=8)return response({error:'Too many attempts. Try again in 15 minutes.'},429);
  const b=await body();if(!passwordMatches(clean(b.password,500),process.env.ADMIN_PASSWORD_HASH)){await db.set(rateKey,{count:rate?.until>Date.now()?rate.count+1:1,until:rate?.until>Date.now()?rate.until:Date.now()+900000});return response({error:'Incorrect password.'},401);}
  await db.set(rateKey,{count:0,until:0});return response({ok:true},200,{'Set-Cookie':`vexoria_session=${signSession(secret)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.VEXORIA_LOCAL==='1'?'':'; Secure'}`});
 }
 if(path==='/logout'&&method==='POST')return response({ok:true},200,{'Set-Cookie':'vexoria_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
 if(path==='/orders'&&method==='POST'){
  const b=await body();if(!/^[a-f0-9-]{36}$/.test(b.requestId||''))throw new Error('Please refresh checkout and try again.');
  const order=orderInput(b,await products());const id=orderKey(b.requestId);order.id=id;order.reference='VX-'+id.slice(0,8).toUpperCase();
  const ip=clean(context.ip||request.headers.get('x-nf-client-connection-ip')||'local');const key='checkout/'+orderKey(ip);const rate=await db.get(key);if(rate?.until>Date.now()&&rate.count>=15)return response({error:'Too many orders. Please try again later.'},429);
  const created=await db.create('orders/'+id,order);if(created){await db.set(key,{count:rate?.until>Date.now()?rate.count+1:1,until:rate?.until>Date.now()?rate.until:Date.now()+3600000});if(typeof context.waitUntil==='function')context.waitUntil(emailOrder(order,db));else await emailOrder(order,db);}const saved=created?order:await db.get('orders/'+id);return response({reference:saved.reference,total:saved.total},201);
 }
 if(path.startsWith('/admin')){
  if(!authenticated)return response({error:'Please sign in.'},401);
  if(path==='/admin'&&method==='GET'){const keys=await db.list('orders/');return response({products:await products(),orders:(await Promise.all(keys.map(k=>db.get(k)))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),settings:{...defaults,...await db.get('settings')},emailConfigured:!!(process.env.ADMIN_EMAIL&&process.env.RESEND_API_KEY&&process.env.EMAIL_FROM)});}
  if(path==='/admin/products'&&method==='POST'){const p=productInput(await body());const existing=await products();for(const d of existing)if(drafts.some(x=>x.id===d.id)&&!await db.get('products/'+d.id))await db.set('products/'+d.id,d);await db.set('products/'+p.id,p);return response({product:p});}
  if(path==='/admin/images'&&method==='POST'){const b=await body();if(!['image/jpeg','image/png','image/webp'].includes(b.type)||typeof b.data!=='string'||b.data.length>3_800_000)throw new Error('Upload a JPG, PNG, or WebP under 2.8 MB.');const bytes=Buffer.from(b.data,'base64');const valid=b.type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):b.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(!valid)throw new Error('The file does not match its image type.');const id=randomUUID();await db.set('images/'+id,{type:b.type,data:b.data});return response({image:'/api/images/'+id});}
  if(path==='/admin/orders'&&method==='POST'){const b=await body();if(!/^[a-f0-9]{32}$/.test(b.id))throw new Error('Invalid order.');const order=await db.get('orders/'+b.id);if(!order)return response({error:'Order not found.'},404);if(b.retryEmail){await emailOrder(order,db);return response({ok:true});}if(b.status){if(!['New','Confirmed','Packed','Shipped','Delivered','Cancelled'].includes(b.status))throw new Error('Invalid status.');order.status=b.status;}if(typeof b.read==='boolean')order.read=b.read;await db.set('orders/'+b.id,order);return response({ok:true});}
  if(path==='/admin/settings'&&method==='POST'){const b=await body();const s={whatsapp:clean(b.whatsapp,20).replace(/[^\d]/g,''),messenger:clean(b.messenger,200),storeEmail:clean(b.storeEmail,150)};if(s.whatsapp&&!/^8801[3-9]\d{8}$/.test(s.whatsapp))throw new Error('Use a Bangladesh WhatsApp number starting with 880.');if(s.messenger&&!/^https:\/\/(m\.me|www\.facebook\.com|facebook\.com)\/[\w.\/-]+$/.test(s.messenger))throw new Error('Use a valid Messenger or Facebook page URL.');if(s.storeEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.storeEmail))throw new Error('Enter a valid contact email.');await db.set('settings',s);return response({ok:true});}
 }
 return response({error:'Not found.'},404);
 }catch(error){console.error('Vexoria API:',error.message);return response({error:/blob|token|store|fetch|ENOENT/i.test(error.message)?'The store is temporarily unavailable. Please try again shortly.':error.message},400);}
}

