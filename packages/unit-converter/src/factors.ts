import { FactorDef } from './types';

const PI = '3.14159265358979323846';

const kfactors = (f: string, u: string[]) => {
  const r: FactorDef[] = [];
  for (let i = 1; i < u.length; i++) {
    r.push([u[i - 1], f, u[i]]);
  }
  return r;
};

/**
 * Conversions between CLDR acceleration units.
 *
 * @public
 */
export const ACCELERATION: FactorDef[] = [['g-force', '9.80665', 'meter-per-square-second']];

/**
 * Conversions between CLDR angle units.
 *
 * @public
 */
export const ANGLE: FactorDef[] = [
  ['revolution', '360', 'degree'],
  ['arc-minute', '1/60', 'degree'],
  ['arc-second', '1/60', 'arc-minute'],
  ['radian', '0.5 / ' + PI, 'revolution'],
];

/**
 * Conversions between CLDR area units.
 *
 * @public
 */
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
  ['square-foot', '144', 'square-inch'],
];

/**
 * Conversions between CLDR consumption units.
 *
 * @public
 */
export const CONSUMPTION: FactorDef[] = [['liter-per-100-kilometer', '1 / 100', 'liter-per-kilometer']];

const DIGITAL_BASE: FactorDef[] = kfactors('1000', ['terabit', 'gigabit', 'megabit', 'kilobit', 'bit']).concat([
  ['byte', '8', 'bit'],
]);

/**
 * Conversions between CLDR digital units.
 *
 * @public
 */
export const DIGITAL: FactorDef[] = DIGITAL_BASE.concat(
  kfactors('1024', ['terabyte', 'gigabyte', 'megabyte', 'kilobyte', 'byte']),
);

/**
 * Conversions between CLDR digital units where 1 kilobyte is 1000 bytes.
 *
 * @public
 */
export const DIGITAL_DECIMAL: FactorDef[] = DIGITAL_BASE.concat(
  kfactors('1000', ['terabyte', 'gigabyte', 'megabyte', 'kilobyte', 'byte']),
);

/**
 * Duration factors.  Values for month, year, century are approximate. If you
 * want accurate duration conversions from a given date, use calendar math.
 *
 * @public
 */
export const DURATION: FactorDef[] = [
  ['century', '315569520', 'second'],
  ['year', '12', 'month'],
  ['year', '31556952', 'second'],
  ['month', '30.436875', 'day'],
  ['week', '7', 'day'],
  ['day', '24', 'hour'],
  ['hour', '60', 'minute'],
  ['minute', '60', 'second'],
  ['second', '1000', 'millisecond'],
  ['millisecond', '1000', 'microsecond'],
  ['microsecond', '1000', 'nanosecond'],
];

/**
 * Conversions between CLDR electric units.
 *
 * @public
 */
export const ELECTRIC: FactorDef[] = [['ampere', '1000', 'milliampere']];

/**
 * Conversions between CLDR energy units.
 *
 * @public
 */
export const ENERGY: FactorDef[] = [
  ['kilojoule', '1000', 'joule'],
  ['kilowatt-hour', '3600000', 'joule'],
  ['calorie', '4.1868', 'joule'],
  ['foodcalorie', '523 / 125', 'joule'],
  ['kilocalorie', '1000', 'calorie'],
];

/**
 * Conversions between CLDR force units.
 *
 * @public
 */
export const FORCE: FactorDef[] = [['pound-force', '4.448222', 'newton']];

/**
 * Conversions between CLDR frequency units.
 *
 * @public
 */
export const FREQUENCY: FactorDef[] = kfactors('1000', ['gigahertz', 'megahertz', 'kilohertz', 'hertz']);

/**
 * Conversions between CLDR graphics 'per' units.
 *
 * @public
 */
export const GRAPHICS_PER: FactorDef[] = [
  ['dot-per-inch', '1', 'pixel-per-inch'],
  ['dot-per-centimeter', '2.54', 'dot-per-inch'],
];

/**
 * Conversions between CLDR graphics 'pixel' units.
 *
 * @public
 */
export const GRAPHICS_PIXEL: FactorDef[] = [['megapixel', '1000000', 'pixel']];

/**
 * Conversions between CLDR length units.
 *
 * @public
 */
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

/**
 * Conversions between CLDR mass units.
 *
 * @public
 */
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

/**
 * Conversions between CLDR power units.
 *
 * @public
 */
export const POWER: FactorDef[] = kfactors('1000', ['gigawatt', 'megawatt', 'kilowatt', 'watt']).concat([
  ['horsepower', '745.69987158227', 'watt'],
]);

/**
 * Conversions between CLDR pressure units.
 *
 * @public
 */
export const PRESSURE: FactorDef[] = [
  ['hectopascal', '1', 'millibar'],
  ['hectopascal', '129032000000 / 8896443230521', 'pound-force-per-square-inch'],
  ['inch-ofhg', '33.86389', 'hectopascal'],
  ['millimeter-ofhg', '1013.25 / 760', 'hectopascal'],
];

/**
 * Conversions between CLDR consumption units.
 *
 * @public
 */
export const SPEED: FactorDef[] = [
  ['kilometer-per-hour', '5 / 18', 'meter-per-second'],
  ['mile-per-hour', '1397 / 3125', 'meter-per-second'],
  ['knot', '463 / 900', 'meter-per-second'],
];

/**
 * Conversions between CLDR consumption units.
 *
 * @public
 */
export const TORQUE: FactorDef[] = [['pound-force-foot', '1.35582', 'newton-meter']];

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
  ['cubic-foot', '28.316846592', 'liter'],
  ['cubic-inch', '1 / 1728', 'cubic-foot'],

  ['acre-foot', '43560', 'cubic-foot'],

  // To be correct, metric pint conversions would need to be localized.
  // Pinning this at 500mL for now.
  ['pint-metric', '500', 'milliliter'],

  ['tablespoon', '1 / 2', 'fluid-ounce'],
  ['teaspoon', '1 / 6', 'fluid-ounce'],
];

/**
 * Conversions between CLDR volume units.
 * These are US units. Grouped to be overridden below for UK.
 *
 * @public
 */
export const VOLUME: FactorDef[] = VOLUME_BASE.concat([
  ['gallon', '3.785411784', 'liter'],
  ['gallon-imperial', '4.54609', 'liter'],
  ['bushel', '2150.42', 'cubic-inch'],
  ['gallon', '231', 'cubic-inch'],
  ['fluid-ounce', '1 / 128', 'gallon'],
  ['quart', '1 / 4', 'gallon'],
  ['pint', '1 / 8', 'gallon'],
  ['cup', '8', 'fluid-ounce'],
]);

/**
 * Conversions between CLDR volume units in the UK.
 *
 * @public
 */
export const VOLUME_UK: FactorDef[] = VOLUME_BASE.concat([
  ['gallon', '4.54609', 'liter'],
  ['gallon-imperial', '4.54609', 'liter'],
  ['bushel', '8', 'gallon-imperial'],
  ['fluid-ounce', '1 / 160', 'gallon-imperial'],
  ['quart', '1 / 4', 'gallon-imperial'],
  ['pint', '1 / 8', 'gallon-imperial'],
  ['cup', '284.1', 'milliliter'],
]);
