import {money,esc,readCart,saveCart,api,trashIcon,priceMarkup} from './cart.js';
import {deliveryOptions,deliveryFor} from './delivery.js';
const $=selector=>document.querySelector(selector);
let bag=readCart(),products=[],zone='',requestId=crypto.randomUUID(),submitting=false;
let savedHomeAddress='';
function currentDelivery(){try{return deliveryFor(zone);}catch{return null;}}
function changeDelivery(event){
 const address=$('#checkout-form').elements.address,wasCampus=Boolean(currentDelivery()?.address);
 const selected=deliveryFor(event.target.value);
 if(selected.address){if(!wasCampus)savedHomeAddress=address.value;address.value=selected.address;}
 else if(wasCampus)address.value=savedHomeAddress;
 zone=selected.id;requestId=crypto.randomUUID();renderSummary();
}
function product(id){return products.find(p=>p.id===id);}
function updateCheckoutTheme(){
 const designs=[...new Set(bag.map(item=>item.id))];
 const theme=designs.length===1&&['red-cat','pink-bear','blue-puppy','brown-dessert'].includes(designs[0])?designs[0]:'default';
 $('#checkout-main').dataset.pot=theme;
}
function ready(){return bag.length>0&&bag.every(i=>{const p=product(i.id);return p?.published&&p.price>0&&p.stock>=i.quantity;});}
function renderSummary(){updateCheckoutTheme();const count=bag.reduce((n,i)=>n+i.quantity,0);$('#summary-count').textContent=count+' '+(count===1?'item':'items');const subtotal=bag.reduce((sum,i)=>sum+(product(i.id)?.price||0)*i.quantity,0);const priced=bag.every(i=>product(i.id)?.price>0);const delivery=currentDelivery();$('#summary-items').innerHTML=bag.map(i=>{const p=product(i.id);return `<div class="checkout-item">${p?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:'<span>Unavailable</span>'}<div><h3>${esc(p?.name||'Product unavailable')}</h3><p class="item-unit-price">${priceMarkup(p)}</p><div class="quantity-control"><button type="button" data-quantity="-1" data-id="${esc(i.id)}" aria-label="Decrease ${esc(p?.name||'product')} quantity">−</button><span>${i.quantity}</span><button type="button" data-quantity="1" data-id="${esc(i.id)}" aria-label="Increase ${esc(p?.name||'product')} quantity">+</button><button type="button" class="remove delete-item" data-remove="${esc(i.id)}" aria-label="Remove ${esc(p?.name||'product')} from cart" title="Remove from cart">${trashIcon}</button></div></div><span>${p?.price>0?money(p.price*i.quantity):'Price pending'}</span></div>`;}).join('');$('#summary-totals').innerHTML=`<div class="totals"><div><span>Subtotal</span><span>${priced?money(subtotal):'Price pending'}</span></div><div><span>Delivery</span><span id="delivery-price" class="${delivery?.fee===0?'delivery-free':''}">${delivery?delivery.fee===0?'FREE':money(delivery.fee):'Choose your location'}</span></div><div><span>Pay on delivery</span><strong id="order-total">${priced&&delivery?money(subtotal+delivery.fee):'—'}</strong></div></div>`;$('#availability-note').textContent=ready()?'':'Some items are unpublished, unpriced, or unavailable. Please update your cart before placing an order.';$('#confirm-order').disabled=!ready()||!zone||submitting;}
function empty(){updateCheckoutTheme();$('#checkout-content').innerHTML='<div class="checkout-empty"><h2>Your cart is waiting for a favourite.</h2><p>Choose a pot from the collection to get started.</p><a class="button" href="/#collection">Explore the collection</a></div>';}
function render(){
 if(!bag.length)return empty();
 $('#checkout-content').innerHTML=`<form id="checkout-form" class="checkout-layout">
 <section class="checkout-card customer-card" aria-labelledby="customer-heading">
 <div class="card-heading"><span class="section-number">01</span><div><h2 id="customer-heading">Your details</h2><p>Where should your little joy arrive?</p></div></div>
 <label class="field">Full name <span class="required-mark">*</span><input name="name" required maxlength="100" autocomplete="name" placeholder="Your full name"></label>
 <label class="field">Phone number <span class="required-mark">*</span><input name="phone" type="tel" required maxlength="20" autocomplete="tel" placeholder="01XXXXXXXXX" pattern="(?:\\+?88)?01[3-9][0-9]{8}" aria-describedby="phone-hint"></label>
 <p class="field-hint" id="phone-hint">We’ll call this number to confirm your delivery.</p>
 <label class="field">Full delivery address <span class="required-mark">*</span><textarea name="address" required minlength="8" maxlength="500" autocomplete="street-address" placeholder="House / road, area, thana and district" aria-describedby="address-hint"></textarea></label>
 <p class="field-hint" id="address-hint">Include your area, thana and district so we can find you.</p>
 <div class="details-footnote"><span aria-hidden="true">♡</span> No account needed. Just the essentials.</div>
 </section>
 <section class="checkout-card delivery-card compact-delivery" aria-labelledby="delivery-heading"><div class="card-heading"><span class="section-number">02</span><div><h2 id="delivery-heading">Delivery option</h2><p>Cash on delivery · Up to 48 hours</p></div></div><label class="field">Choose delivery <span class="required-mark">*</span><select name="deliveryOption" id="delivery-option" required><option value="">Choose your delivery option</option>${deliveryOptions.map(o=>`<option value="${o.id}">${esc(o.label)} — ${o.fee===0?'FREE':money(o.fee)}</option>`).join('')}</select></label></section>
 <aside class="order-summary checkout-card" aria-labelledby="summary-heading">
 <div class="summary-heading"><div><p class="eyebrow">YOUR LITTLE FAVOURITES</p><h2 id="summary-heading">Your order</h2></div><span id="summary-count" class="item-count"></span></div>
 <div id="summary-items"></div><a class="summary-shop-link" href="/#collection">Add something lovely </a>
 <div id="summary-totals" aria-live="polite"></div>
 <div class="summary-payment-note"><span aria-hidden="true">✓</span><span>Nothing to pay now. Cash on delivery.</span></div>
 <p class="form-error" id="availability-note" role="status"></p>
 <label class="check"><input type="checkbox" name="policyAccepted" required><span>I agree to pay the displayed total on delivery and understand that returns are not accepted.</span></label>
 <p class="form-error" id="checkout-error" role="alert"></p>
 <button class="button full" type="submit" id="confirm-order" disabled>Confirm order </button>
 <p class="fine-print summary-privacy">Your details are used only to process your order. <button class="plain" type="button" id="privacy-open"><u>Privacy policy</u></button></p>
 </aside></form>`;
 renderSummary();$('#delivery-option').addEventListener('change',changeDelivery);$('#checkout-form').addEventListener('submit',placeOrder);
}
async function placeOrder(e){e.preventDefault();if(submitting||!ready()||!zone)return;submitting=true;renderSummary();$('#checkout-error').textContent='';$('#confirm-order').textContent='Placing your order…';try{const form=Object.fromEntries(new FormData(e.target));const d=await api('orders',{...form,deliveryZone:zone,policyAccepted:form.policyAccepted==='on',items:bag,requestId});bag=[];saveCart(bag);$('#checkout-content').innerHTML=`<div class="checkout-success"><div class="success-icon">✓</div><p class="eyebrow">THANK YOU FOR CHOOSING VEXORIA</p><h2>A little joy is on its way.</h2><p>Your order reference is <strong>${esc(d.reference)}</strong>.</p><p>Pay <strong>${money(d.total)}</strong> in cash on delivery.</p><p class="fine-print">Delivery takes up to 48 hours. Save your reference for questions about your order.</p><a class="button" href="/#collection">Continue exploring</a></div>`;}catch(error){$('#checkout-error').textContent=error.message;submitting=false;renderSummary();$('#confirm-order').textContent='Confirm order';}}
document.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;if(button.dataset.quantity){if(submitting)return;const i=bag.find(i=>i.id===button.dataset.id),p=product(button.dataset.id);const quantity=i.quantity+Number(button.dataset.quantity);if(quantity<1)bag=bag.filter(item=>item!==i);else if(quantity<=Math.min(p?.stock||0,20))i.quantity=quantity;saveCart(bag);requestId=crypto.randomUUID();if(bag.length)renderSummary();else empty();}if(button.dataset.remove){if(submitting)return;bag=bag.filter(i=>i.id!==button.dataset.remove);saveCart(bag);requestId=crypto.randomUUID();if(bag.length)renderSummary();else empty();}if(button.id==='privacy-open')$('#checkout-privacy-dialog').showModal();if(button.classList.contains('close-dialog'))button.closest('dialog').close();});
try{const data=await api('catalog');products=[...data.products,...data.previewImages.filter(p=>!data.products.some(live=>live.id===p.id))];render();}catch(error){$('#checkout-content').innerHTML=`<div class="checkout-error-panel"><p>${esc(error.message)}</p><p>Refresh this page to try again. Your cart is saved.</p></div>`;}

