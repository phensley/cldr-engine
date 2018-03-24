import { NumberFormatOptions } from '../../common';
import { Decimal, RoundingModeType } from  '../../types/numbers';
import { NumberPattern } from '../../parsing/patterns/number';

/**
 * Provides a context to set number formatting parameters, combining user-supplied
 * options with defaults based on modes and the number pattern.
 */
export class NumberContext {

  readonly options: NumberFormatOptions;
  roundingMode: RoundingModeType;
  useSignificant: boolean;

  minInt: number;
  maxFrac: number;
  minFrac: number;
  maxSig: number = -1;
  minSig: number = -1;
  currencyDigits: number = -1;

  constructor(options: NumberFormatOptions, compact: boolean, currencyDigits: number = -1) {
    const o = options;
    this.options = o;
    this.roundingMode = options.round || 'half-even';
    this.currencyDigits = currencyDigits;

    // Determine if we should use default or significant digit modes. If we're in compact mode
    // we will use significant digits unless any fraction option is set. Otherwise we use
    // significant digits if any significant digit option is set.
    const optFrac = o.minimumFractionDigits !== undefined || o.maximumFractionDigits !== undefined;
    const optSig = o.minimumSignificantDigits !== undefined || o.maximumSignificantDigits !== undefined;
    this.useSignificant = (compact && !optFrac) || optSig;
  }

  /**
   * Set a pattern.
   */
  setPattern(pattern: NumberPattern): void {
    this._setPattern(pattern, -1, -1, -1);
  }

  /**
   * Set a compact pattern.
   */
  setCompact(pattern: NumberPattern, integerDigits: number, divisor: number, maxFracDigits: number = -1): void {
    let maxSigDigits = Math.max(pattern.minInt, integerDigits);
    if (integerDigits === 1) {
      maxSigDigits++;
    }
    this._setPattern(pattern, maxSigDigits, 1, maxFracDigits);
  }

  /**
   * Adjust the scale of the number using the resolved parameters.
   */
  adjust(n: Decimal): Decimal {
    if (this.useSignificant && this.minSig > 0 && this.maxSig > 0) {
      if (n.precision() > this.maxSig) {
        // Scale the number to have at most the maximum significant digits.
        const scale = this.maxSig - n.precision() + n.scale();
        n = n.setScale(scale, this.roundingMode);
      }

      // Ensure that one less digit is emitted if the number is exactly zero.
      n = n.stripTrailingZeros();
      const zero = n.signum() === 0;
      let precision = n.precision();
      if (zero && n.scale() === 1) {
        precision--;
      }

      // scale the number to have at least the minimum significant digits
      if (precision < this.minSig) {
        const scale = this.minSig - precision + n.scale();
        n = n.setScale(scale, this.roundingMode);
      }

    } else {
      // Precise control over number of integer and decimal digits to include, e.g. when
      // formatting exact currency values.
      const scale = Math.max(this.minFrac, Math.min(n.scale(), this.maxFrac));

      n = n.setScale(scale, this.roundingMode);
      n = n.stripTrailingZeros();

      // Ensure minimum fraction digits is met.
      if (n.scale() < this.minFrac) {
        n = n.setScale(this.minFrac, this.roundingMode);
      }
    }

    return n;
  }

  /**
   * Set context parameters from options, pattern and significant digit arguments.
   */
  private _setPattern(pattern: NumberPattern, maxSigDigits: number, minSigDigits: number, maxFracDigits: number): void {

    const o = this.options;

    this.minInt = orDefault(o.minimumIntegerDigits, pattern.minInt);
    this.minFrac = this.currencyDigits === -1 ? pattern.minFrac : this.currencyDigits;
    this.maxFrac = this.currencyDigits === -1 ? pattern.maxFrac : this.currencyDigits;

    const minFrac = o.minimumFractionDigits;
    let maxFrac = o.maximumFractionDigits;
    if (minFrac === undefined && maxFrac === undefined && maxFracDigits > -1) {
      maxFrac = maxFracDigits;
    }

    if (maxFrac !== undefined && maxFrac > -1) {
      this.maxFrac = maxFrac;
    }

    if (minFrac !== undefined && minFrac > -1) {
      this.minFrac = maxFrac !== undefined && maxFrac > -1 ? (maxFrac < minFrac ? maxFrac : minFrac) : minFrac;
      if (this.minFrac > this.maxFrac) {
        this.maxFrac = this.minFrac;
      }
    }

    if (maxFrac !== undefined && maxFrac > -1) {
      if (this.maxFrac < this.minFrac || this.minFrac === -1) {
        this.minFrac = this.maxFrac;
      }
    }

    if (this.useSignificant) {
      let minSig = orDefault(o.minimumSignificantDigits, minSigDigits);
      let maxSig = orDefault(o.maximumSignificantDigits, maxSigDigits);

      if (minSig !== -1 && minSig > maxSig) {
        maxSig = minSig;
      }
      if (maxSig !== -1 && maxSig < minSig) {
        minSig = maxSig;
      }

      this.minSig = minSig === -1 ? maxSig : minSig;
      this.maxSig = maxSig === -1 ? minSig : maxSig;
    } else {
      this.maxSig = -1;
      this.minSig = -1;
    }
  }
}

const orDefault = (n: number | undefined, alt: number): number => n === undefined ? alt : n;
