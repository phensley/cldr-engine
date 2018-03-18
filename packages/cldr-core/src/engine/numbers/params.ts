import {
  Bundle,
  CurrencySpacing,
  NumberSymbols,
  NumberSystemName,
  NumberSystemNames
} from '@phensley/cldr-schema';
import { NumbersInternal } from './internal';
import { NumberParams, NumberSystemType } from './options';
import { numericNumberingDigits } from '../../systems';
import { LRU } from './../../utils/lru';

export class NumberParamsCache {

  private numberParamsCache: LRU<string, NumberParams>;
  private numberSystems: NumberSystemNames;

  constructor(
    protected bundle: Bundle,
    protected internal: NumbersInternal
  ) {
    this.numberParamsCache = new LRU();
    this.numberSystems = internal.root.Numbers.numberSystems(bundle);
  }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    if (defaultSystem === undefined) {
      defaultSystem = 'native';
    }
    if (numberSystem === undefined) {
      numberSystem = defaultSystem;
    }

    let realName: NumberSystemName = this.realName(numberSystem);

    // Handle invalid number systems by returning the specified default
    if (numericNumberingDigits[realName] === undefined) {
      realName = this.realName(defaultSystem);
    }

    return this.lookup(realName);
  }

  protected realName(numberSystem: NumberSystemType): NumberSystemName {
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
    const root = this.internal.root;
    const info = root.Numbers.numberSystem(numberSystemName);
    const currencySpacing = info.currencyFormats.currencySpacing;

    // Fetch standard pattern to determine grouping digits
    const standardRaw = info.decimalFormats.standard(this.bundle);
    const standard = this.internal.getNumberPattern(standardRaw, false);

    // Decimal digits for the number system
    const digits = numericNumberingDigits[numberSystemName];

    return {
      numberSystemName,
      digits,
      symbols: info.symbols(this.bundle),
      minimumGroupingDigits: Number(root.Numbers.minimumGroupingDigits(this.bundle)),
      primaryGroupingSize: standard.priGroup,
      secondaryGroupingSize: standard.secGroup,
      beforeCurrency: currencySpacing.beforeCurrency(this.bundle),
      afterCurrency: currencySpacing.afterCurrency(this.bundle)
    };
  }
}
