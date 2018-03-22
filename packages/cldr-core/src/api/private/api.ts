import { Bundle } from '../../';
import { Internals } from '../../internals';
import { NumberSystemType } from '../../common';
import { NumberParamsCache } from './params';
import { NumberParams } from '../../common/private';

/**
 * Private API only visible internally.
 */
export class PrivateApiImpl {

  private numberParams: NumberParamsCache;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numberParams = new NumberParamsCache(bundle, internals);
  }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    return this.numberParams.getNumberParams(numberSystem, defaultSystem);
  }

}
