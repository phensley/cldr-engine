import { Rational } from '@phensley/decimal';
import { Heap } from '@phensley/cldr-utils';
import { FactorDef } from './types';

type M<T> = { [dst: string]: T | undefined };
type G<T> = { [src: string]: M<T> };

type C = [
  number, // cost
  string | undefined  // previous
];

type E = [
  string, // edge
  number  // cost
];

const ONE = new Rational(1);

/**
 * Build a graph of conversion factors between units. Sets of conversion
 * factors are closed, e.g. any factor must be convertable into any other
 * unit in the set. Their must be a connected path of length 1 or greater
 * between any two units.
 *
 * Gaps in the graph represent conversion factors that are unknown at the
 * time of graph construction. These are incrementally filled in on demand
 * by finding the shortest and lowest-cost conversion path between two units
 * with no direct conversion factor. The path is transformed into a direct
 * conversion factor by multiplying all factors along the path. Finally the
 * new factor is added to the graph.
 */
export class UnitFactorMap {

  readonly units: string[] = [];
  private graph: G<Rational> = {};

  constructor(factors: FactorDef[]) {
    for (const factor of factors) {
      const [ src, raw, dst ] = factor;
      const rat = typeof raw === 'string' ? new Rational(raw) : raw;

      // Convert src -> dst
      let m = this.graph[src];
      if (!m) {
        this.graph[src] = m = {};
      }
      m[dst] = rat;

      // Convert dst -> src, if an explicit mapping does not already exist.
      m = this.graph[dst];
      if (!m) {
        this.graph[dst] = m = {};
      }
      const tmp = m[src];
      if (!tmp) {
        m[src] = rat.inverse();
      }
    }
    this.units = (Object.keys(this.graph) as string[]).sort();
  }

  /**
   * Return the factor that converts units of 'src' into 'dst'.
   */
  get(src: string, dst: string): Rational | undefined {
    // Units are the same, conversion is 1
    if (src === dst) {
      return ONE;
    }

    // See if a direct conversion exists
    let fac = this.graph[src][dst];
    if (fac) {
      return fac;
    }

    // Find the shortest, lowest-cost conversion path between
    // the two factors
    const path = this.shortestPath(src, dst);
    if (path) {
      // Multiply the factors together
      fac = ONE;
      let curr: string | undefined = path[0];
      for (let i = 1; i < path.length; i++) {
        const next = path[i];
        const nextfac = this.graph[curr]![next]!;
        fac = fac.multiply(nextfac);
        curr = next;
      }

      // Record this factor in the graph
      this.graph[src]![dst] = fac;

      // If the inverse conversion factor is unknown, add it.
      const m = this.graph[dst]!;
      if (!m[src]) {
        m[src] = fac.inverse();
      }

      return fac;
    }
    // No conversion factor exists
    return undefined;
  }

  /**
   * Calculates the shortest path between a source and destination factor
   * using Dijkstra's algorithm. The cost of a path is the minimized
   * precision of the conversion factors.
   */
  protected shortestPath(src: string, dst: string): string[] | undefined {
    const heap = new Heap(cmp, [[src, 0]]);
    const edges: M<C> = {};
    edges[src] = [0, undefined];

    while (!heap.empty()) {
      const [edge, cost] = heap.pop()!;
      if (edge === dst) {
        break;
      }
      const nbr = this.graph[edge];
      if (!nbr) {
        continue;
      }

      for (const n of Object.keys(nbr)) {
        const r = nbr[n]!;
        const newcost = cost + precision(r);
        const path = edges[n];
        if (!path || newcost < path[0]) {
          edges[n] = [newcost, edge];
          heap.push([n, newcost]);
        }
      }
    }

    const res = edges[dst];
    return res ? extractpath(edges, dst) : undefined;
  }
}

/**
 * Compare edge cost
 */
const cmp = (x: E, y: E) => x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : 0;

/**
 * Return the maximum precious between the numerator and denominator
 */
const precision = (r: Rational) =>
  Math.max(r.numerator().precision(), r.denominator().precision());

/**
 * Extract the path from the edges, tracking backwards from the
 * destination node to the source.
 */
const extractpath = (edges: M<C>, dst: string) => {
  const r: string[] = [];
  for (let c: string | undefined = dst; c; c = edges[c]![1]) {
    r.unshift(c);
  }
  return r;
};
