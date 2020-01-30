import { UnitCategory, UnitType } from '@phensley/cldr-types';
import { Decimal, MathContext, Rational } from '@phensley/decimal';
import { UnitFactor, UnitFactorMapEntry } from './types';

const ONE = new Rational(1, 1);

export class UnitFactorMap {

  // All units referenced in this map
  private units: UnitType[] = [];

  private factors: { [from: string]: { [to: string]: UnitFactor } } = {};

  constructor(readonly category: UnitCategory, factors: UnitFactorMapEntry[]) {
    const units = new Set<UnitType>();
    for (const f of factors) {
      const from = f[0];
      let map = this.factors[from];
      if (!map) {
        this.factors[from] = map = {};
      }
      const to = f[1];
      const fac = typeof to[0] === 'string' ? new Rational(to[0]) : to[0];

      // Add from and to units to set
      units.add(from);
      units.add(to[1]);

      // Add forward and reverse mappings
      map[to[1]] = [fac, to[1]];
      this.set(to[1], fac.inverse(), from, false);
    }

    units.forEach(u => this.units.push(u));
    this.units.sort();
    for (const from of this.units) {
      for (const to of this.units) {
        if (from === to) {
          continue;
        }

        let fac: UnitFactor | undefined;

        // If a direct conversion exists, continue.
        fac = this.get(from, to);
        if (fac) {
          continue;
        }

        // Get or create the mapping
        let map = this.factors[from];
        if (!map) {
          this.factors[from] = map = {};
        }

        // Resolve the conversion factor using the best path
        fac = this.resolve(from, to);
        const old = map[to];
        if (!old) {
          this.set(from, fac[0], to, true);
        }
      }
    }

  }

  dump(): string {
    let s = '';
    for (const from of this.units) {
      s += `${from}:\n`;
      for (const to of this.units) {
        if (from === to) {
          continue;
        }
        const fac = this.get(from, to)!;
        s += `  ${to} ${fac[0].toString()}\n`;
      }
    }
    return s;
  }

  convert(amt: Decimal, from: UnitType, to: UnitType, ctx?: MathContext): Decimal {
    if (from === to) {
      return amt;
    }
    const fac = this.get(from, to)![0] as Rational;
    return fac.multiply(amt, ctx).toDecimal(ctx);
  }

  get(from: UnitType, to: UnitType): UnitFactor | undefined {
    const m = this.factors[from];
    return m ? m[to] : undefined;
  }

  set(from: UnitType, factor: string | Rational, to: UnitType, replace: boolean): void {
    let map = this.factors[from];
    if (!map) {
      this.factors[from] = map = {};
    }
    if (replace || !map[to]) {
      map[to] = [factor, to];
    }
  }

  resolve(from: UnitType, to: UnitType): UnitFactor {
    const one: UnitFactor = [ONE, to];
    if (from === to) {
      return one;
    }
    const path = this.getpath(from, to);
    if (!path.length) {
      throw new Error(`cannot find a path to convert ${from} into ${to}`);
    }

    // Multiply the path out
    const tmp = path[0];
    const fac: UnitFactor = [tmp[0], tmp[1]];
    for (let i = 1; i < path.length; i++) {
      fac[0] = (fac[0] as Rational).multiply(path[i][0] as Rational);
    }
    // Returning a factor that converts 'from' to 'to'
    return fac;
  }

  private getpath(from: UnitType, to: UnitType): UnitFactor[] {
    if (from === to) {
      return [[ONE, to]];
    }
    const seen = new Set<UnitType>();
    const paths = this.getpaths(from, to, seen);

    // TODO: return path that is least precision or shortest

    return paths.length ? paths[0] : [];
  }

  /**
   * Search into the mapping to find lists of factors that can convert
   * the 'from' unit into the 'to' unit.  For example, to convert MILE
   * to KILOMETER, we might find the path:
   *
   *   [(MILE -> INCH), (INCH -> METER), (METER -> KILOMETER)]
   */
  private getpaths(from: UnitType, to: UnitType, seen: Set<UnitType>): UnitFactor[][] {
    // Look for a direct conversion
    const r = this.get(from, to);
    if (r) {
      return [[r]];
    }

    const result: UnitFactor[][] = [];

    // Prune the search space
    seen.add(from);

    // Scan each base for the 'from' unit, trying to find a complete path
    // to the 'to' unit. Collect all of the paths.
    const map = this.factors[from] || {};
    const bases = Object.keys(map) as UnitType[];
    for (const base of bases) {
      if (seen.has(base)) {
        continue;
      }

      // Create this link in the chain.
      const factor = this.get(from, base);

      // Scan another level deeper, starting from the 'base' unit
      for (const factors of this.getpaths(base, to, seen)) {
        if (factors.length) {
          factors.unshift(factor || [ONE, to]);
          result.push(factors);
        }
      }
    }

    return result;
  }

}
