import { UnitType } from '@phensley/cldr-types';
import { UnitFactorMapEntry } from './types';

const PI = '3.14159265358979323846';

// TODO: Use perfect hashing to eliminate unit names

const kfactors = (f: string, u: UnitType[]) => {
  const r: UnitFactorMapEntry[] = [];
  for (let i = 1; i < u.length; i++) {
    r.push([u[i - 1], [f, u[i]]]);
  }
  return r;
};

export const UnitFactors: { [category: string]: UnitFactorMapEntry[] } = {

  angle: [
    ['revolution', ['360', 'degree' ]],
    ['arc-minute', ['1/60', 'degree']],
    ['arc-second', ['1/60', 'arc-minute']],
    ['radian', ['0.5 / ' + PI, 'revolution']]
  ],

  area: [
    ['square-kilometer', ['1000000', 'square-meter']],
    ['hectare', ['10000', 'square-meter']],
    ['square-centimeter', ['1 / 10000', 'square-meter']],
    ['square-centimeter', ['2500 / 16129', 'square-inch']],
    ['square-mile', ['40468564224 / 15625', 'square-meter']],
    ['square-mile', ['3097600', 'square-yard']],
    ['square-mile', ['27878400', 'square-foot']],
    ['acre', ['43560', 'square-foot']],
    ['square-yard', ['9', 'square-foot']],
    ['square-foot', ['144', 'square-inch']]
  ],

  consumption: [
    ['liter-per-100kilometers', ['1 / 100', 'liter-per-kilometer']]
  ],

  digital: [
    ...kfactors('1000', ['terabit', 'gigabit', 'megabit', 'kilobit', 'bit']),
    // ['terabit', ['1000', 'gigabit']],
    // ['gigabit', ['1000', 'megabit']],
    // ['megabit', ['1000', 'kilobit']],
    // ['kilobit', ['1000', 'bit']],
    ['byte', ['8', 'bit']],
    ...kfactors('1024', ['terabyte', 'gigabyte', 'megabyte', 'kilobyte', 'byte']),
    // ['terabyte', ['1024', 'gigabyte']],
    // ['gigabyte', ['1024', 'megabyte']],
    // ['megabyte', ['1024', 'kilobyte']],
    // ['kilobyte', ['1024', 'byte']]
  ],

  electric: [
    ['ampere', ['1000', 'milliampere']]
  ],

  energy: [
    ['kilojoule', ['1000', 'joule']],
    ['kilowatt-hour', ['3600000', 'joule']],
    ['calorie', ['4.1868', 'joule']],
    ['foodcalorie', ['523 / 125', 'joule']],
    ['kilocalorie', ['1000', 'calorie']]
  ],

  frequency: [
    ...kfactors('1000', ['gigahertz', 'megahertz', 'kilohertz', 'hertz'])
    // ['gigahertz', ['1000', 'megahertz']],
    // ['megahertz', ['1000', 'kilohertz']],
    // ['kilohertz', ['1000', 'hertz']
  ],

  length: [
    ['kilometer', ['100000', 'centimeter']],
    ['meter', ['100', 'centimeter']],
    ['decimeter', ['10', 'centimeter']],
    ['millimeter', ['1 / 10', 'centimeter']],
    ['micrometer', ['1 / 10000', 'centimeter']],
    ['nanometer', ['1 / 10000000', 'centimeter']],
    ['picometer', ['1 / 10000000000', 'centimeter']],

    ['mile', ['5280', 'foot']],
    ['yard', ['36', 'inch']],
    ['foot', ['12', 'inch']],
    ['inch', ['2.54', 'centimeter']],

    ['light-year', ['9460730472580800', 'meter']],
    ['astronomical-unit', ['149597870700', 'meter']],
    ['parsec', ['648000 / ' + PI, 'astronomical-unit']],

    ['furlong', ['220', 'yard']],
    ['fathom', ['6', 'foot']],
    ['nautical-mile', ['1852', 'meter']],
    ['mile-scandinavian', ['10000', 'meter']],

    ['point', ['1 / 72', 'inch']],
  ]

};
