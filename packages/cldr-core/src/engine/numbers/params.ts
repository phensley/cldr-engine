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
  private defaultParams: NumberParams;

  constructor(
    protected bundle: Bundle,
    protected internal: NumbersInternal
  ) {
    this.numberParamsCache = new LRU();
    this.numberSystems = internal.root.Numbers.numberSystems(bundle);
    this.defaultParams = this.lookup(this.numberSystems.default);
  }

  getNumberParams(numberSystem?: NumberSystemType): NumberParams {
    if (numberSystem === undefined) {
      numberSystem = 'native';
    }

    switch (numberSystem) {
    case 'default':
      return this.defaultParams;

    case 'native':
    case 'finance':
    case 'traditional':
      numberSystem = this.numberSystems[numberSystem];
      break;
    }
    return this.lookup(numberSystem as NumberSystemName);
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
    const standardRaw = info.decimalFormats.standard(this.bundle);
    const standard = this.internal.getNumberPattern(standardRaw, false);

    const digits = numericNumberingDigits[numberSystemName] || numericNumberingDigits.latn;
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
