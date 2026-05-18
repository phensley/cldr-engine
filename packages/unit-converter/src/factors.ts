import { UnitType } from '@phensley/cldr-types';
import { CLDR_FACTORS } from './factors.generated';
import { FactorDef } from './types';

const kfactors = (f: string, u: UnitType[]) => {
  const r: FactorDef[] = [];
  for (let i = 1; i < u.length; i++) {
    r.push([u[i - 1], f, u[i]]);
  }
  return r;
};

/** Units whose generated (US) values must not leak into the UK variant. */
const US_VOLUME_UNITS: Set<string> = new Set([
  'gallon',
  'bushel',
  'cup',
  'dram',
  'dessert-spoon',
  'drop',
  'fluid-ounce',
  'jigger',
  'pinch',
  'pint',
  'quart',
  'barrel',
  'tablespoon',
  'teaspoon',
]);

const VOLUME_UK_GENERATED = CLDR_FACTORS.volume.filter((e) => !US_VOLUME_UNITS.has(e[0]));

// ---------------------------------------------------------------------------
// CLDR-generated star tables (src/factors.generated.ts), merged with the
// hand-maintained extensions below. The generated edges come from CLDR
// 48.2.0 supplemental/units.json (convertUnits + unitConstants); the hand
// entries cover units CLDR does not model in convertUnits (prefix units,
// compound units, and bridge edges) and pin down localized variants.
// ---------------------------------------------------------------------------

/**
 * Conversions between CLDR acceleration units.
 *
 * @public
 */
export const ACCELERATION: FactorDef[] = [
  // hand-maintained (same value as CLDR's `gravity` constant)
  ['g-force', '9.80665', 'meter-per-square-second'],
  ...CLDR_FACTORS.acceleration,
];

/**
 * Conversions between CLDR angle units.
 *
 * @public
 */
export const ANGLE: FactorDef[] = [
  // hand-maintained sub-degree chain (radian and the star edges come from CLDR)
  ['revolution', '360', 'degree'],
  ['arc-minute', '1/60', 'degree'],
  ['arc-second', '1/60', 'arc-minute'],
  ...CLDR_FACTORS.angle,
];

/**
 * Conversions between CLDR area units.
 *
 * @public
 */
export const AREA: FactorDef[] = [
  // hand-maintained square-unit chain (CLDR only models square-meter)
  ['square-kilometer', '1000000', 'square-meter'],
  ['square-centimeter', '1 / 10000', 'square-meter'],
  ['square-centimeter', '2500 / 16129', 'square-inch'],
  ['square-mile', '40468564224 / 15625', 'square-meter'],
  ['square-mile', '3097600', 'square-yard'],
  ['square-mile', '27878400', 'square-foot'],
  ['acre', '43560', 'square-foot'],
  ['square-yard', '9', 'square-foot'],
  ['square-foot', '144', 'square-inch'],
  ...CLDR_FACTORS.area,
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
  CLDR_FACTORS.digital,
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
  ['century', '3155695200', 'second'],
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
  ...CLDR_FACTORS.duration,
];

/**
 * Conversions between CLDR electric units.
 *
 * @public
 */
export const ELECTRIC: FactorDef[] = [
  // hand-maintained (CLDR only models the base units)
  ['ampere', '1000', 'milliampere'],
  ...CLDR_FACTORS.electric,
];

/**
 * Conversions between CLDR energy units.
 *
 * @public
 */
export const ENERGY: FactorDef[] = [
  // hand-maintained prefix/compound units (calorie and foodcalorie come
  // from CLDR: 1 calorie = 4.184 J, 1 foodcalorie = 4184 J)
  ['kilojoule', '1000', 'joule'],
  ['kilowatt-hour', '3600000', 'joule'],
  ['kilocalorie', '1000', 'calorie'],
  ...CLDR_FACTORS.energy,
];

/**
 * Conversions between CLDR force units.
 *
 * @public
 */
export const FORCE: FactorDef[] = [...CLDR_FACTORS.force];

/**
 * Conversions between CLDR frequency units.
 *
 * @public
 */
export const FREQUENCY: FactorDef[] = kfactors('1000', ['gigahertz', 'megahertz', 'kilohertz', 'hertz']).concat(
  CLDR_FACTORS.frequency,
);

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
export const GRAPHICS_PIXEL: FactorDef[] = [
  // hand-maintained (CLDR only models pixel, dot, and em)
  ['megapixel', '1000000', 'pixel'],
  ...CLDR_FACTORS.graphics,
];

/**
 * Conversions between CLDR illuminance / luminous units (candela, lumen,
 * lux; these are different dimensions and are not mutually convertible).
 *
 * @public
 */
export const ILLUMINANCE: FactorDef[] = [...CLDR_FACTORS.illuminance];

/**
 * Conversions between CLDR length units.
 *
 * @public
 */
export const LENGTH: FactorDef[] = [
  // hand-maintained sub-meter chain (meter star edges come from CLDR)
  ['kilometer', '100000', 'centimeter'],
  ['meter', '100', 'centimeter'],
  ['decimeter', '10', 'centimeter'],
  ['millimeter', '1 / 10', 'centimeter'],
  ['micrometer', '1 / 10000', 'centimeter'],
  ['nanometer', '1 / 10000000', 'centimeter'],
  ['picometer', '1 / 10000000000', 'centimeter'],

  // hand-maintained US chain
  ['mile', '5280', 'foot'],
  ['yard', '36', 'inch'],
  ['foot', '12', 'inch'],
  ['inch', '2.54', 'centimeter'],
  ['furlong', '220', 'yard'],
  ['fathom', '6', 'foot'],
  ['point', '1 / 72', 'inch'],

  ...CLDR_FACTORS.length,
];

/**
 * Conversions between CLDR mass units.
 *
 * @public
 */
export const MASS: FactorDef[] = [
  // hand-maintained prefix chain (kilogram star edges come from CLDR)
  ['gram', '1 / 1000', 'kilogram'],
  ['milligram', '1 / 1000', 'gram'],
  ['microgram', '1 / 1000', 'milligram'],

  ['carat', '200', 'milligram'],
  ['ton', '2000', 'pound'],
  ['stone', '14', 'pound'],
  ['ounce', '1 / 16', 'pound'],
  ['ounce-troy', '12 / 175', 'pound'],

  ...CLDR_FACTORS.mass,
];

/**
 * Conversions between CLDR power units.
 *
 * @public
 */
export const POWER: FactorDef[] = kfactors('1000', ['gigawatt', 'megawatt', 'kilowatt', 'watt']).concat(
  CLDR_FACTORS.power,
);

/**
 * Conversions between CLDR pressure units.
 *
 * @public
 */
export const PRESSURE: FactorDef[] = [
  // hand-maintained: CLDR does not model these units, and the pascal and
  // mercury-column bridges connect the two CLDR pressure dimensions
  ['hectopascal', '100', 'pascal'],
  ['hectopascal', '1', 'millibar'],
  ['hectopascal', '129032000000 / 8896443230521', 'pound-force-per-square-inch'],
  ['inch-ofhg', '33.86389', 'hectopascal'],
  ['millimeter-ofhg', '1013.25 / 760', 'hectopascal'],
  ['ofhg', '133.322387415', 'pascal'],
  ...CLDR_FACTORS.pressure,
];

/**
 * Conversions between CLDR radiation dose units (gray, sievert).
 *
 * @public
 */
export const RADIATION: FactorDef[] = [...CLDR_FACTORS.radiation];

/**
 * Conversions between CLDR radioactivity units (becquerel).
 *
 * @public
 */
export const RADIOACTIVITY: FactorDef[] = [...CLDR_FACTORS.radioactivity];

/**
 * Conversions between CLDR ratio units (part, percent, permille, permyriad,
 * karat).
 *
 * @public
 */
export const RATIO: FactorDef[] = [...CLDR_FACTORS.ratio];

/**
 * Conversions between CLDR consumption units.
 *
 * @public
 */
export const SPEED: FactorDef[] = [
  ['kilometer-per-hour', '5 / 18', 'meter-per-second'],
  ['mile-per-hour', '1397 / 3125', 'meter-per-second'],
  ['knot', '463 / 900', 'meter-per-second'],
  ...CLDR_FACTORS.speed,
];

/**
 * Conversions between CLDR substance units (item, mole; katal and
 * ofglucose are different dimensions and are not mutually convertible).
 *
 * @public
 */
export const SUBSTANCE: FactorDef[] = [...CLDR_FACTORS.substance];

/**
 * Conversions between CLDR temperature units, anchored to the kelvin.
 * These are affine: the fourth element is the additive offset in kelvin,
 * so `kelvin = unit * factor + offset` (CLDR 48.2.0 `convertUnits`).
 *
 * @public
 */
export const TEMPERATURE: FactorDef[] = [...CLDR_FACTORS.temperature];

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

  // hand-maintained prefix chain (CLDR volume units connect to the
  // cubic-meter hub from the generated table)
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
export const VOLUME: FactorDef[] = VOLUME_BASE.concat(CLDR_FACTORS.volume, [
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
export const VOLUME_UK: FactorDef[] = VOLUME_BASE.concat(VOLUME_UK_GENERATED, [
  ['gallon', '4.54609', 'liter'],
  ['gallon-imperial', '4.54609', 'liter'],
  ['bushel', '8', 'gallon-imperial'],
  ['fluid-ounce', '1 / 160', 'gallon-imperial'],
  ['quart', '1 / 4', 'gallon-imperial'],
  ['pint', '1 / 8', 'gallon-imperial'],
  ['cup', '284.1', 'milliliter'],
]);
