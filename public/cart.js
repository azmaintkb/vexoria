export const money=n=>'Tk '+Number(n).toLocaleString('en-BD');
export const trashIcon='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg>';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function readCart(){try{const bag=JSON.parse(localStorage.getItem('vexoria-bag')||'[]');return Array.isArray(bag)?bag.filter(i=>typeof i.id==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=20):[];}catch{return [];}}
export function saveCart(bag){try{localStorage.setItem('vexoria-bag',JSON.stringify(bag));}catch{}}
export async function api(path,body){const response=await fetch('/api/'+path,{...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await response.json();if(!response.ok)throw Error(data.error||'Something went wrong. Please try again.');return data;}

export function priceMarkup(p){if(!(p?.price>0))return 'Price pending';const sale=Number.isSafeInteger(p.originalPrice)&&p.originalPrice>p.price;return '<span class="selling-price"'+(sale?' aria-label="Discounted price"':'')+'>'+money(p.price)+'</span>'+(sale?' <del class="original-price" aria-label="Original price">'+money(p.originalPrice)+'</del>':'');}
