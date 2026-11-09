import {randomBytes} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {passwordHash} from '../netlify/lib/core.mjs';
await mkdir('.netlify',{recursive:true});
let credentials;
try { credentials=JSON.parse(await readFile('.netlify/production-admin.json','utf8')); }
catch(error) { if(error.code!=='ENOENT')throw error; credentials={password:randomBytes(24).toString('base64url'),hash:null,sessionSecret:randomBytes(48).toString('hex')};credentials.hash=passwordHash(credentials.password);await writeFile('.netlify/production-admin.json',JSON.stringify(credentials),{flag:'wx'}); }
await writeFile('.netlify/production.env',`ADMIN_PASSWORD_HASH=${credentials.hash}\nSESSION_SECRET=${credentials.sessionSecret}\nADMIN_EMAIL=vexoriaofficial@gmail.com\n`);
await writeFile('.netlify/ADMIN-ACCESS.txt',`Vexoria production admin\nURL: https://vexoria-600.netlify.app/admin\nPassword: ${credentials.password}\n\nStore this password in your password manager. This file is local, ignored by Git, and not deployed.\n`);
console.log('Production credentials prepared in ignored .netlify/ files. No secret values printed.');
