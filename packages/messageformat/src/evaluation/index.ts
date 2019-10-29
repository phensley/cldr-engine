import { Decimal, DecimalConstants } from '@phensley/decimal';
import { pluralRules } from '@phensley/plurals';
import {
  MessageCode,
  MessageOpType,
  PluralChoiceType,
  PluralNumberType,
} from '../parser';

export type MessageArg = boolean | number | string | Decimal | object;

export type MessageNamedArgs = {
  [s: string]: MessageArg;
  [n: number]: MessageArg;
};

export type MessageArgs = (MessageArg | MessageNamedArgs)[];

export type MessageFormatFunc =
  (args: MessageArg[], options: string[]) => string;

export type MessageFormatFuncMap = { [name: string]: MessageFormatFunc };

/**
 * Merge positional and named arguments together.
 */
const merge = (...args: (MessageArg | MessageNamedArgs)[]) => {
  let merged: MessageNamedArgs = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (typeof arg) {
      case 'number':
      case 'string':
        merged[i] = arg;
        break;
      case 'object':
        if (arg instanceof Decimal || arg instanceof Date) {
          merged[i] = arg;
        // } else if (arg['date'] !== undefined) {
        //   merged[i] = arg as ZonedDateTime;
        } else {
          merged = { ...merged, ...(arg as MessageNamedArgs) };
        }
        break;
    }
  }
  return merged;
};

/**
 * Select always compares its argument as a string.
 */
const asstring = (arg: MessageArg) => {
  switch (typeof arg) {
    case 'string':
      return arg;
    case 'number':
    case 'boolean':
      return arg.toString();
    case 'object':
      if (arg instanceof Decimal) {
        return arg.toString();
      }
      break;
  }
  return '';
};

/**
 * Plural computes the plural category of its argument.
 */
const asdecimal = (arg: MessageArg) => {
  switch (typeof arg) {
    case 'string':
    case 'number':
      return new Decimal(arg);
    case 'boolean':
      return arg ? DecimalConstants.ONE : DecimalConstants.ZERO;
    case 'object':
      if (arg instanceof Decimal) {
        return arg;
      }
      break;
  }
  return DecimalConstants.ZERO;
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

  evaluate(...args: MessageArgs): string {
    const merged = merge(...args);
    return this._evaluate(this.code, merged);
  }

  private _evaluate(code: MessageCode, args: MessageNamedArgs): string {
    switch (code[0]) {
      case MessageOpType.TEXT:
        this.buf += code[1];
        break;

      case MessageOpType.BLOCK:
        for (const n of code[1]) {
          this._evaluate(n, args);
        }
        break;

      case MessageOpType.ARG: {
        const arg = args[code[1]];
        this.buf += asstring(arg);
        break;
      }

      case MessageOpType.PLURAL: {
        const key = code[1][0];
        const arg = args[key];
        const offset = code[2];
        const num = asdecimal(arg);
        const ops = (offset ? num.subtract(offset) : num).operands();
        const category = code[3] === PluralNumberType.CARDINAL ?
          pluralRules.cardinal(this.language, ops) :
          pluralRules.ordinal(this.language, ops);

        let other: MessageCode | undefined;
        let found = 0;

        loop:
        for (const c of code[4]) {
          switch (c[0]) {
            case PluralChoiceType.EXACT:
              if (num.compare(c[1]) === 0) {
                this._evaluate(c[2], args);
                found = 1;
                break loop;
              }
              break;

            case PluralChoiceType.CATEGORY:
              if (c[1] === category) {
                this._evaluate(c[2], args);
                found = 1;
                break loop;
              } else if (c[1] === 'other') {
                other = c[2];
              }
              break;
        }

        }
        if (!found && other) {
          this._evaluate(other, args);
        }
        break;
      }

      case MessageOpType.SELECT: {
        const key = code[1][0];
        const arg = args[key];
        const str = asstring(arg);

        let other: MessageCode | undefined;
        let found = 0;

        loop:
        for (const c of code[2]) {
          if (c[0] === str) {
            this._evaluate(c[1], args);
            found = 1;
            break loop;
          }
          if (c[0] === 'other') {
            other = c[1];
          }
        }
        if (!found && other) {
          this._evaluate(other, args);
        }
        break;
      }

      case MessageOpType.SIMPLE: {
        const name = code[1];
        const f = this.formatters[name];
        if (f !== undefined) {
          const _args = code[2].map(key => args[key]);
          this.buf += f(_args, code[3]);
        }
        break;
      }
    }
    return this.buf;
  }
}
