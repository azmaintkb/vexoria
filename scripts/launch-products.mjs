import {storage} from '../netlify/lib/storage.mjs';
import {drafts,productInput} from '../netlify/lib/core.mjs';
process.env.VEXORIA_LOCAL='1';
const descriptions={
 'red-cat':'Make room for a little mischief. Vexoria’s Red Cat Thermal Pot pairs a bold red lid with a cream body and expressive black-cat illustrations. Cherry details, little bows, and a scalloped red border complete the playful look—a bright addition to your desk, kitchen shelf, or daily coffee ritual.',
 'pink-bear':'Bring a softer touch to your everyday routine with Vexoria’s Pink Bear Thermal Pot. A cream body, pastel pink lid, and charming bear illustration give this design its cheerful personality. Whether you’re styling your coffee corner or choosing a thoughtful little gift, Pink Bear adds a lovely pop of colour.',
 'blue-puppy':'Brighten your everyday with Vexoria’s Blue Puppy Thermal Pot. A soft blue lid, cheerful puppy illustration, and playful little accents give this cream-coloured pot a fresh, friendly look. Finished with a blue checked border, it’s a charming choice for puppy lovers and anyone who enjoys a little personality in their daily essentials.',
 'brown-dessert':'Inspired by the comfort of café afternoons, Vexoria’s Brown Dessert Thermal Pot combines warm brown tones with a cream body, miniature dessert illustrations, and a checked border. Its understated colours bring a cosy feel to your coffee corner, making it an easy favourite for anyone who enjoys sweet details and simple styling.',
};
const db=await storage();
for(const draft of drafts){const current=await db.get('products/'+draft.id)||draft;const updated=productInput({...current,price:549,description:descriptions[draft.id],published:true});await db.set('products/'+draft.id,updated);}
console.log('Four local products published at Tk 549 each; existing stock preserved.');
