/**
 * Generate src/factors.generated.ts from the CLDR `convertUnits` data the
 * cldr-compiler downloads (supplemental/units.json).
 *
 * Run with: pnpm --filter @phensley/unit-converter run generate-factors
 *
 * The CLDR table defines, for each unit, a `_baseUnit` and a `_factor`
 * (an arithmetic expression over `unitConstants`) such that
 * `1 unit = _factor × _baseUnit`, plus an additive `_offset` for
 * temperature. Units sharing a base unit form one dimension.
 *
 * The generated table uses a star topology per dimension: every unit is
 * connected directly to the dimension's hub (the unit whose factor is 1,
 * or the dimension's base unit when no such unit exists, e.g.
 * `cubic-meter` for volume).
 */
import * as fs from 'fs';
import * as path from 'path';

const CLDR_VERSION = '48.2.0';
const UNITS_JSON = path.join(__dirname, '..', '..', 'cldr-compiler', '.cldr', CLDR_VERSION, 'supplemental', 'units.json');

// ---------------------------------------------------------------------------
// Exact rational arithmetic over BigInt. Every CLDR factor is a product and
// quotient of finite decimals, so exact rational arithmetic loses nothing.
// ---------------------------------------------------------------------------

interface Q {
  n: bigint;
  d: bigint;
}

const B = (n: number): bigint => BigInt(n);

// Repeated multiplication: the es5 lint target forbids bigint `**` and literals.
const pow = (base: bigint, exp: bigint): bigint => {
  let r = B(1);
  for (let e = exp; e > B(0); e -= B(1)) {
    r *= base;
  }
  return r;
};

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < B(0) ? -a : a;
  b = b < B(0) ? -b : b;
  while (b !== BigInt(0)) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
};

const q = (n: bigint, d: bigint): Q => {
  if (d === BigInt(0)) {
    throw new Error('division by zero');
  }
  if (d < BigInt(0)) {
    n = -n;
    d = -d;
  }
  if (n === BigInt(0)) {
    return { n: BigInt(0), d: BigInt(1) };
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};

const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);

/** Parse a finite decimal (including scientific notation) exactly. */
const qFromDecimal = (raw: string): Q => {
  const s = raw.trim();
  const m = s.match(/^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!m) {
    throw new Error(`unparseable number: '${s}'`);
  }
  const [, sign, int, frac, exp] = m;
  let n = BigInt(int + (frac ?? ''));
  let d = pow(B(10), BigInt(frac ? frac.length : 0));
  if (exp) {
    const e = BigInt(exp);
    if (e >= 0) {
      n *= pow(B(10), e);
    } else {
      d *= pow(B(10), -e);
    }
  }
  return q(sign === '-' ? -n : n, d);
};

/** Format an exact rational: as a finite decimal when possible, else 'n / d'. */
const qToString = (x: Q): string => {
  if (x.n === B(0)) {
    return '0';
  }
  if (x.d === B(1)) {
    return x.n.toString();
  }
  // A reduced denominator of the form 2^a * 5^b renders as a finite decimal.
  let d = x.d;
  let twos = BigInt(0);
  let fives = BigInt(0);
  while (d % BigInt(2) === BigInt(0)) {
    d /= BigInt(2);
    twos += BigInt(1);
  }
  while (d % BigInt(5) === BigInt(0)) {
    d /= BigInt(5);
    fives += BigInt(1);
  }
  if (d !== BigInt(1)) {
    return `${x.n} / ${x.d}`;
  }
  const neg = x.n < B(0);
  const n = neg ? -x.n : x.n;
  // v = n / (2^a * 5^b) is a finite decimal: rescale the denominator to
  // 10^a (a >= b) or 10^b (b > a) by multiplying the numerator by the
  // missing prime power.
  const digits = twos >= fives ? n * pow(B(5), twos - fives) : n * pow(B(2), fives - twos);
  const scale = twos >= fives ? twos : fives;
  let out: string;
  if (scale === BigInt(0)) {
    out = digits.toString();
  } else {
    const intPart = digits / pow(B(10), scale);
    let fracPart = (digits % pow(B(10), scale)).toString();
    while (fracPart.length < Number(scale)) {
      fracPart = `0${fracPart}`;
    }
    out = `${intPart}.${fracPart}`;
  }
  return neg && digits !== BigInt(0) ? `-${out}` : out;
};

/**
 * The arc-minute and arc-second factors ('1/360*60', '1/360*60*60') only
 * come out correct under this grammar — 1/21600 and 1/1296000 revolution;
 * under standard left-associative math they would be off by 3600× and
 * 12,960,000×, a useful canary that this grammar is load-bearing.
 */

/**
 * Evaluate a CLDR factor expression. CLDR's formula grammar groups a '/'
 * with every term to its right: 'a/b*c' means a/(b*c). (All current
 * formulas contain at most one '/'.) This is what makes e.g. radian
 * '1/2*PI' = 1/(2π) revolutions and gallon '231*in3_to_m3' with
 * in3_to_m3 = 'ft3_to_m3/12*12*12' = ft³/1728 come out exactly right.
 */
const evalExpr = (raw: string, constants: Map<string, string>, memo: Map<string, Q>): Q => {
  const cached = memo.get(raw);
  if (cached) {
    return cached;
  }
  // Tentative value doubles as a cycle guard; overwritten on success.
  memo.set(raw, q(BigInt(1), BigInt(1)));
  const tokens = raw.match(/[a-zA-Z_][a-zA-Z_0-9]*|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[*/]/g);
  if (!tokens || tokens.length === 0) {
    throw new Error(`unparseable expression: '${raw}'`);
  }
  const value = (t: string): Q => {
    if (/^[a-zA-Z_]/.test(t)) {
      const v = constants.get(t);
      if (v === undefined) {
        throw new Error(`unknown constant '${t}' in '${raw}'`);
      }
      return evalExpr(v, constants, memo);
    }
    return qFromDecimal(t);
  };
  // Terms and operators, left to right.
  const terms: Q[] = [value(tokens[0])];
  const ops: string[] = [];
  for (let i = 1; i < tokens.length; i += 2) {
    ops.push(tokens[i]);
    terms.push(value(tokens[i + 1]));
  }
  const slash = ops.indexOf('/');
  const num = terms.slice(0, slash === -1 ? terms.length : slash + 1).reduce((p, t) => qMul(p, t), q(BigInt(1), BigInt(1)));
  const den = slash === -1 ? q(BigInt(1), BigInt(1)) : terms.slice(slash + 1).reduce((p, t) => qMul(p, t), q(BigInt(1), BigInt(1)));
  const r = qDiv(num, den);
  memo.set(raw, r);
  return r;
};

// ---------------------------------------------------------------------------
// CLDR convertUnits
// ---------------------------------------------------------------------------

export interface UnitDef {
  unit: string;
  base: string;
  factor: Q;
  offset: Q | null;
}

export interface ParsedUnits {
  units: UnitDef[];
  /** Units CLDR marks `_special` (nonlinear scales, e.g. beaufort). */
  special: string[];
}

/** Parse the supplemental/units.json document. */
export const parseConvertUnits = (json: any): ParsedUnits => {
  const constants = new Map<string, string>();
  for (const [name, def] of Object.entries(json.supplemental.unitConstants)) {
    constants.set(name, (def as any)._value as string);
  }
  const units: UnitDef[] = [];
  const special: string[] = [];
  const memo = new Map<string, Q>();
  for (const [unit, def] of Object.entries(json.supplemental.convertUnits)) {
    const d = def as any;
    if (d === null) {
      continue;
    }
    if (d._special) {
      special.push(unit);
      continue;
    }
    const u: UnitDef = {
      unit,
      base: d._baseUnit as string,
      factor: d._factor ? evalExpr(d._factor, constants, memo) : q(BigInt(1), BigInt(1)),
      offset: d._offset ? evalExpr(d._offset, constants, memo) : null,
    };
    units.push(u);
  }
  return { units, special };
};

/** Map each CLDR dimension (shared `_baseUnit`) to a public category name. */
const CATEGORY: Record<string, string> = {
  kelvin: 'temperature',
  meter: 'length',
  kilogram: 'mass',
  second: 'duration',
  year: 'duration',
  night: 'duration',
  revolution: 'angle',
  'square-revolution': 'angle',
  'square-meter': 'area',
  'cubic-meter': 'volume',
  'meter-per-second': 'speed',
  'meter-per-square-second': 'acceleration',
  'kilogram-meter-per-square-second': 'force',
  'kilogram-square-meter-per-square-second': 'energy',
  'kilogram-square-meter-per-cubic-second': 'power',
  'kilogram-per-meter-square-second': 'pressure',
  'kilogram-per-square-meter-square-second': 'pressure',
  'revolution-per-second': 'frequency',
  'per-second': 'radioactivity',
  'square-meter-per-square-second': 'radiation',
  bit: 'digital',
  item: 'substance',
  'item-per-second': 'substance',
  'item-per-kilogram': 'substance',
  pixel: 'graphics',
  em: 'graphics',
  ampere: 'electric',
  'second-ampere': 'electric',
  'kilogram-square-meter-per-cubic-second-square-ampere': 'electric',
  'cubic-second-square-ampere-per-kilogram-square-meter': 'electric',
  'kilogram-square-meter-per-cubic-second-ampere': 'electric',
  'pow4-second-square-ampere-per-kilogram-square-meter': 'electric',
  'kilogram-square-meter-per-square-second-square-ampere': 'electric',
  'kilogram-square-meter-per-square-second-ampere': 'electric',
  'kilogram-per-square-second-ampere': 'electric',
  candela: 'illuminance',
  'candela-square-meter-per-square-meter': 'illuminance',
  'candela-per-square-meter': 'illuminance',
  part: 'ratio',
};

/** A generated edge: [unit, factor, hub, offset?]. */
export type Edge = [string, string, string, string?];

/**
 * Build the star-topology factor table for every CLDR dimension. Returns a
 * category name to edge list mapping (offset only present for temperature).
 */
export const generateCategories = (json: any): Record<string, Edge[]> => {
  const { units } = parseConvertUnits(json);

  const dims = new Map<string, UnitDef[]>();
  for (const u of units) {
    if (!CATEGORY[u.base]) {
      throw new Error(`no category mapping for base unit '${u.base}' (unit '${u.unit}')`);
    }
    const members = dims.get(u.base);
    if (members) {
      members.push(u);
    } else {
      dims.set(u.base, [u]);
    }
  }

  const out: Record<string, Edge[]> = {};
  const add = (cat: string, e: Edge) => {
    (out[cat] ??= []).push(e);
  };

  for (const base of Array.from(dims.keys()).sort()) {
    const members = dims.get(base)!;
    members.sort((a, b) => (a.unit < b.unit ? -1 : a.unit > b.unit ? 1 : 0));
    const cat = CATEGORY[base];
    // Prefer a factor-1 unit with no offset (the dimension's own base, e.g.
    // kelvin for temperature). Edge offsets are re-expressed relative to the
    // hub: `m -> hub` is `v_hub = v_m * (f_m / f_h) + (o_m - o_h) / f_h`.
    const hub =
      members.find((m) => m.factor.n === BigInt(1) && m.factor.d === BigInt(1) && m.offset === null) ??
      members.find((m) => m.factor.n === BigInt(1) && m.factor.d === BigInt(1));
    if (hub) {
      for (const m of members) {
        if (m.unit === hub.unit) {
          // Singleton dimensions need a self-edge so the unit is registered.
          if (members.length === 1) {
            add(cat, [m.unit, '1', m.unit]);
          }
        } else {
          const om = m.offset ?? q(BigInt(0), BigInt(1));
          const oh = hub.offset ?? q(BigInt(0), BigInt(1));
          const off = om.n === oh.n && om.d === oh.d ? null : qDiv(qSub(om, oh), hub.factor);
          const edge: Edge = [m.unit, qToString(qDiv(m.factor, hub.factor)), hub.unit];
          if (off) {
            edge[3] = qToString(off);
          }
          add(cat, edge);
        }
      }
    } else if (members.length > 1) {
      // No unit in this dimension has factor 1 (volume's base is the
      // synthetic node `cubic-meter`); connect every unit to the base.
      for (const m of members) {
        const edge: Edge = [m.unit, qToString(m.factor), base];
        if (m.offset) {
          edge[3] = qToString(m.offset);
        }
        add(cat, edge);
      }
    } else {
      // Singleton dimension whose unit is not factor-1 (e.g. ofglucose):
      // register it with a self-edge; no other unit shares its dimension.
      add(cat, [members[0].unit, '1', members[0].unit]);
    }
  }
  return out;
};

// ---------------------------------------------------------------------------
// Rendering / CLI
// ---------------------------------------------------------------------------

const render = (cats: Record<string, Edge[]>): string => {
  const lines: string[] = [
    '// AUTO-GENERATED by scripts/generate-factors.ts — DO NOT EDIT BY HAND.',
    `// Source: CLDR ${CLDR_VERSION} supplemental/units.json (convertUnits + unitConstants).`,
    '// Regenerate: pnpm --filter @phensley/unit-converter run generate-factors',
    '//',
    '// Star topology: within each CLDR dimension (shared `_baseUnit`), every',
    '// unit is directly connected to the dimension hub (the unit with factor',
    '// 1, or the dimension base unit for volume). The optional fourth',
    '// element is the additive offset in the hub unit (temperature only).',
    "import { FactorDef } from './types';",
    '',
    'export const CLDR_FACTORS: Record<string, FactorDef[]> = {',
  ];
  const renderEdge = ([u, f, h, o]: Edge): string =>
    o ? `['${u}', '${f}', '${h}', '${o}']` : `['${u}', '${f}', '${h}']`;
  for (const cat of Object.keys(cats).sort()) {
    const edges = cats[cat];
    if (edges.length === 1) {
      lines.push(`  ${cat}: [${renderEdge(edges[0])}],`);
    } else {
      lines.push(`  ${cat}: [`);
      for (const e of edges) {
        lines.push(`    ${renderEdge(e)},`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};', '');
  return lines.join('\n');
};

const main = () => {
  if (!fs.existsSync(UNITS_JSON)) {
    console.error(`missing ${UNITS_JSON}`);
    console.error("run 'pnpm run build' (cldr-compiler download) first, then re-run this script");
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(UNITS_JSON, 'utf8'));
  const out = path.join(__dirname, '..', 'src', 'factors.generated.ts');
  fs.writeFileSync(out, render(generateCategories(json)));
  console.log(`wrote ${out}`);
};

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invoked && typeof __filename !== 'undefined' && fs.realpathSync(invoked) === fs.realpathSync(__filename)) {
  main();
}
