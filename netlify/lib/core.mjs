import {randomBytes, scryptSync, timingSafeEqual, createHmac, randomUUID, createHash} from 'node:crypto';
import {deliveryForAddress,deliveryFor} from '../../public/delivery.js';
export function passwordHash(password,salt=randomBytes(16).toString('hex')) {return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function passwordMatches(password,hash='') {try {const [salt,key]=hash.split(':'); const a=Buffer.from(key,'hex'),b=scryptSync(password,salt,64); return a.length===b.length && timingSafeEqual(a,b);}catch{return false;}}
export function signSession(secret) {const payload=Buffer.from(JSON.stringify({expires:Date.now()+8*3600000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
export function validSession(token='',secret) {try {if(!secret)return false;const [payload,sig]=token.split('.');const expected=createHmac('sha256',secret).update(payload).digest(); const supplied=Buffer.from(sig,'base64url');return expected.length===supplied.length&&timingSafeEqual(expected,supplied)&&JSON.parse(Buffer.from(payload,'base64url')).expires>Date.now();}catch{return false;}}
export const clean=(value,max=200)=>typeof value==='string'?value.trim().slice(0,max):'';
export function productInput(body) {
 const p={id:body.id||randomUUID(),name:clean(body.name,100),category:clean(body.category,60)||'Thermal pots',description:clean(body.description,3000),capacity:clean(body.capacity,50),material:clean(body.material,100),price:Number(body.price),originalPrice:body.originalPrice==null||body.originalPrice===''?null:Number(body.originalPrice),stock:Number(body.stock),image:clean(body.image,500),published:body.published===true};
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(p.id)||!p.name||!Number.isSafeInteger(p.price)||p.price<0||!Number.isSafeInteger(p.stock)||p.stock<0||p.stock>100000||!/^\/(assets\/|api\/images\/)[a-zA-Z0-9_.-]+$/.test(p.image))throw new Error('Enter a name, valid photo, whole-number price, and stock quantity.');
 if(p.originalPrice!==null&&(!Number.isSafeInteger(p.originalPrice)||p.originalPrice<=p.price))throw new Error('Original price must be a whole number higher than the discounted price, or leave it blank.');
 if(p.published&&(p.price<1||!p.description))throw new Error('Add a price and description before publishing.');
 return p;
}
export function orderInput(body,products) {
 const delivery=body.deliveryOption?deliveryFor(body.deliveryOption):deliveryForAddress(body);
 const customer={name:clean(body.name,100),phone:clean(body.phone,20).replace(/[\s-]/g,''),address:clean(body.address,500),district:delivery.districtName||'',thana:delivery.thanaName||'',postcode:clean(body.postcode,10),campus:delivery.address?delivery.id:'',notes:clean(body.notes,500)};
 if(clean(body.address,500).length<8)throw new Error('Enter your full delivery address.');
 if(delivery.address&&!customer.address.includes(delivery.address))customer.address=delivery.address+' — '+customer.address;
 if(customer.postcode&&!/^[0-9]{4}$/.test(customer.postcode))throw new Error('Enter a valid four-digit postcode.');
 if(!customer.name||! /^(?:\+?88)?01[3-9]\d{8}$/.test(customer.phone)||customer.address.length<8||body.policyAccepted!==true)throw new Error('Enter your name, valid Bangladesh mobile number, full address, and accept the order policy.');
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>30)throw new Error('Your bag is empty or contains too many items.');
 const seen=new Set();const items=body.items.map(item=>{const p=products.find(p=>p.id===item.id&&p.published);const q=Number(item.quantity);if(!p||seen.has(p.id)||!Number.isInteger(q)||q<1||q>20||q>p.stock)throw new Error('An item is unavailable or the quantity exceeds current stock. Please refresh your bag.');seen.add(p.id);return {id:p.id,name:p.name,quantity:q,price:p.price,image:p.image};});
 const subtotal=items.reduce((n,p)=>n+p.price*p.quantity,0);if(!Number.isSafeInteger(subtotal)||subtotal>1000000)throw new Error('Order total exceeds the supported amount.');
 return {customer,items,subtotal,delivery:delivery.fee,deliveryZone:delivery.id,deliveryLocation:delivery.label,total:subtotal+delivery.fee,payment:'Cash on delivery',status:'New',createdAt:new Date().toISOString(),read:false,emailStatus:'pending'};
}
export const defaults={whatsapp:'8801630662672',messenger:'',storeEmail:'vexoriaofficial@gmail.com'};
const initialStock={'pink-bear':35,'red-cat':30,'brown-dessert':25,'blue-puppy':15};
export const drafts=[['red-cat','Red Cat','red-cat'],['pink-bear','Pink Bear','pink-bear'],['blue-puppy','Blue Puppy','blue-puppy'],['brown-dessert','Brown Dessert','brown-dessert']].map(([id,name,img])=>({id,name:`${name} Thermal Pot`,category:'Thermal pots',description:'',capacity:'',material:'',price:0,stock:initialStock[id],image:`/assets/${img}.jpg`,published:false}));
export const orderKey = key => createHash('sha256').update(key).digest('hex').slice(0,32);

