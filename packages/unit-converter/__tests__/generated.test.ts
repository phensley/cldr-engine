import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { generateCategories, parseConvertUnits } from '../scripts/generate-factors';
import { CLDR_FACTORS } from '../src/factors.generated';

const UNITS_JSON = path.join(__dirname, '..', '..', 'cldr-compiler', '.cldr', '48.2.0', 'supplemental', 'units.json');

// The CLDR data is downloaded by the cldr-compiler build; skip when it is
// not present locally (CI runs the build first).
describe.skipIf(!existsSync(UNITS_JSON))('generated factors (CLDR 48.2.0)', () => {
  const json = JSON.parse(readFileSync(UNITS_JSON, 'utf8'));

  test('committed table matches a fresh regeneration (drift check)', () => {
    const gen = generateCategories(json);
    // normalize optional trailing offset (undefined vs absent element)
    const norm: Record<string, [string, string, string, string?][]> = {};
    for (const cat of Object.keys(gen)) {
      norm[cat] = gen[cat].map(([u, f, h, o]) => (o === undefined ? [u, f, h] : [u, f, h, o]));
    }
    expect(CLDR_FACTORS).toEqual(norm);
  });

  test('covers every CLDR unit except the nonlinear beaufort scale', () => {
    const { units, special } = parseConvertUnits(json);
    expect(special).toEqual(['beaufort']);

    const covered = new Set<string>();
    for (const edges of Object.values(CLDR_FACTORS)) {
      for (const [u, , h] of edges) {
        covered.add(u);
        covered.add(h);
      }
    }
    for (const u of units) {
      expect({ unit: u.unit, covered: covered.has(u.unit) }).toEqual({ unit: u.unit, covered: true });
    }
    expect(covered.has('beaufort')).toBe(false);
  });

  test('temperature offsets are anchored to the kelvin', () => {
    const gen = generateCategories(json);
    expect(gen.temperature).toEqual([
      ['celsius', '1', 'kelvin', '273.15'],
      ['fahrenheit', '5 / 9', 'kelvin', '45967 / 180'],
      ['rankine', '5 / 9', 'kelvin'],
    ]);
  });

  test('evaluates CLDR formula grammar (division groups rightward)', () => {
    // gallon = 231 in^3 with in3_to_m3 = 'ft3_to_m3/12*12*12' = ft^3/1728
    const gen = generateCategories(json);
    expect(gen.volume).toContainEqual(['gallon', '0.003785411784', 'cubic-meter']);
    // radian = '1/2*PI' = 1/(2*PI) revolutions, PI = 411557987/131002976
    expect(gen.angle).toContainEqual(['radian', '65501488 / 411557987', 'revolution']);
  });
});
