import {
  CurrencySpacing,
  NumbersSchema,
  NumberSymbols,
  NumberSystemName,
  NumberSystemNames,
  Schema
} from '@phensley/cldr-schema';

import { Internals } from '../../../internals';
import { NumberSystemType } from '../../../common';
import { NumberParams } from '../../../common/private';
import { NumericNumberSystem, numericNumberingDigits } from '../../../systems';
import { Cache } from '../../../utils/cache';
import { Bundle } from '../../../resource';

// TODO: rebuild this using a new schema based on vector arrows

export class NumberParamsCache {

  private numberParamsCache: Cache<NumberParams>;
  private numberSystems: NumberSystemNames;
  private numberSchema: NumbersSchema;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numberParamsCache = new Cache((s: string) => this.build(s as NumberSystemName), 10);
    this.numberSchema = internals.schema.Numbers;
    this.numberSystems = this.numberSchema.numberSystems(bundle);
  }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    // Default numbering system for a locale unless explicitly overridden
    // https://www.unicode.org/reports/tr35/tr35-33/tr35-numbers.html#defaultNumberingSystem
    if (defaultSystem === undefined) {
      defaultSystem = 'default';
    }
    if (numberSystem === undefined) {
      numberSystem = defaultSystem;
    }

    let realName: NumberSystemName = this.select(numberSystem);

    // Handle invalid number systems by returning the specified default
    // TODO: include algorithmic number system check
    if (numericNumberingDigits[realName] === undefined) {
      realName = this.select(defaultSystem);

      // TODO: temporary double-check to default for zh finance until we
      // have rbnf implemented.
      if (numericNumberingDigits[realName] === undefined) {
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
        return this.numberSystems[numberSystem];

      default:
        return numberSystem;
    }
  }

  protected build(numberSystemName: NumberSystemName): NumberParams {
    const info = this.internals.schema.Numbers.numberSystem(numberSystemName);
    const currencySpacing = info.currencyFormats.currencySpacing;

    // Fetch standard pattern to determine grouping digits
    const standardRaw = info.decimalFormats.standard(this.bundle);
    const standard = this.internals.numbers.getNumberPattern(standardRaw, false);

    const numberSystem: NumericNumberSystem = {
      type: 'numeric',
      digits: numericNumberingDigits[numberSystemName]
    };

    return {
      numberSystemName,
      numberSystem,
      digits: numericNumberingDigits[numberSystemName],
      latinDigits: numericNumberingDigits.latn,
      symbols: info.symbols(this.bundle),
      minimumGroupingDigits: Number(this.internals.schema.Numbers.minimumGroupingDigits(this.bundle)),
      primaryGroupingSize: standard.priGroup,
      secondaryGroupingSize: standard.secGroup,
      beforeCurrency: currencySpacing.beforeCurrency(this.bundle),
      afterCurrency: currencySpacing.afterCurrency(this.bundle)
    };
  }
}
