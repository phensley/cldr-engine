import {
  ACCELERATION,
  ANGLE,
  AREA,
  CONSUMPTION,
  DIGITAL,
  DIGITAL_DECIMAL,
  DURATION,
  ELECTRIC,
  ENERGY,
  FORCE,
  FREQUENCY,
  GRAPHICS_PER,
  GRAPHICS_PIXEL,
  LENGTH,
  MASS,
  POWER,
  PRESSURE,
  SPEED,
  TORQUE,
  VOLUME,
  VOLUME_UK
} from '../src';

import {
  FactorDef,
  UnitFactors
} from '../src';

const FACTORS: FactorDef[][] = [
  ACCELERATION,
  ANGLE,
  AREA,
  CONSUMPTION,
  DIGITAL,
  DIGITAL_DECIMAL,
  DURATION,
  ELECTRIC,
  ENERGY,
  FORCE,
  FREQUENCY,
  GRAPHICS_PER,
  GRAPHICS_PIXEL,
  LENGTH,
  MASS,
  POWER,
  PRESSURE,
  SPEED,
  TORQUE,
  VOLUME,
  VOLUME_UK
];

test('cover all factors', () => {
  for (const factorset of FACTORS) {
    const map = new UnitFactors(factorset);
    for (const u of map.units) {
      for (const v of map.units) {
        map.get(u, v);
      }
    }
  }
});
