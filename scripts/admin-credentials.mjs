import {passwordHash} from '../netlify/lib/core.mjs';import {randomBytes} from 'node:crypto';
const password=randomBytes(24).toString('base64url');console.log('Save these securely in your password manager and Netlify environment settings.\nAdmin password: '+password+'\nADMIN_PASSWORD_HASH='+passwordHash(password)+'\nSESSION_SECRET='+randomBytes(48).toString('hex'));

