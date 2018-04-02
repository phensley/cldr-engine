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
import { numericNumberingDigits } from '../../../systems';
import { LRU } from './../../../utils/lru';
import { Bundle } from '../../../resource';

export class NumberParamsCache {

  private numberParamsCache: LRU<string, NumberParams>;
  private numberSystems: NumberSystemNames;
  private numberSchema: NumbersSchema;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numberParamsCache = new LRU();
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

    return this.lookup(realName);
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

  protected lookup(numberSystem: NumberSystemName): NumberParams {
    let params = this.numberParamsCache.get(numberSystem);
    if (params === undefined) {
      params = this.build(numberSystem);
      this.numberParamsCache.set(numberSystem, params);
    }
    return params;
  }

  protected build(numberSystemName: NumberSystemName): NumberParams {
    const info = this.internals.schema.Numbers.numberSystem(numberSystemName);
    const currencySpacing = info.currencyFormats.currencySpacing;

    // Fetch standard pattern to determine grouping digits
    const standardRaw = info.decimalFormats.standard(this.bundle);
    const standard = this.internals.numbers.getNumberPattern(standardRaw, false);

    // Decimal digits for the number system
    const digits = numericNumberingDigits[numberSystemName];

    return {
      numberSystemName,
      digits,
      symbols: info.symbols(this.bundle),
      minimumGroupingDigits: Number(this.internals.schema.Numbers.minimumGroupingDigits(this.bundle)),
      primaryGroupingSize: standard.priGroup,
      secondaryGroupingSize: standard.secGroup,
      beforeCurrency: currencySpacing.beforeCurrency(this.bundle),
      afterCurrency: currencySpacing.afterCurrency(this.bundle)
    };
  }
}
