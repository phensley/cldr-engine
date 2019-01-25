import { NumbersSchema } from '@phensley/cldr-schema';

import { Bundle } from '../../resource';
import { Internals } from '../../internals';
import { NumberSystemType } from '../../common';
import { NumberParams } from '../../common/private';
import { NumberParamsCache } from './numbers/params';

/**
 * Private API only visible internally.
 */
export class PrivateApiImpl {

  private numbers: NumbersSchema;

  private numberParamsCache: NumberParamsCache;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numbers = internals.schema.Numbers;
    this.numberParamsCache = new NumberParamsCache(bundle, internals);
 }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    return this.numberParamsCache.getNumberParams(numberSystem, defaultSystem);
  }
}
