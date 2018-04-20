import {
  CurrencySpacingPattern,
  CurrencySpacingPos,
  NumberSymbolType,
  NumbersSchema,
  NumberSystemInfo,
  NumberSystemName,
  PluralType,
  PluralDigitsType,
} from '@phensley/cldr-schema';

import { Bundle } from '../../resource';
import { Cache } from '../../utils/cache';
import { NumberingSystem, DecimalNumberingSystem, NumberSystem } from '../../systems/numbering';
import { Internals } from '../../internals';
import { NumberSystemType, DateFormatOptions, DateIntervalFormatOptions } from '../../common';
import { NumberParams } from '../../common/private';
import { NumberParamsCache } from './numbers/params';

// export type CompactFormat = { [P in PluralType]: { [Q in PluralDigitsType]: string } };
// export type CurrencySpacing = { [P in CurrencySpacingPos]: { [Q in CurrencySpacingPattern]: string } };
// export type NumberSymbols =  { [P in NumberSymbolType]: string };
// export type CurrencyUnitPattern = { [P in PluralType]: string };

// export interface NumberingParams {
//   readonly minimumGroupingDigits: number;
//   readonly system: NumberSystemInfo;
//   readonly latn: NumberSystemInfo;
//   readonly symbols: NumberSymbols;
// }

/**
 * Private API only visible internally.
 */
export class PrivateApiImpl {

  private numbers: NumbersSchema;
  private minimumGroupingDigits: number;
  private latnNumberSystemInfo: NumberSystemInfo;

  private numberParamsCache: NumberParamsCache;

  // private numberingSystems: Cache<NumberingSystem>;
  // private latnNumberingSystem: NumberingSystem;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numbers = internals.schema.Numbers;
    this.minimumGroupingDigits = Number(this.numbers.minimumGroupingDigits(bundle));
    this.latnNumberSystemInfo = this.numbers.numberSystem('latn');

    this.numberParamsCache = new NumberParamsCache(bundle, internals);

    // this.latnNumberingSystem = this.buildNumberingSystem('latn');
    // this.numberingSystems = new Cache((name: string) =>
    //   name === 'latn' ? this.latnNumberingSystem : this.buildNumberingSystem(name as NumberSystemName),
    // 10);

  }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    return this.numberParamsCache.getNumberParams(numberSystem, defaultSystem);
    // return {} as NumberParams;
  }

  // buildNumberingSystem(name: NumberSystemName): NumberingSystem {
  //   const bundle = this.bundle;
  //   const latn = this.numbers.numberSystem('latn');
  //   const system = this.numbers.numberSystem(name);

  //   let spacing = latn.currencyFormats.spacing.mapping(bundle);
  //   if (system.currencyFormats.spacing.exists(bundle)) {
  //     spacing = system.currencyFormats.spacing.mapping(bundle);
  //   }

  //   console.log(name, 'spacing', spacing);

  //   const symbols = system.symbols.mapping(bundle);

  //   return new DecimalNumberingSystem(name, symbols);
  // }

  // buildNumberingParams(name: NumberSystemName): NumberingParams {
  //   const minimumGroupingDigits = Number(this.numbers.minimumGroupingDigits(this.bundle));
  //   const system = this.numbers.numberSystem(name);
  //   const symbols = system.symbols.mapping(this.bundle);
  //   return {
  //     minimumGroupingDigits,
  //     system,
  //     latn: this.latnNumberSystemInfo,
  //     symbols,
  //   };
  // }
}

/*
  readonly minimumGroupingDigits: number;
  readonly symbols: NumberSymbols;

  readonly currencyStandard: string;
  readonly currencyAccounting: string;
  readonly currencyShort: CompactFormat;
  readonly currencySpacing: CurrencySpacing;
  readonly currencyUnitPattern: CurrencyUnitPattern;

  readonly decimalStandard: string;
  readonly decimalShort: CompactFormat;
  readonly decimalLong: CompactFormat;
  */