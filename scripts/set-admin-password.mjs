// Sets the agency admin login in .env.local.
// Usage: node scripts/set-admin-password.mjs
// Prompts for admin e-mail(s) and a password, then writes ADMIN_EMAILS and
// ADMIN_PASSWORD_HASH (scrypt) to .env.local. The plain password is never stored.
// Copy the same two values to Vercel -> Settings -> Environment Variables.

import { randomBytes, scryptSync } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else rl.output.write('*'.repeat(s.length > 2 ? 0 : s.length));
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

const emails = await ask('Admin e-posta(lar) (virgülle ayır): ');
if (!emails) {
  console.error('E-posta boş olamaz.');
  process.exit(1);
}
const password = await ask('Şifre (en az 12 karakter): ', true);
if (password.length < 12) {
  console.error('Şifre en az 12 karakter olmalı.');
  process.exit(1);
}
const again = await ask('Şifre (tekrar): ', true);
if (password !== again) {
  console.error('Şifreler eşleşmiyor.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const value = `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;

const envPath = new URL('../.env.local', import.meta.url);
let env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
function setVar(name, val) {
  const line = `${name}=${val}`;
  const re = new RegExp(`^${name}=.*$`, 'm');
  env = re.test(env) ? env.replace(re, line) : `${env.replace(/\s*$/, '\n')}${line}\n`;
}
setVar('ADMIN_EMAILS', emails.toLowerCase().replace(/\s+/g, ''));
setVar('ADMIN_PASSWORD_HASH', value);
writeFileSync(envPath, env);

console.log('\n.env.local güncellendi: ADMIN_EMAILS ve ADMIN_PASSWORD_HASH yazıldı.');
console.log('Aynı iki değeri Vercel ortam değişkenlerine de ekle.');
