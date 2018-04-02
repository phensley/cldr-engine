import { Bundle, ZonedDateTime } from '../../';
import { Internals } from '../../internals';
import { NumberSystemType, DateFormatOptions } from '../../common';
import { NumberParamsCache } from './numbers/params';
import { DateFormatRequest, NumberParams } from '../../common/private';
import { DatePatternManager } from './calendars/manager';

/**
 * Private API only visible internally.
 */
export class PrivateApiImpl {

  private numberParamsCache: NumberParamsCache;
  private datePatternManager: DatePatternManager;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.numberParamsCache = new NumberParamsCache(bundle, internals);
    this.datePatternManager = new DatePatternManager(bundle, internals);
  }

  getNumberParams(numberSystem?: NumberSystemType, defaultSystem?: NumberSystemType): NumberParams {
    return this.numberParamsCache.getNumberParams(numberSystem, defaultSystem);
  }

  getDateFormatRequest(date: ZonedDateTime, options: DateFormatOptions): DateFormatRequest {
    const params = this.getNumberParams(options.nu);
    return this.datePatternManager.getRequest(date, options, params);
  }
}
