import test from 'node:test';
import assert from 'node:assert/strict';
import {productInput,orderInput,drafts} from '../netlify/lib/core.mjs';
import {priceMarkup} from '../public/cart.js';
const p={...drafts[0],price:549,stock:35,published:true,description:'Thermal pot'};
test('optional original price persists and must exceed selling price',()=>{assert.equal(productInput({...p,originalPrice:799}).originalPrice,799);assert.equal(productInput({...p,originalPrice:''}).originalPrice,null);assert.equal(productInput(p).originalPrice,null);for(const originalPrice of [549,500,-1,799.5,'invalid'])assert.throws(()=>productInput({...p,originalPrice}),/Original price/);});
test('sale markup shows current price before crossed-out original',()=>{const html=priceMarkup({...p,originalPrice:799});assert.match(html,/Tk 549.*<del.*Tk 799/);assert.doesNotMatch(priceMarkup(p),/<del/);assert.doesNotMatch(priceMarkup({...p,originalPrice:500}),/<del/);});
const body={name:'Test Customer',phone:'01600000000',address:'House 1, road 2, Gulshan, Dhaka',policyAccepted:true,items:[{id:p.id,quantity:2}]};
test('simple checkout uses server prices and selected delivery rate',()=>{for(const [deliveryOption,fee]of [['inside-dhaka',70],['outside-dhaka',130],['nsu',0],['aiub',0],['iub',0]]){const o=orderInput({...body,deliveryOption,delivery:0,total:1},[{...p,originalPrice:799}]);assert.equal(o.total,1098+fee);assert.equal(o.items[0].price,549);assert.equal(o.delivery,fee);}assert.throws(()=>orderInput({...body,deliveryOption:'fake'},[p]),/delivery location/);assert.throws(()=>orderInput({...body,address:'',deliveryOption:'nsu'},[p]),/full delivery address/);});
