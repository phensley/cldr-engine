// A range of characters [s, e) (from 's' up to but not including 'e')
export interface Range {
  s: number;
  e: number;
}

const patterns = {
  identifier: /[^\u0009-\u000d \u0085\u200e\u200f\u2028\u2029\u0021-\u002f\u003a-\u0040\u005b-\u005e\u0060\u007b-\u007e\u00a1-\u00a7\u00a9\u00ab\u00ac\u00ae\u00b0\u00b1\u00b6\u00bb\u00bf\u00d7\u00f7\u2010-\u2027\u2030-\u203e\u2041-\u2053\u2055-\u205e\u2190-\u245f\u2500-\u2775\u2794-\u2bff\u2e00-\u2e7f\u3001-\u3003\u3008-\u3020\u3030\ufd3e\ufd3f\ufe45\ufe46]+/.source,

  option: /[^\s,\{\}]+/.source,

  // explicit or plural category
  pluralChoice: /(=\d+(\.\d+)?)|zero|one|two|few|many|other/.source
};

export interface Matcher {
  // debug(msg: string, r: Range): void;
  char(r: Range): string;
  complete(r: Range): boolean;
  spaces(r: Range): boolean;
  arguments(r: Range): (number | string)[] | undefined;
  identifier(r: Range): string | undefined;
  options(r: Range): string[];
  formatter(r: Range): string | undefined;
  pluralOffset(r: Range): number;
  pluralChoice(r: Range): string | undefined;
}

// This library supports these operations by default.
const BUILTINS = 'plural|select(ordinal)?|';

/**
 * Matches against a substring defined by the [start, end) range
 * argument. When a match occurs it updates the range's start pointer. This
 * allows a single matcher instance to be used to match positions recursively.
 *
 * For example, while the outer block is being parsed at [0, 74] the inner
 * block at [24, 73] can be recursively parsed using the same matcher, with
 * the corresponding parse positions maintained in a range object within each
 * stack frame.
 *
 *   "{gender, select, female {guests plural one {her guest} other {her guests}}"
 */
export class StickyMatcher implements Matcher {

  private _space: RegExp;
  private _arg: RegExp;
  private _ident: RegExp;
  private _option: RegExp;
  private _fmt: RegExp;
  private _offset: RegExp;
  private _choice: RegExp;

  constructor(protected str: string, formatters: string[], compile: regexpFunc) {
    this._space = compile('[,\\s]+');
    this._arg = compile(`(0[1..9]+|\\d+|${patterns.identifier})`);
    this._ident = compile(patterns.identifier);
    this._option = compile(patterns.option);
    this._fmt = compile(`(${BUILTINS}${formatters.join('|')})`);
    this._offset = compile(/offset:\d+/.source);
    this._choice = compile(patterns.pluralChoice);
  }

  // Debug helper during development.
  // debug(msg: string, r: Range): void {
  //   const pos = [r.s, r.e].map(n => n.toString().padStart(4));
  //   const sub = JSON.stringify(this.str.substring(r.s, r.e));
  //   console.log(`${msg} [${pos[0]}, ${pos[1]}] => ${sub}`);
  // }

  char(r: Range): string {
    return this.str[r.s];
  }

  complete(r: Range): boolean {
    return r.e === r.s;
  }

  spaces(r: Range): boolean {
    return this.match(this._space, r) !== undefined;
  }

  arguments(r: Range): (number | string)[] | undefined {
    let args: (number | string)[] | undefined;
    do {
      const arg = this.match(this._arg, r);
      if (!arg) {
        break;
      }

      const n = parseInt(arg, 10);
      if (!args) {
        args = [];
      }
      args.push(Number.isFinite(n) ? n : arg);

      // Tuple arguments are separated by a single semicolon
      if (this.str[r.s] !== ';') {
        break;
      }
      r.s++;
    } while (!this.complete(r));
    return args;
  }

  identifier(r: Range): string | undefined {
    return this.match(this._ident, r);
  }

  options(r: Range): string[] {
    const options: string[] = [];
    do {
      this.spaces(r);
      const opt = this.match(this._option, r);
      if (!opt) {
        break;
      }
      options.push(opt);
    } while (!this.complete(r));
    return options;
  }

  formatter(r: Range): string | undefined {
    return this.match(this._fmt, r);
  }

  pluralChoice(r: Range): string | undefined {
    return this.match(this._choice, r);
  }

  pluralOffset(r: Range): number {
    let n = 0;
    const m = this.match(this._offset, r);
    if (m) {
      // This must parse successfully since it is constrained by the regexp match
      n = parseInt(m.split(':')[1], 10);
    }
    return n;
  }

  /**
   * Attempt to match the pattern at the given starting location. If a
   * match is found, move the start pointer and return the string.
   * Otherwise return undefined.
   */
  match(pattern: RegExp, r: Range): string | undefined {
    pattern.lastIndex = r.s;
    const raw = pattern.exec(this.str);
    if (raw) {
      // set the start of range to the sticky index
      r.s = pattern.lastIndex;
      return raw[0];
    }
    return undefined;
  }

}

/**
 * Implementation of matcher for browsers that do not support sticky regexps.
 * We anchor all patterns to the start of the string, then match against
 * a substring [start, end].
 */
export class SubstringMatcher extends StickyMatcher {

  match(pattern: RegExp, r: Range): string | undefined {
    pattern.lastIndex = 0;
    const s = this.str.substring(r.s, r.e);
    const raw = pattern.exec(s);
    if (raw) {
      // skip ahead by the number of characters matched
      r.s += pattern.lastIndex;
      return raw[0];
    }
    return undefined;
  }

}

/**
 * Check if the current JS runtime supports sticky RegExp flag.
 */
const hasStickyRegexp = (() => {
  try {
    const r = new RegExp('.', 'y');
    return r && true;
  } catch (e) {
    /* istanbul ignore next */
    return false;
  }
})();

export type regexpFunc = (pattern: string) => RegExp;
export const stickyRegexp = (pattern: string) => new RegExp(pattern, 'y');
export const substringRegexp = (pattern: string) => new RegExp('^' + pattern, 'g');

/**
 * Constructs the right instance of matcher based on the runtime environment's
 * support of sticky regexp, while allowing substring matcher to be selected for
 * testing.
 */
export const buildMessageMatcher = (raw: string, names: string[], sticky: boolean = hasStickyRegexp) =>
  new (sticky ? StickyMatcher : SubstringMatcher)(raw, names, sticky ? stickyRegexp : substringRegexp);
