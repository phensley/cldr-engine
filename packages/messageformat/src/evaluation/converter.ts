import { Decimal, DecimalConstants } from '@phensley/decimal';
import { MessageArg } from './args';

/**
 * Interface for argument converters.
 *
 * @public
 */
export interface MessageArgConverter {
  asString(arg: MessageArg | undefined): string;
  asDecimal(arg: MessageArg | undefined): Decimal;
}

/**
 * Converts arguments to string or Decimal.
 *
 * @public
 */
export class DefaultMessageArgConverter implements MessageArgConverter {
  /**
   * Convert to a string if possible.
   */
  asString(arg: MessageArg | undefined): string {
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
  }

  /**
   * Convert to a Decimal if possible, or zero.
   */
  asDecimal(arg: MessageArg | undefined): Decimal {
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
  }
}
