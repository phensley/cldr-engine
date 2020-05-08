import { Decimal, MathContext, RationalConstants } from '@phensley/decimal';
import { UnitConversion, UnitFactors } from './factormap';

/**
 * Converts between units.
 *
 * @public
 */
export class UnitConverter {
  private storage: { [category: string]: UnitFactors } = {};

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
  add(category: string, map: UnitFactors): void {
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

  /**
   * Returns the unit factors for the given category.
   */
  factors(category: string): UnitFactors | undefined {
    return this.storage[category];
  }

  /**
   * Return an array of the categories added to this converter.
   */
  categories(): string[] {
    return Object.keys(this.storage).sort();
  }

  /**
   * Get the unit conversion factor that converts `src` to `dst` for the given category.
   */
  get(category: string, src: string, dst: string): UnitConversion | undefined {
    const factors = this.storage[category];
    if (factors) {
      return factors.get(src, dst);
    }
    return undefined;
  }

  /**
   * Convert the decimal value from `src` to `dst` units.
   */
  convert(category: string, n: Decimal, src: string, dst: string, ctx?: MathContext): Decimal | undefined {
    const conv = this.get(category, src, dst);
    if (conv) {
      const fac = conv.factors.reduce((p, c) => p.multiply(c, ctx), RationalConstants.ONE);
      return n.multiply(fac.toDecimal(), ctx);
    }
    return undefined;
  }
}
