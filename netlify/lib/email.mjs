const safeError=(status,data)=>({code:String(data?.name||'provider_error').slice(0,80),message:({400:'Email request rejected.',401:'Email API key is invalid.',403:'Sender domain or recipient is not permitted.',409:'Email retry conflicts with an earlier request.',429:'Email service rate limit reached.'})[status]||'Email provider temporarily unavailable.'});
export async function emailOrder(order,db) {
 if(!process.env.RESEND_API_KEY||!process.env.ADMIN_EMAIL||!process.env.EMAIL_FROM){order.emailStatus='not configured';await db.set('orders/'+order.id,order);return;}
 const payload={from:process.env.EMAIL_FROM,to:[process.env.ADMIN_EMAIL],subject:`New Vexoria order ${order.reference}`,text:`${order.reference}\n${order.customer.name}\n${order.customer.phone}\n${order.customer.address}\n${[order.customer.thana,order.customer.district,order.customer.postcode].filter(Boolean).join(', ')}\n\n${order.items.map(i=>`${i.name} × ${i.quantity} — BDT ${i.price*i.quantity}`).join('\n')}\nDelivery: BDT ${order.delivery}\nDelivery location: ${order.deliveryLocation||'Not recorded'}\nTotal: BDT ${order.total}\nCash on delivery\nNotes: ${order.customer.notes||'None'}\n\nManage order: https://vexoriaofficialbd.store/admin`};
 let result={emailStatus:'failed',emailLastAttempt:new Date().toISOString()};
 for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(6000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`order-${order.id}`},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>({}));
   if(res.ok&&data.id){result={...result,emailStatus:'sent',emailProviderId:data.id,emailError:null};break;}
   result.emailError=safeError(res.status,data);
   if(res.status!==429&&res.status<500)break;
  }catch{result.emailError={code:'connection_error',message:'Email provider timed out or could not be reached.'};}
  if(attempt===0)await new Promise(resolve=>setTimeout(resolve,500));
 }
 // Preserve status/read changes made while the notification was being sent.
 const latest=await db.get('orders/'+order.id)||order;
 Object.assign(order,result);await db.set('orders/'+order.id,{...latest,...result});
}
