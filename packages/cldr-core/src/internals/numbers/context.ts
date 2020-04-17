import { Decimal, RoundingModeType } from '@phensley/decimal';
import { NumberFormatOptions } from '../../common';
import { NumberPattern } from '../../parsing/number';

/**
 * Provides a context to set number formatting parameters, combining user-supplied
 * options with defaults based on modes and the number pattern.
 */
export class NumberContext {

  readonly options: NumberFormatOptions;
  useSignificant: boolean;

  minInt: number = -1;
  maxFrac: number = -1;
  minFrac: number = -1;
  maxSig: number = -1;
  minSig: number = -1;
  currencyDigits: number = -1;

  constructor(options: NumberFormatOptions, readonly roundingMode: RoundingModeType,
    compact: boolean, scientific: boolean, currencyDigits: number = -1) {
    const o = options;
    this.options = o;
    this.currencyDigits = currencyDigits;
    this.minInt = options.minimumIntegerDigits || -1;

    // Determine if we should use default or significant digit modes. If we're in compact mode
    // we will use significant digits unless any fraction option is set. Otherwise we use
    // significant digits if any significant digit option is set.
    const optFrac = o.minimumFractionDigits !== undefined || o.maximumFractionDigits !== undefined;
    const optSig = o.minimumSignificantDigits !== undefined || o.maximumSignificantDigits !== undefined;
    this.useSignificant = (scientific && !optFrac) || (compact && !optFrac) || optSig;
  }

  /**
   * Set a pattern. The 'scientific' flag indicates the pattern uses significant
   * digits, which we will copy from the pattern's min/max fractions.
   */
  setPattern(pattern: NumberPattern, scientific: boolean = false): void {
    this._setPattern(pattern, scientific, -1, -1, -1);
  }

  /**
   * Set a compact pattern.
   */
  setCompact(pattern: NumberPattern, integerDigits: number, _divisor: number, maxFracDigits: number = -1): void {
    let maxSigDigits = Math.max(pattern.minInt, integerDigits);
    if (integerDigits === 1) {
      maxSigDigits++;
    }
    this._setPattern(pattern, false, maxSigDigits, 1, maxFracDigits);
  }

  /**
   * Adjust the scale of the number using the resolved parameters.
   */
  adjust(n: Decimal, scientific: boolean = false): Decimal {

    // TODO: consider moving this logic into Decimal since it could be useful
    // to adjust a number using several options in a single pass. Could be
    // more efficient, making fewer copies.

    if (this.useSignificant && scientific) {
      if (this.minSig <= 0) {
        this.minSig = 1;
      }
      if (this.maxSig <= 0) {
        this.maxSig = 1;
      }
    }

    if (this.useSignificant && this.minSig >= 0) {
      // By default we assume maximum significant digits will equal the
      // number's default precision. So if the option's maxSig == -1
      // we ignore reducing the precision.
      if (this.maxSig !== -1 && n.precision() > this.maxSig) {
        // Scale the number to have at most the maximum significant digits.
        const scale = this.maxSig - n.precision() + n.scale();
        n = n.setScale(scale, this.roundingMode);
      }
      n = n.stripTrailingZeros();

      // scale the number to have at least the minimum significant digits
      const precision = n.precision();
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

      // If user hasn't requested minimum fraction digits, and requested to trim zero fractions,
      // and the number is an integer, force it to render as a whole number.
      if (this.options.trimZeroFractions && !this.options.minimumFractionDigits && n.isInteger()) {
        // Trim zeros when whole number display is possible
        n = n.setScale(0, this.roundingMode);

      } else if (n.scale() < this.minFrac) {
        // Ensure minimum fraction digits is met.
        n = n.setScale(this.minFrac, this.roundingMode);
      }
    }

    return n;
  }

  /**
   * Set context parameters from options, pattern and significant digit arguments.
   */
  private _setPattern(pattern: NumberPattern,
    scientific: boolean, maxSigDigits: number, minSigDigits: number, maxFracDigits: number): void {

    const o = this.options;

    // If minInt is not specified in options, always copy from pattern
    if (this.options.minimumIntegerDigits === undefined) {
      this.minInt = pattern.minInt;
    }
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

    if (this.useSignificant || scientific) {
      const optMinSig = o.minimumSignificantDigits;
      const optMaxSig = o.maximumSignificantDigits;

      let minSig = scientific ? orDefault(optMinSig, pattern.minFrac) : orDefault(optMinSig, minSigDigits);
      let maxSig = scientific ? orDefault(optMaxSig, pattern.maxFrac) : orDefault(optMaxSig, maxSigDigits);

      if (minSig !== -1 && maxSig !== -1 && minSig > maxSig) {
        maxSig = minSig;
      }
      if (minSig === -1) {
        minSig = maxSig;
      }
      this.minSig = minSig;
      this.maxSig = maxSig;
    } else {
      this.maxSig = -1;
      this.minSig = -1;
    }
  }
}

const orDefault = (n: number | undefined, alt: number): number => n === undefined ? alt : n;
