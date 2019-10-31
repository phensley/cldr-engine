import { Decimal, DecimalConstants } from '@phensley/decimal';
import { pluralRules } from '@phensley/plurals';
import { asdecimal, asstring, MessageArg, MessageArgs, MessageNamedArgs } from './args';
import {
  MessageCode,
  MessageOpType,
  PluralChoiceType,
  PluralNumberType,
} from '../parser';

export type MessageFormatFunc =
  (args: MessageArg[], options: string[]) => string;

export type MessageFormatFuncMap = { [name: string]: MessageFormatFunc };

const get = (key: number | string, args: MessageArgs): MessageArg => {
  const res: MessageArg = args.named[key];
  return res !== undefined ? res : (typeof key === 'number' ? args.positional[key] : undefined);
};

// Save a bit of processing of common exact matches
const DECIMAL_EXACT: { [n: string]: Decimal } = {
  0: DecimalConstants.ZERO,
  1: DecimalConstants.ONE,
  2: DecimalConstants.TWO
};

/**
 * Evaluates a message format against a set of arguments, producing a string.
 */
export class MessageEngine {

  private buf: string = '';

  constructor(
    private language: string,
    private formatters: MessageFormatFuncMap,
    private code: MessageCode) { }

  evaluate(positional: MessageArg[], named: MessageNamedArgs = {}): string {
    return this._evaluate(this.code, { positional, named });
  }

  private _evaluate(code: MessageCode, args: MessageArgs, argsub?: MessageArg): string {
    switch (code[0]) {
      case MessageOpType.TEXT:
        this.buf += code[1];
        break;

      case MessageOpType.BLOCK:
        for (const n of code[1]) {
          this._evaluate(n, args, argsub);
        }
        break;

      case MessageOpType.ARG: {
        const arg = get(code[1], args);
        this.buf += asstring(arg);
        break;
      }

      case MessageOpType.ARGSUB: {
        if (argsub !== undefined) {
          this.buf += asstring(argsub);
        }
        break;
      }

      case MessageOpType.PLURAL: {
        const arg = get(code[1][0], args);
        const offset = code[2];
        const num = asdecimal(arg);
        argsub = offset ? num.subtract(offset) : num;
        const ops = argsub.operands();
        const category = code[3] === PluralNumberType.CARDINAL ?
          pluralRules.cardinal(this.language, ops) :
          pluralRules.ordinal(this.language, ops);

        let other: MessageCode | undefined;
        let found = 0;

        loop:
        for (const c of code[4]) {
          switch (c[0]) {
            case PluralChoiceType.EXACT:
              let v = DECIMAL_EXACT[c[1]];
              if (v === undefined) {
                v = asdecimal(c[1]);
              }
              if (num.compare(v) === 0) {
                this._evaluate(c[2], args, num);
                found = 1;
                break loop;
              }
              break;

            case PluralChoiceType.CATEGORY:
              if (c[1] === category) {
                this._evaluate(c[2], args, argsub);
                found = 1;
                break loop;

              } else if (c[1] === 'other') {
                // Capture the 'other' as a fallback
                other = c[2];
              }
              break;
          }

        }

        // If no match and 'other' exists, emit that value.
        if (!found && other) {
          this._evaluate(other, args, argsub);
        }
        break;
      }

      case MessageOpType.SELECT: {
        const arg = get(code[1][0], args);
        const str = asstring(arg);

        let other: MessageCode | undefined;
        let found = 0;

        loop:
        for (const c of code[2]) {
          if (c[0] === str) {
            this._evaluate(c[1], args, arg);
            found = 1;
            break loop;
          }

          if (c[0] === 'other') {
            // Capture the 'other' as a fallback
            other = c[1];
          }
        }

        // If no match and 'other' exists, emit that value.
        if (!found && other) {
          this._evaluate(other, args, arg);
        }
        break;
      }

      case MessageOpType.SIMPLE: {
        // One or more arguments and zero or more options
        const name = code[1];
        const f = this.formatters[name];
        if (f !== undefined) {
          const _args = code[2].map(k => get(k, args));
          this.buf += f(_args, code[3]);
        }
        break;
      }
    }
    return this.buf;
  }
}
