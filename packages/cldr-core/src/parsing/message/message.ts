import { Decimal, DecimalConstants } from '@phensley/decimal';

import {
  Argument,
  MessageCode,
  MessageOpType,
  PluralChoice,
  PluralChoiceType,
  PluralNumberType,
  SelectChoice,
} from './types';

import { Matcher, Range } from './matcher';

const enum Chars {
  LEFT = '{',
  RIGHT = '}',
  APOS = "'",
  POUND = '#'
}

export const parseMessagePattern = (raw: string, matcher: Matcher): MessageCode =>
  new MessagePatternParser(raw, matcher).parse();

// Mapping of formatter names to message operation types
const OPS: { [name: string]: MessageOpType } = {
  number: MessageOpType.DECIMAL,
  decimal: MessageOpType.DECIMAL,
  date: MessageOpType.DATE,
  time: MessageOpType.TIME,
  datetime: MessageOpType.DATETIME,
  money: MessageOpType.CURRENCY,
  currency: MessageOpType.CURRENCY
};

/**
 * Hand-implemented parser for ICU message format. Designed to be compact and
 * fast vs. other implementations.
 * The parser produces an instruction tree which can be cached for repeated
 * use, and is intended to be evaluated by a separate engine.
 *
 * Note: The 'choice' formatter is not implemented since it is deprecated.
 *
 * See ICU docs for details on syntax:
 * https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/MessageFormat.html
 *
 * Rationale
 *
 * The decision to hand-implement the parser was for 2 reasons:
 * 1. Avoiding extra runtime dependencies (parser generators, e.g. pegjs, etc)
 * 2. Provide control over the memory allocation, garbage generation, and other
 *    aspects that impact parser performance.
 *
 * A major consideration is size of the resulting parser code. The Peg.js library
 * is 98kB minified. The OpenJS project 'messageformat-parser' which uses Peg.js
 * is 30kB minified. Adding ~130kB to our library to support message parsing is
 * simply too much overhead.
 *
 * See:
 *   https://bundlephobia.com/result?p=pegjs
 *   https://unpkg.com/messageformat-parser/parser.js
 */
class MessagePatternParser {

  constructor(private raw: string, private matcher: Matcher) {
  }

  parse(): MessageCode {
    return this.outer({ s: 0, e: this.raw.length });
  }

  outer(r: Range, argsub?: Argument): MessageCode {
    // this.matcher.debug('outer', r);

    const str = this.raw;

    // Accumulate parsed instruction nodes
    const n: MessageCode[] = [];

    // Accumulate plain text characters
    let buf = '';

    // Iterate until we reach the end of this range
    while (r.s < r.e) {
      const c = str[r.s];

      // Look for characters which mark the start of a special section
      switch (c) {
        case Chars.LEFT: {
          // Push non-empty buffer
          if (buf) {
            n.push(textarg(buf, argsub));
            buf = '';
          }

          const k = this.seek(r.s, r.e);
          if (k === -1) {
            buf += str.substring(r.s, r.e);
            if (buf) {
              n.push(textarg(buf, argsub));
              buf = '';
            }
            r.s = r.e;

          } else {
            // if we have buffer, emit it
            if (buf) {
              n.push(textarg(buf, argsub));
              buf = '';
            }

            // Process tag interior
            const child = this.inner({ s: r.s + 1, e: k });
            if (!child) {
              n.push(textarg(buf, argsub));
            } else {
              n.push(child);
            }

            // Skip over processed tag
            r.s = k;
          }
          break;
        }

        case Chars.APOS: {
          if (c === str[r.s + 1]) {
            // Convert double apostrophe to single
            buf += c;
            r.s++;

          } else {
            // Capture string wrapped in apostrophes
            let k = str.indexOf(c, r.s + 1);
            if (k === -1) {
              // if no closing apostrophe found, point to end of buffer
              k = r.e;
            }

            // Since this is escaped text, push text node without substituting '#'
            n.push(text(buf + str.substring(r.s + 1, k)));
            buf = '';

            // Skip over emitted text
            r.s = k;
          }
          break;
        }

        default:
          // Append plain character to output buffer
          buf += c;
          break;
      }
      r.s++;
    }

    // Push any trailing characters
    if (buf) {
      n.push(textarg(buf, argsub));
    }

    // Flatten blocks
    return flatten(n);
  }

  inner(r: Range): MessageCode | undefined {
    // this.matcher.debug('inner', r);

    const m = this.matcher;

    // Skip any optional leading spaces
    m.spaces(r);

    // See if we have any arguments. we must have at least one or
    // we fail this tag.
    const args = m.arguments(r);
    if (!args) {
      return undefined;
    }

    // Check if we're done..
    if (!m.spaces(r) || m.complete(r)) {
      // We have a simple argument.
      return [MessageOpType.ARG, args[0]];
    }

    // See if any of our known formatters are present
    const name = m.formatter(r);
    if (!name) {
      return undefined;
    }
    m.spaces(r);

    // Execute logic to parse instructions by type
    switch (name) {
      case 'plural':
      case 'selectordinal':
        const type = name === 'plural' ? PluralNumberType.CARDINAL : PluralNumberType.ORDINAL;
        return this.plural(args[0], type, m, r);

      case 'select':
        return this.select(args[0], m, r);

      default:
        const op = OPS[name];
        if (op !== undefined) {
          return this.simple(args, op, m, r);
        }
        break;
    }

    // This code should never be reached if the 'name' corresponds
    // to a valid formatter.
    return NOOP;
  }

  /**
   * Parse a nested tag sequence '{' ... '}'
   */
  tag(m: Matcher, r: Range, argsub?: Argument): MessageCode | undefined {
    // m.debug('  tag', r);

    m.spaces(r);

    // Ensure we see a tag start next
    if (m.char(r) !== Chars.LEFT) {
      return undefined;
    }

    // Parse inner message
    const k = this.seek(r.s, r.e);
    if (k === -1) {
      return undefined;
    }

    // Parse nested block and skip over it
    const node = this.outer({ s: r.s + 1, e: k }, argsub);
    r.s = k + 1;
    return node;
  }

  /**
   * Parse a plural instruction.
   */
  plural(arg: Argument, type: PluralNumberType, m: Matcher, r: Range): MessageCode {

    // See if we have an offset argument
    const offset = m.pluralOffset(r);
    m.spaces(r);

    const choices: PluralChoice[] = [];
    do {
      // Parse a plural choice
      const choice = m.pluralChoice(r);
      if (!choice) {
        break;
      }

      // Parse a tag into a block of instructions
      const block = this.tag(m, r, arg);
      if (!block) {
        return NOOP;
      }

      // Determine which choice node to construct
      let node: PluralChoice;
      if (choice[0] === '=') {

        // Conver the exact match into a Decimal type
        const num = choice.substring(1);
        let value = DECIMAL_EXACT[num];
        if (!value) {
          value = new Decimal(num);
        }
        node = [PluralChoiceType.EXACT, value, block];
      } else {

        // Plural category match
        node = [PluralChoiceType.CATEGORY, choice, block];
      }

      // Append and skip spaces
      choices.push(node);
      m.spaces(r);
    } while (!m.complete(r));

    // If we parsed no choices, emit a no-op
    return choices.length ?
      [MessageOpType.PLURAL, arg, offset, type, choices] : NOOP;
  }

  /**
   * Parse a select instruction.
   */
  select(arg: Argument, m: Matcher, r: Range): MessageCode {
    const choices: SelectChoice[] = [];
    do {
      // Parse an identifier to be used as the select choice
      const ident = m.identifier(r);
      if (!ident) {
        break;
      }

      // Parse a tag into a block of instructions
      const block = this.tag(m, r, arg);
      if (!block) {
        return NOOP;
      }

      // Append and skip to the next choice
      choices.push([ident, block]);
      m.spaces(r);

    } while (!m.complete(r));

    // If we parsed no choices, just emit a no-op
    return choices.length ?
      [MessageOpType.SELECT, arg, choices] : NOOP;
  }

  /**
   * Simple single-argument formatter.
   */
  simple(args: Argument[], op: MessageOpType, m: Matcher, r: Range): MessageCode {
    m.spaces(r);

    const style = m.identifier(r);
    if (style === undefined) {
      return NOOP;
    }

    switch (op) {
      case MessageOpType.DATETIME_INTERVAL:
        return [op, args, style];

      case MessageOpType.CURRENCY:
      case MessageOpType.DECIMAL:
      case MessageOpType.DATE:
      case MessageOpType.TIME:
      case MessageOpType.DATETIME:
        return [op, args[0], style];

      default:
        return NOOP;
    }
  }

  /**
   * Seek to the matching '}' character at the same nesting level,
   * skipping over any apostrophes. This adds some redundant scanning
   * of the string but simplifies some of the parsing logic in other
   * areas. It ensures we're always dealing with a well-formed tag
   * where all '{' have a corresponding '}'.
   */
  seek(i: number, j: number): number {
    const r = this.raw;
    let d = 0; // Track nesting depth

    loop:
    while (i < j) {
      const c = r[i];
      switch (c) {
        case Chars.LEFT:
          // Increase depth
          d++;
          break;

        case Chars.RIGHT:

          // Reduce depth
          d--;
          if (!d) {
            // Depth is zero, we're done
            break loop;
          }
          break;

        case Chars.APOS:
          if (c === r[i + 1]) {
            // Skip single escaped apostrophe
            i++;
          } else {
            // Find matching apostrophe
            const k = r.indexOf(c, i + 1);
            if (k === -1) {
              // No apostrophe, assume rest of string is escaped
              return -1;
            }
            // Skip over matching apostrophe
            i = k;
          }
          break;
      }

      i++;
    }

    // If we still have un-matched characters, return -1
    return d ? -1 : i;
  }
}

const flatten = (n: MessageCode[]): MessageCode =>
  !n.length ? NOOP : n.length === 1 ? n[0] : [MessageOpType.BLOCK, n];

const text = (s: string): MessageCode => [MessageOpType.TEXT, s];

// Save a bit of processing of common exact matches
const DECIMAL_EXACT: { [n: string]: Decimal } = {
  0: DecimalConstants.ZERO,
  1: DecimalConstants.ONE,
  2: DecimalConstants.TWO
};

/**
 * Emit a text node, performing argument substitution for all occurrences of
 * the '#' character.
 */
const textarg = (s: string, argsub?: Argument): MessageCode => {
  let i = 0;
  let j = 0;

  // If no argument substitution is requested, return plain text
  if (argsub === undefined) {
    return text(s);
  }

  // If no '#' character is found, return plain text
  j = s.indexOf(Chars.POUND);
  if (j === -1) {
    return text(s);
  }

  // Here 'j' points to position of '#'

  // We need to perform substitution on each occurrence of '#' in the
  // string and return a block.
  const len = s.length;
  const n: MessageCode[] = [];

  // Loop, substituing an arg node for each occurrence of '#'
  while (j !== -1) {
    // Push leading text
    if (i < j) {
      n.push(text(s.substring(i, j)));
    }

    // Add a substitution
    n.push([MessageOpType.ARG, argsub!]);

    // Skip over '#' and search for next occurrence
    i = j + 1;
    j = s.indexOf(Chars.POUND, i);
  }

  // Push trailing text
  if (i < len) {
    n.push(text(s.substring(i)));
  }

  return flatten(n);
};

const NOOP: MessageCode = [MessageOpType.NOOP];
