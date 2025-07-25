import {
  Argument,
  MessageCode,
  MessageOpType,
  PluralChoice,
  PluralChoiceType,
  PluralNumberType,
  SelectChoice,
} from './types';

import { MessageMatcher, MessageState } from './matcher';

const enum Chars {
  LEFT = '{',
  RIGHT = '}',
  MINUS = '-',
  APOS = "'",
  POUND = '#',
}

/**
 * Parses a string into message code. The result can be used to evaluate the
 * message or serialized to JSON for later evaluation.
 *
 * @public
 */
export const parseMessagePattern = (raw: string, matcher: MessageMatcher, disableEscapes?: boolean): MessageCode =>
  new MessagePatternParser(raw, matcher, disableEscapes).parse();

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
 * A major consideration is size of the resulting parser code. The OpenJS project
 * 'messageformat-parser' which is generated by Peg.js is 30kB minified. It also
 * requires other dependencies for the plural calculations, where this is already
 * supported in our library via @phensley/plurals
 *
 * See:
 *   https://unpkg.com/messageformat-parser/parser.js
 */
class MessagePatternParser {
  constructor(
    private raw: string,
    private matcher: MessageMatcher,
    private disableEscapes?: boolean,
  ) {}

  parse(): MessageCode {
    const t = this.raw;
    return this.outer({ t, s: 0, e: t.length });
  }

  outer(r: MessageState, argsub?: Argument): MessageCode {
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
          const hidden = str[r.s + 1] === Chars.MINUS;

          const k = this.seek(r.s, r.e);
          if (k === -1) {
            n.push(textarg(str.substring(r.s, r.e), argsub));
            r.s = r.e;
          } else if (hidden) {
            // Tag is hidden from processor, emit as text
            n.push(text(Chars.LEFT + str.substring(r.s + 2, k + 1)));

            // Skip over hidden tag
            r.s = k;
          } else {
            // Process tag interior
            const child = this.inner({ t: r.t, s: r.s + 1, e: k });
            if (!child) {
              // If we're not in the outermost scope, push text
              if (argsub !== undefined && r.s + 1 !== k) {
                n.push(textarg(str.substring(r.s + 1, k), argsub));
              }
            } else {
              n.push(child);
            }

            // Skip over processed tag
            r.s = k;
          }
          break;
        }

        case Chars.APOS: {
          if (this.disableEscapes) {
            buf += c;
          } else {
            if (c === str[r.s + 1]) {
              // Convert double apostrophe to single
              buf += c;
              r.s++;
            } else {
              // Skip over apostrophe
              r.s++;

              // Capture string wrapped in apostrophes
              let k = str.indexOf(c, r.s);
              if (k === -1) {
                k = r.e;
              }

              // Since this is escaped text, push text node without substituting '#'
              buf += str.substring(r.s, k);

              // Skip over escaped text
              r.s = k;
            }
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

  inner(r: MessageState): MessageCode | undefined {
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
        return this.plural(args, type, m, r);

      case 'select':
        return this.select(args, m, r);

      default:
        return this.simple(args, name, m, r);
    }

    // This code should never be reached if the 'name' corresponds
    // to a valid formatter.
    /* istanbul ignore next -- @preserve */
    return NOOP;
  }

  /**
   * Parse a nested tag sequence '{' ... '}'
   */
  tag(m: MessageMatcher, r: MessageState, argsub?: Argument): MessageCode | undefined {
    // m.debug('  tag', r);
    m.spaces(r);

    // Ensure we see a tag start next
    if (m.char(r) !== Chars.LEFT) {
      return undefined;
    }

    const hidden = this.raw[r.s + 1] === Chars.MINUS;

    // Find matching end delimter
    const k = this.seek(r.s, r.e);

    // Note this can never be -1 since to get into
    // this code we must have parsed balanced '{' and '}' above.
    // if (k === -1) {
    //   return undefined;
    // }

    // Parse nested block and skip over it
    const node = hidden
      ? text(Chars.LEFT + this.raw.substring(r.s + 2, k + 1))
      : this.outer({ t: r.t, s: r.s + 1, e: k }, argsub);
    r.s = k + 1;
    return node;
  }

  /**
   * Parse a plural instruction.
   */
  plural(args: Argument[], type: PluralNumberType, m: MessageMatcher, r: MessageState): MessageCode {
    // m.debug('plural', r);

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
      const block = this.tag(m, r, args[0]);
      if (!block) {
        return NOOP;
      }

      // Determine which choice node to construct
      let node: PluralChoice;
      if (choice[0] === '=') {
        const num = choice.substring(1);
        node = [PluralChoiceType.EXACT, num, block];
      } else {
        // Plural category match
        node = [PluralChoiceType.CATEGORY, choice, block];
      }

      // Append and skip spaces
      choices.push(node);
      m.spaces(r);
    } while (!m.complete(r));

    // If we parsed no choices, emit a no-op
    return choices.length ? [MessageOpType.PLURAL, args, offset, type, choices] : NOOP;
  }

  /**
   * Parse a select instruction.
   */
  select(args: Argument[], m: MessageMatcher, r: MessageState): MessageCode {
    const choices: SelectChoice[] = [];
    do {
      // Parse an identifier to be used as the select choice
      const ident = m.identifier(r);
      if (!ident) {
        break;
      }

      // Parse a tag into a block of instructions
      const block = this.tag(m, r, args[0]);
      if (!block) {
        return NOOP;
      }

      // Append and skip to the next choice
      choices.push([ident, block]);
      m.spaces(r);
    } while (!m.complete(r));

    // If we parsed no choices, just emit a no-op
    return choices.length ? [MessageOpType.SELECT, args, choices] : NOOP;
  }

  /**
   * Simple single-argument formatter with zero or more options.
   */
  simple(args: Argument[], name: string, m: MessageMatcher, r: MessageState): MessageCode {
    const options = m.options(r);
    return [MessageOpType.SIMPLE, name, args, options];
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

    loop: while (i < j) {
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

    // Add a substitution op
    n.push([MessageOpType.ARGSUB]);

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
