import { Decimal } from '@phensley/decimal';
import { pluralRules } from './src';

const LANGUAGES = ['en', 'fr', 'lt', 'pl', 'mt', 'pt', 'pt-PT'];
const NUMBERS = [
  '1e-30',
  '0.3333333333e-15',
  0,
  '0.00',
  0.5,
  1,
  '1.0',
  2,
  '3.14159',
  5,
  6,
  7,
  9,
  11,
  15,
  19,
  23,
  29,
  '100',
  '1000000000000',
  '1000000000000.0',
  '9999999999999999999999919',
  '9999999999999999999999999',
  '1e30',
];

let s = '';
for (const n of NUMBERS) {
  s += `${new Decimal(n).toString().padStart(35)}  `;
  for (const lang of LANGUAGES) {
    const plurals = pluralRules.get(lang);
    const cat = plurals.cardinal(n);
    s += `${lang} ${cat}`.padEnd(14);
  }
  s += '\n';
}
console.log(s);
