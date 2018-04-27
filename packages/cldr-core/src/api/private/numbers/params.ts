import {
  NumbersSchema,
  NumberSystemName,
  Schema,
  NumberSystemCategory,
} from '@phensley/cldr-schema';

import { Internals } from '../../../internals';
import { NumberSystemType } from '../../../common';
import { NumberParams } from '../../../common/private';
import { DecimalNumberingSystem, NumberingSystem } from '../../../systems';
import { decimalNumberingDigits } from '../../../systems/numbering/autogen.decimal';
import { Cache } from '../../../utils/cache';
import { Bundle } from '../../../resource';

// TODO: rebuild this using a new schema based on vector arrows

export class NumberParamsCache {

  private numberParamsCache: Cache<NumberParams>;
  private numbers: NumbersSchema;
  private latnSystem: NumberingSystem;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numberParamsCache = new Cache((s: string) => this.build(s as NumberSystemName), 10);
    this.numbers = internals.schema.Numbers;
    this.latnSystem = this.buildNumberSystem('latn');
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
    if (decimalNumberingDigits[realName] === undefined) {
      realName = this.select(defaultSystem);

      // TODO: temporary double-check to default for zh finance until we
      // have rbnf implemented.
      if (decimalNumberingDigits[realName] === undefined) {
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

    const info = this.numbers.numberSystem.get(name);
    const currencySpacing = info.currencyFormats.spacing.mapping(this.bundle);

    const { minimumGroupingDigits, primaryGroupingSize, secondaryGroupingSize, symbols } = system;

    return {
      numberSystemName: name,
      system,
      latnSystem,
      digits: decimalNumberingDigits[name],
      latinDigits: decimalNumberingDigits.latn,
      symbols,
      minimumGroupingDigits,
      primaryGroupingSize,
      secondaryGroupingSize,
      currencySpacing
    };
  }

  protected buildNumberSystem(name: NumberSystemName): NumberingSystem {
    const info = this.numbers.numberSystem.get(name);
    const symbols = info.symbols.mapping(this.bundle);

    // Fetch standard pattern to determine grouping digits
    const standardRaw = info.decimalFormats.standard.get(this.bundle);
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
