import test from 'node:test';
import assert from 'node:assert/strict';
import {orderInput,drafts} from '../netlify/lib/core.mjs';
import {deliveryFor,deliveryForAddress} from '../public/delivery.js';
const product={...drafts[0],published:true,price:549,stock:30};
const base={name:'Test Customer',phone:'01600000000',address:'Test house, test road, Bangladesh',policyAccepted:true,items:[{id:product.id,quantity:1}],district:'dhaka',thana:'gulshan',delivery:0,total:1};
for(const [zone,fee,total] of [['nsu',0,549],['aiub',0,549],['iub',0,549],['inside-dhaka',70,619],['outside-dhaka',130,679]]){
 test(`server calculates ${zone} delivery as Tk ${fee}`,()=>{const campus=['nsu','aiub','iub'].includes(zone)?zone:'';const thana=campus?(campus==='aiub'?'khilkhet':'vatara'):(zone==='outside-dhaka'?'savar':'gulshan');const order=orderInput({...base,thana,campus,deliveryZone:zone},[product]);assert.equal(order.delivery,fee);assert.equal(order.total,total);assert.equal(order.deliveryZone,zone);assert.equal(order.deliveryLocation,deliveryFor(zone).label);});
}
test('server rejects unknown or missing delivery options',()=>{assert.throws(()=>orderInput({...base,district:'fake'},[product]),/district and thana/);assert.throws(()=>orderInput({...base,thana:''},[product]),/district and thana/);});
test('multiple-item totals include a single delivery charge',()=>{const order=orderInput({...base,thana:'savar',deliveryZone:'outside-dhaka',items:[{id:product.id,quantity:3}]},[product]);assert.equal(order.subtotal,1647);assert.equal(order.total,1777);});

test('server ignores a tampered delivery zone and client fee',()=>{
 const o=orderInput({...base,district:'chattogram',thana:'anwara',deliveryZone:'nsu',delivery:0},[product]);assert.equal(o.delivery,130);assert.equal(o.customer.district,'Chattogram');assert.equal(o.customer.thana,'Anwara');
});
test('campus discount requires matching district and thana',()=>{
 assert.throws(()=>deliveryForAddress({district:'chattogram',thana:'anwara',campus:'nsu'}),/university/);
 assert.throws(()=>deliveryForAddress({district:'dhaka',thana:'gulshan',campus:'nsu'}),/university/);
 assert.throws(()=>deliveryForAddress({...base,campus:'fake'}),/university/);
});
test('Dhaka surrounding upazilas use the outside-city rate',()=>{
 for(const thana of ['savar','ashulia','dhamrai','dohar','keraniganj','nawabganj'])assert.equal(deliveryForAddress({district:'dhaka',thana}).fee,130);
 for(const thana of ['vatara','khilkhet','gulshan','banani'])assert.equal(deliveryForAddress({district:'dhaka',thana}).fee,70);
});
test('campus orders retain canonical address and postcode validation',()=>{
 const o=orderInput({...base,thana:'vatara',campus:'nsu',address:'Meeting point: gate 1',postcode:'1229'},[product]);assert.match(o.customer.address,/North South University/);assert.match(o.customer.address,/gate 1/);assert.equal(o.customer.postcode,'1229');assert.throws(()=>orderInput({...base,postcode:'12'},[product]),/postcode/);
});
