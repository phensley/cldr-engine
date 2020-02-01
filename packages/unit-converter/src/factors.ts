import { FactorDef } from './types';

const PI = '3.14159265358979323846';

const kfactors = (f: string, u: string[]) => {
  const r: FactorDef[] = [];
  for (let i = 1; i < u.length; i++) {
    r.push([u[i - 1], f, u[i]]);
  }
  return r;
};

export const ACCELERATION: FactorDef[] = [
  ['g-force', '9.80665', 'meter-per-second-squared']
];

export const ANGLE: FactorDef[] = [
  ['revolution', '360', 'degree' ],
  ['arc-minute', '1/60', 'degree'],
  ['arc-second', '1/60', 'arc-minute'],
  ['radian', '0.5 / ' + PI, 'revolution']
];

export const AREA: FactorDef[] = [
  ['square-kilometer', '1000000', 'square-meter'],
  ['hectare', '10000', 'square-meter'],
  ['square-centimeter', '1 / 10000', 'square-meter'],
  ['square-centimeter', '2500 / 16129', 'square-inch'],
  ['square-mile', '40468564224 / 15625', 'square-meter'],
  ['square-mile', '3097600', 'square-yard'],
  ['square-mile', '27878400', 'square-foot'],
  ['acre', '43560', 'square-foot'],
  ['square-yard', '9', 'square-foot'],
  ['square-foot', '144', 'square-inch']
];

export const CONSUMPTION: FactorDef[] = [
  ['liter-per-100kilometers', '1 / 100', 'liter-per-kilometer']
];

const DIGITAL_BASE: FactorDef[] = [
  ...kfactors('1000', ['terabit', 'gigabit', 'megabit', 'kilobit', 'bit']),
  ['byte', '8', 'bit'],
];

export const DIGITAL: FactorDef[] = [
  ...DIGITAL_BASE,
  ...kfactors('1024', ['terabyte', 'gigabyte', 'megabyte', 'kilobyte', 'byte'])
];

export const DIGITAL_DECIMAL: FactorDef[] = [
  ...DIGITAL_BASE,
  ...kfactors('1000', ['terabyte', 'gigabyte', 'megabyte', 'kilobyte', 'byte'])
];

export const ELECTRIC: FactorDef[] = [
  ['ampere', '1000', 'milliampere']
];

export const ENERGY: FactorDef[] = [
  ['kilojoule', '1000', 'joule'],
  ['kilowatt-hour', '3600000', 'joule'],
  ['calorie', '4.1868', 'joule'],
  ['foodcalorie', '523 / 125', 'joule'],
  ['kilocalorie', '1000', 'calorie']
];

export const FORCE: FactorDef[] = [
  ['pound-force', '4.448222', 'newton']
];

export const FREQUENCY: FactorDef[] =
  kfactors('1000', ['gigahertz', 'megahertz', 'kilohertz', 'hertz']);

export const GRAPHICS_PER: FactorDef[] = [
  ['dot-per-inch', '1', 'pixel-per-inch'],
  ['dot-per-centimeter', '2.54', 'dot-per-inch'],
];

export const GRAPHICS_PIXEL: FactorDef[] = [
  ['megapixel', '1000000', 'pixel']
];

export const LENGTH: FactorDef[] = [
  ['kilometer', '100000', 'centimeter'],
  ['meter', '100', 'centimeter'],
  ['decimeter', '10', 'centimeter'],
  ['millimeter', '1 / 10', 'centimeter'],
  ['micrometer', '1 / 10000', 'centimeter'],
  ['nanometer', '1 / 10000000', 'centimeter'],
  ['picometer', '1 / 10000000000', 'centimeter'],

  ['mile', '5280', 'foot'],
  ['yard', '36', 'inch'],
  ['foot', '12', 'inch'],
  ['inch', '2.54', 'centimeter'],

  ['light-year', '9460730472580800', 'meter'],
  ['astronomical-unit', '149597870700', 'meter'],
  ['parsec', '648000 / ' + PI, 'astronomical-unit'],

  ['furlong', '220', 'yard'],
  ['fathom', '6', 'foot'],
  ['nautical-mile', '1852', 'meter'],
  ['mile-scandinavian', '10000', 'meter'],

  ['point', '1 / 72', 'inch'],
];

export const MASS: FactorDef[] = [
  ['metric-ton', '1000', 'kilogram'],
  ['gram', '1 / 1000', 'kilogram'],
  ['milligram', '1 / 1000', 'gram'],
  ['microgram', '1 / 1000', 'milligram'],

  ['carat', '200', 'milligram'],

  ['pound', '45359237 / 100000000', 'kilogram'],
  ['ton', '2000', 'pound'],
  ['stone', '14', 'pound'],
  ['ounce', '1 / 16', 'pound'],
  ['ounce-troy', '12 / 175', 'pound'],
];

export const POWER: FactorDef[] = [
  ...kfactors('1000', ['gigawatt', 'megawatt', 'kilowatt', 'watt']),
    ['horsepower', '745.69987158227', 'watt']
];

export const PRESSURE: FactorDef[] = [
  ['hectopascal', '1', 'millibar'],
  ['hectopascal', '129032000000 / 8896443230521', 'pound-per-square-inch'],
  ['inch-hg', '33.86389', 'hectopascal'],
  ['millimeter-of-mercury', '1013.25 / 760', 'hectopascal']
];

export const SPEED: FactorDef[] = [
  ['kilometer-per-hour', '5 / 18', 'meter-per-second'],
  ['mile-per-hour', '1397 / 3125', 'meter-per-second'],
  ['knot', '463 / 900', 'meter-per-second']
];

export const TORQUE: FactorDef[] = [
  ['pound-foot', '1.35582', 'newton-meter']
];

const VOLUME_BASE: FactorDef[] = [
  ['cubic-kilometer', '1000000000', 'cubic-meter'],
  ['cubic-meter', '1000000000', 'cubic-centimeter'],
  ['cubic-centimeter', '0.06102374409473', 'cubic-inch'],

  ['liter', '1000', 'cubic-centimeter'],
  ['megaliter', '1000000', 'liter'],
  ['hectoliter', '100', 'liter'],
  ['deciliter', '1 / 10', 'liter'],
  ['centiliter', '1 / 100', 'liter'],
  ['milliliter', '1 / 1000', 'liter'],

  ['cup-metric', '1 / 4', 'liter'],

  ['cubic-mile', '5451776000', 'cubic-yard'],
  ['cubic-yard', '27', 'cubic-foot'],
  ['cubic-foot', '1 / 35.31466672148859', 'cubic-meter'],
  ['cubic-inch', '1 / 1728', 'cubic-foot'],

  ['acre-foot', '43560', 'cubic-foot'],
  ['gallon', '3.785411784', 'liter'],
  ['gallon-imperial', '4.54609', 'liter'],

  // To be correct, metric pint conversions would need to be localized.
  // Pinning this at 500mL for now.
  ['pint-metric', '500', 'milliliter'],

  ['tablespoon', '1 / 2', 'fluid-ounce'],
  ['teaspoon', '1 / 6', 'fluid-ounce'],
];

export const VOLUME: FactorDef[] = [
  ...VOLUME_BASE,

  // These are US units. Grouped to be overridden below for UK.
  ['bushel', '2150.42', 'cubic-inch'],
  ['gallon', '231', 'cubic-inch'],
  ['fluid-ounce', '1 / 128', 'gallon'],
  ['quart', '1 / 4', 'gallon'],
  ['pint', '1 / 8', 'gallon'],
  ['cup', '8', 'fluid-ounce'],
];

export const VOLUME_UK: FactorDef[] = [
  ...VOLUME_BASE,

  ['bushel', '8', 'gallon-imperial'],
  ['gallon', '4.54609', 'liter'],
  ['fluid-ounce', '1 / 160', 'gallon-imperial'],
  ['quart', '1 / 4', 'gallon-imperial'],
  ['pint', '1 / 8', 'gallon-imperial'],
  ['cup', '284.1', 'milliliter']
];

export const DefaultFactors: { [category: string]: FactorDef[] } = {

  acceleration: ACCELERATION,
  angle: ANGLE,
  area: AREA,
  consumption: CONSUMPTION,
  digital: DIGITAL,
  // duration: use calendar math to convert
  electric: ELECTRIC,
  energy: ENERGY,
  force: FORCE,
  frequency: FREQUENCY,
  length: LENGTH,
  // light: lux <-> solar luminance depends on time of year, atmospheric conditions
  mass: MASS,
  power: POWER,
  pressure: PRESSURE,
  speed: SPEED,
  // temperature: TBD: computed with functions
  torque: TORQUE,
  volume: VOLUME,
  ['volume-uk']: VOLUME_UK
};
