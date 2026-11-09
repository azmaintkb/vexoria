const slides=[
 {id:'red-cat',name:'Red Cat Thermal Pot',image:'/assets/red-cat.jpg',color:'#b64b50',background:'#efebe4'},
 {id:'pink-bear',name:'Pink Bear Thermal Pot',image:'/assets/pink-bear.jpg',color:'#cf9da7',background:'#f3eaea'},
 {id:'blue-puppy',name:'Blue Puppy Thermal Pot',image:'/assets/blue-puppy.jpg',color:'#9fb9d9',background:'#e9eff1'},
 {id:'brown-dessert',name:'Brown Dessert Thermal Pot',image:'/assets/brown-dessert.jpg',color:'#99775d',background:'#eee6dc'},
];
export function initHeroCarousel(onView){
 const root=document.querySelector('.hero-visual');
 const image=root.querySelector('.hero-product');
 const photo=root.querySelector('#hero-view-product');
 const dots=root.querySelector('#hero-slide-dots');
 const caption=root.querySelector('#hero-slide-caption');
 const story=document.querySelector('#story');
 const storyPhoto=document.querySelector('#story-view-product');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,paused=reducedMotion.matches,timer=null,focused=false,viewing=false;
 dots.innerHTML=slides.map((slide,i)=>`<button type="button" class="hero-slide-dot hero-dot-${slide.id}" data-slide="${i}" aria-label="Show ${slide.name}" aria-pressed="${i===0}" title="${slide.name}"></button>`).join('');
 function schedule(){clearInterval(timer);timer=null;if(!paused&&!focused&&!viewing&&!document.hidden)timer=setInterval(()=>show((index+1)%slides.length),4000);}
 function show(next){index=(next+slides.length)%slides.length;const slide=slides[index];image.src=slide.image;image.alt=slide.name;const buy=root.querySelector('#hero-buy-now');buy.dataset.buy=slide.id;buy.setAttribute('aria-label',`Buy ${slide.name} now`);root.dispatchEvent(new Event('featuredchange'));photo.setAttribute('aria-label',`View ${slide.name} and pause slideshow`);caption.textContent=`${String(index+1).padStart(2,'0')} / ${slide.name.toUpperCase()}`;root.dataset.slide=slide.id;root.closest('.hero').dataset.slide=slide.id;if(story&&storyPhoto){story.dataset.slide=slide.id;storyPhoto.querySelector('img').src=slide.image;storyPhoto.querySelector('img').alt=slide.name;storyPhoto.setAttribute('aria-label',`View ${slide.name} and pause slideshow`);}dots.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));}
 function manual(next){show(next);schedule();}
 dots.addEventListener('click',event=>{const dot=event.target.closest('[data-slide]');if(dot)manual(Number(dot.dataset.slide));});
 root.querySelector('#hero-prev').addEventListener('click',()=>manual(index-1));
 root.querySelector('#hero-next').addEventListener('click',()=>manual(index+1));
 function viewCurrent(){viewing=true;schedule();onView(slides[index].id);if(!document.querySelector('#product-dialog').open){viewing=false;schedule();}}
 photo.addEventListener('click',viewCurrent);
 storyPhoto?.addEventListener('click',viewCurrent);
 document.querySelector('#product-dialog').addEventListener('close',()=>{viewing=false;focused=false;schedule();});
 root.addEventListener('focusin',()=>{focused=true;schedule();});
 root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget)){focused=false;schedule();}});
 document.addEventListener('visibilitychange',schedule);
 reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;schedule();});
 show(0);schedule();
 // Load the remaining small local photos after the first photo is visible.
 const warmPhotos=()=>{for(const slide of slides.slice(1)){const preload=new Image();preload.decoding='async';preload.src=slide.image;}};if('requestIdleCallback' in window)requestIdleCallback(warmPhotos,{timeout:2500});else setTimeout(warmPhotos,1200);
}
