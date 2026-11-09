import {cp,mkdir,rm} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
console.log('Built Vexoria storefront and admin into dist/');
