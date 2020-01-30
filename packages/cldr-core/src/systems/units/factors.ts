import { UnitFactorMapEntry } from './types';

const PI = '3.14159265358979323846';

// TODO: Use perfect hashing to eliminate unit names

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
  ]

};
