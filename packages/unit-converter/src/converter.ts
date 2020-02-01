import { Decimal, MathContext } from '@phensley/decimal';
import { UnitFactorMap } from './factormap';

/**
 * Converts between units.
 */
export class UnitConverter {

  private storage: { [category: string]: UnitFactorMap } = {};

  // Mapping of unit to category that converts it
  private units: { [unit: string]: string[] } = {};

  /**
   * Return true if the given category is registered.
   */
  has(category: string): boolean {
    return !!this.storage[category];
  }

  /**
   * Add a set of conversion factors with the given category name.
   */
  add(category: string, map: UnitFactorMap): void {
    if (this.storage[category]) {
      throw new Error(`this converter has registered factors for category ${category}`);
    }
    this.storage[category] = map;
    for (const u of map.units) {
      let cats = this.units[u];
      if (!cats) {
        this.units[u] = cats = [];
      }
      cats.push(category);
    }
  }

  factors(category: string): UnitFactorMap | undefined {
    return this.storage[category];
  }

  categories(): string[] {
    return Object.keys(this.storage).sort();
  }

  convert(category: string, n: Decimal, src: string, dst: string, ctx?: MathContext): Decimal | undefined {
    const factors = this.storage[category];
    if (factors) {
      const fac = factors.get(src, dst);
      if (fac) {
        return n.multiply(fac.toDecimal(), ctx);
      }
    }
    return undefined;
  }
}
