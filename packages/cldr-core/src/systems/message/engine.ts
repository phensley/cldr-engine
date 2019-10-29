import { Decimal, DecimalConstants } from '@phensley/decimal';
import {
  MessageCode,
  MessageOpType,
  PluralChoiceType,
  PluralNumberType,
} from '../../parsing/message/types';
import { ZonedDateTime } from '../../common';
import { CalendarDate } from '../calendars';
import { pluralRules } from '../plurals';

export type MessageArg = boolean | number | string | Decimal | Date | ZonedDateTime | CalendarDate;

export type MessageNamedArgs = {
  [s: string]: MessageArg;
  [n: number]: MessageArg;
};

export type MessageArgs = (MessageArg | MessageNamedArgs)[];

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
        if (arg instanceof Decimal || arg instanceof Date || arg instanceof CalendarDate) {
          merged[i] = arg;
        } else if (arg['date'] !== undefined) {
          merged[i] = arg as ZonedDateTime;
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

  constructor(private language: string, private code: MessageCode) { }

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
        const arg = args[code[1]];
        const offset = code[2];
        const num = asdecimal(arg);
        const ops = (offset ? num.subtract(offset) : num).operands();
        const category = code[3] === PluralNumberType.CARDINAL ?
          pluralRules.cardinal(this.language, ops) :
          pluralRules.ordinal(this.language, ops);

        let other: MessageCode | undefined;
        let found = false;
        loop:
        for (const c of code[4]) {
          switch (c[0]) {
            case PluralChoiceType.EXACT:
              if (num.compare(c[1]) === 0) {
                this._evaluate(c[2], args);
                found = true;
                break loop;
              }
              break;

            case PluralChoiceType.CATEGORY:
              if (c[1] === category) {
                this._evaluate(c[2], args);
                found = true;
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
        const arg = args[code[1]];
        const str = asstring(arg);
        for (const c of code[2]) {
          if (c[0] === str) {
            this._evaluate(c[1], args);
            break;
          }
        }
        break;
      }
    }
    return this.buf;
  }
}
