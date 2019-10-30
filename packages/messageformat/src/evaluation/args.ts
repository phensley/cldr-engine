import { Decimal, DecimalConstants } from '@phensley/decimal';

/**
 * An argument value can have any type. We cast at the time of evaluation.
 * This allows us to accept rich arguments for user-defined custom formatters.
 */
export type MessageArg = any;

/**
 * Named args where each argument is given an explicit associative index or name.
 * These can override positional arguments.
 */
export type MessageNamedArgs = {
  [s: string]: MessageArg;
  [n: number]: MessageArg;
};

/**
 * Combined positional and named arguments.
 */
export type MessageArgs = {
  positional: MessageArg[];
  named: MessageNamedArgs;
};

/**
 * Convert to a string if possible.
 */
export const asstring = (arg: MessageArg | undefined): string => {
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
 * Convert to a Decimal if possible, or zero.
 */
export const asdecimal = (arg: MessageArg): Decimal => {
  switch (typeof arg) {
    case 'string':
      try {
        return new Decimal(arg);
      } catch (e) {
        return DecimalConstants.NAN;
      }
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
  return DecimalConstants.NAN;
};
