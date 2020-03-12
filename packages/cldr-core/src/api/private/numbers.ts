import {
  NumbersSchema,
  NumberSystemInfo,
  NumberSystemName,
} from '@phensley/cldr-types';

import { Cache } from '@phensley/cldr-utils';

import { Internals } from '../../internals';
import { NumberSystemType } from '../../common';
import { NumberingSystem, NumberParams } from '../../common/private';
import { DecimalNumberingSystem } from '../../systems';
import { decimalNumberingDigits } from '../../systems/numbering/autogen.names';
import { Bundle } from '../../resource';

/**
 * @internal
 */
export class NumberParamsCache {

  private numberParamsCache: Cache<NumberParams>;
  private numbers: NumbersSchema;
  private latnSystem: NumberingSystem;
  private latnSystemInfo: NumberSystemInfo;

  constructor(
    private bundle: Bundle,
    private internals: Internals
  ) {
    this.numberParamsCache = new Cache((s: string) => this.build(s as NumberSystemName), 20);
    this.numbers = internals.schema.Numbers;
    this.latnSystemInfo = this.numbers.numberSystem.get('latn') as NumberSystemInfo;
    this.latnSystem = this.buildNumberSystem('latn');
  }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    // Default numbering system for a locale unless explicitly overridden
    // https://www.unicode.org/reports/tr35/tr35-33/tr35-numbers.html#defaultNumberingSystem
    if (!defaultSystem) {
      defaultSystem = 'default';
    }
    if (!numberSystem) {
      numberSystem = this.bundle.numberSystem() as NumberSystemType;
    }

    let realName: NumberSystemName = this.select(numberSystem);

    // Handle invalid number systems by returning the specified default
    // TODO: include algorithmic number system check
    if (!decimalNumberingDigits[realName]) {
      realName = this.select(defaultSystem);

      // TODO: temporary double-check to default for zh finance until we
      // have rbnf implemented.
      /* istanbul ignore if */
      if (!decimalNumberingDigits[realName]) {
        realName = this.select('default');
      }
    }

    return this.numberParamsCache.get(realName);
  }

  protected select(numberSystem: NumberSystemType): NumberSystemName {
    switch (numberSystem) {
      case 'default':
      case 'native':
      case 'finance':
      case 'traditional':
        // Dereference to find real name of number system
        return this.numbers.numberSystems.get(this.bundle, numberSystem) as NumberSystemName;

      default:
        return numberSystem;
    }
  }

  protected build(name: NumberSystemName): NumberParams {
    const { latnSystem } = this;

    const system = name === 'latn' ? latnSystem : this.buildNumberSystem(name);

    const info = this.numbers.numberSystem.get(name) || this.latnSystemInfo;

    const currencySpacing = info.currencyFormats.spacing.exists(this.bundle)
      ? info.currencyFormats.spacing.mapping(this.bundle)
      : this.latnSystemInfo.currencyFormats.spacing.mapping(this.bundle);

    const { minimumGroupingDigits, primaryGroupingSize, secondaryGroupingSize, symbols } = system;

    return {
      numberSystemName: name,
      system,
      latnSystem,
      digits: makeDigits(name),
      latinDigits: makeDigits('latn'),
      symbols,
      minimumGroupingDigits,
      primaryGroupingSize,
      secondaryGroupingSize,
      currencySpacing
    };
  }

  protected buildNumberSystem(name: NumberSystemName): NumberingSystem {
    const { bundle } = this;
    const system = this.numbers.numberSystem;
    const info = system.get(name) || this.latnSystemInfo;
    const symbols = info.symbols.exists(bundle)
      ? info.symbols.mapping(bundle)
      : this.latnSystemInfo.symbols.mapping(bundle);

    const standardRaw = info.decimalFormats.standard.get(bundle)
      || this.latnSystemInfo.decimalFormats.standard.get(bundle);

    // Fetch standard pattern to determine grouping digits
    const standard = this.internals.numbers.getNumberPattern(standardRaw, false);
    const minimumGroupingDigits = Number(this.numbers.minimumGroupingDigits.get(this.bundle));
    return new DecimalNumberingSystem(
      name,
      decimalNumberingDigits[name],
      symbols,
      minimumGroupingDigits,
      standard.priGroup,
      standard.secGroup
    );
  }
}

/**
 * The codepoints for most Unicode decimal digit sets are in increasing order.
 * To save space we store the base digit '0' and generate '1'..'9' from it.
 */
const makeDigits = (name: string): string[] => {
  const digits = decimalNumberingDigits[name];
  if (digits.length !== 10) {
    const c = digits[0].charCodeAt(0);
    if (c >= 0xD800 && c <= 0xDBFF) {
      const c2 = digits[0].charCodeAt(1);
      /* istanbul ignore else */
      if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
        for (let i = 1; i < 10; i++) {
          const digit = String.fromCharCode(c) + String.fromCharCode(c2 + i);
          digits.push(digit);
        }
      }
    } else {
      for (let i = 1; i < 10; i++) {
        digits.push(String.fromCharCode(c + i));
      }
    }
    decimalNumberingDigits[name] = digits;
  }
  return digits;
};
