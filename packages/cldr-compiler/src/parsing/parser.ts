import { just, nothing, IMaybe } from './maybe';
import { pair, Pair } from './pair';

const cons = <T>(x: T, xs: T[]): T[] => [x].concat(xs);

/**
 * Function that matches on some input, driving the parser.
 */
export interface IParseFunction<T> {
  (s: string): IMaybe<Pair<T, string>>;
}

/**
 * Basic parser combinator.
 */
export class Parser<T> {

  parse: IParseFunction<T>;

  constructor(parse: IParseFunction<T>) {
    this.parse = parse;
  }

  prefix<R>(parser: Parser<R>): Parser<T> {
    return parser.flatMap(_o => this);
  }

  suffix(parser: Parser<any>): Parser<T> {
    return this.flatMap(t => parser.map(_o => t));
  }

  map<R>(f: (value: T) => R): Parser<R> {
    return new Parser<R>(s => this.parse(s).map(p => pair(f(p._1), p._2)));
  }

  flatMap<R>(f: (value: T) => Parser<R>): Parser<R> {
    return new Parser<R>(s => this.parse(s).flatMap(p => f(p._1).parse(p._2)));
  }

  zeroOrMore(): Parser<T[]> {
    return this.oneOrMore().orDefault([]);
  }

  oneOrMore(): Parser<T[]> {
    return this.flatMap(x => this.zeroOrMore().map(xs => cons(x, xs)));
  }

  or<R>(alt: Parser<R>): Parser<T | R> {
    return new Parser<T | R>(s => this.parse(s).orElse(() => alt.parse(s)));
  }

  orDefault<R>(value: R): Parser<T | R> {
    return new Parser<T | R>(s => this.parse(s).orElse(() => just(pair(value, s))));
  }

  separatedBy<R>(delimiter: Parser<R>): Parser<T[]> {
    const skipped = this.prefix(delimiter);
    return this.flatMap(t => skipped.zeroOrMore().map(ts => cons(t, ts)));
  }
}

export const matcher = (pattern: RegExp) => new Parser<string>(s => {
  const m = s.match(pattern);
  return m === null ? nothing : just(pair(m[0], s.slice(m[0].length)));
});
