import {
  NumberFormatMode,
  NumberFormatModeType,
  NumberFormatOptions,
  RoundingModeType
} from './options';
import { Decimal, RoundingMode } from  '../../types/numbers';
import { NumberPattern } from '../../parsing/patterns/number';

/**
 * Provides a context to set number formatting parameters, combining user-supplied
 * options with defaults based on modes and the number pattern.
 */
export class NumberContext {

  readonly options: NumberFormatOptions;
  roundingMode: RoundingModeType;
  formatMode: NumberFormatModeType;
  useSignificant: boolean;

  minInt: number;
  maxFrac: number;
  minFrac: number;
  maxSig: number = -1;
  minSig: number = -1;
  currencyDigits: number = -1;

  constructor(
    options: NumberFormatOptions,
    defaultFormatMode: NumberFormatModeType,
    currencyDigits: number = -1
  ) {
    this.options = options;
    this.roundingMode = options.round || 'half-even';
    this.formatMode = options.formatMode === undefined ? defaultFormatMode : options.formatMode;
    this.currencyDigits = currencyDigits;
    this.useSignificant = this.formatMode === NumberFormatMode.SIGNIFICANT ||
      this.formatMode === NumberFormatMode.SIGNIFICANT_MAXFRAC;
  }

  /**
   * Set a pattern.
   */
  setPattern(pattern: NumberPattern): void {
    this._setPattern(pattern, -1, -1);
  }

  /**
   * Set a compact pattern.
   */
  setCompact(pattern: NumberPattern, integerDigits: number, divisor: number): void {
    let maxSigDigits = Math.max(pattern.minInt, integerDigits) + 1;
    const minSigDigits = 1;
    if (divisor === 0) {
      maxSigDigits = integerDigits + 1;
    }
    this._setPattern(pattern, maxSigDigits, minSigDigits);
  }

  /**
   * Adjust the scale of the number using the resolved parameters.
   */
  adjust(n: Decimal): Decimal {
    if (this.useSignificant && this.maxSig > 0 && this.maxSig > 0) {
      // Scale the number to have at most the maximum significant digits.
      if (n.precision() > this.maxSig) {
        const scale = this.maxSig - n.precision() + n.scale();
        n = n.setScale(scale, this.roundingMode);
      }

      // Ensure we don't exceed the maximum number of fraction digits allowed.
      if (this.formatMode === NumberFormatMode.SIGNIFICANT_MAXFRAC && this.maxFrac < n.scale()) {
        n = n.setScale(this.maxFrac, this.roundingMode);
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
  private _setPattern(pattern: NumberPattern, maxSigDigits: number, minSigDigits: number): void {
    const o = this.options;
    this.minInt = orDefault(o.minimumIntegerDigits, pattern.minInt);

    this.maxFrac = this.currencyDigits === -1 ? pattern.maxFrac : this.currencyDigits;
    this.maxFrac = orDefault(o.maximumFractionDigits, this.maxFrac);

    this.minFrac = this.currencyDigits === -1 ? pattern.minFrac : this.currencyDigits;
    this.minFrac = orDefault(o.minimumFractionDigits, this.minFrac);

    if (this.minFrac !== -1 && this.minFrac > this.maxFrac) {
      this.maxFrac = this.minFrac;
    }
    if (this.maxFrac !== -1 && this.maxFrac < this.minFrac) {
      this.minFrac = this.maxFrac;
    }

    if (this.useSignificant) {
      this.maxSig = orDefault(o.maximumSignificantDigits, maxSigDigits);
      this.minSig = orDefault(o.minimumSignificantDigits, minSigDigits);
      if (this.minSig !== -1 && this.minSig > this.maxSig) {
        this.maxSig = this.minSig;
      }
      if (this.maxSig !== -1 && this.maxSig < this.minSig) {
        this.minSig = this.maxSig;
      }
    } else {
      this.maxSig = -1;
      this.minSig = -1;
    }
  }
}

const orDefault = (n: number | undefined, alt: number): number => n === undefined ? alt : n;
