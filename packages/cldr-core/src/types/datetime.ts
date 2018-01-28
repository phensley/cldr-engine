import { findMetaZone, substituteZoneAlias, getZoneInfo } from './timezones';
import { binarySearch } from '../utils/search';
import * as encoding from '../resource/encoding';
import { DateTimeField, DateTimeFieldType } from '@phensley/cldr-schema';

const isLeap = (y: number): boolean => {
  if (y % 4 !== 0) {
    return false;
  }
  if (y % 100 !== 0) {
    return true;
  }
  return y % 400 !== 0 ? false : true;
};

const ORDINAL_DAY = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const ISO_WEEK = 0;
const ISO_YEAR = 1;

/**
 * A date-time object with a timezone identifier.
 */
export class ZonedDateTime {

  private _epoch: number;
  private _utc: Date;
  private _local: Date;
  private _zoneId: string;
  private _metaZoneId: string | undefined;
  private _offset: number;
  private _dst: boolean;

  // cache for iso week-based fields
  private _isoUTC: number[] = [-1, -1];
  private _isoLocal: number[] = [-1, -1];

  constructor(date: Date | number, zoneId: string) {
    this._epoch = typeof date === 'number' ? date : date.getTime();
    this._utc = new Date(this._epoch);
    this._zoneId = substituteZoneAlias(zoneId);
    this._metaZoneId = findMetaZone(this._zoneId, this._epoch);

    const info = getZoneInfo(zoneId);
    const index = binarySearch(info.untils, this._epoch);
    this._dst = encoding.bitarrayGet(info.dsts, index);

    const len = info.untils.length;
    this._offset = index < len ? info.offsets[index] : info.offsets[len - 1];
    this._local = new Date(this._epoch - (this._offset * 60000));
  }

  /**
   * Timezone identifier from the tz database.
   */
  zoneId(): string {
    return this._zoneId;
  }

  /**
   * Meta zone ID for selecting an appropriate format or standalone name.
   */
  metaZoneId(): string | undefined {
    return this._metaZoneId;
  }

  /**
   * Timezone's offset from UTC.
   */
  timezoneOffset(): number {
    return this._offset;
  }

  /**
   * Indicates if the local date is in daylight savings.
   */
  isDaylightSavings(): boolean {
    return this._dst;
  }

  /**
   * Local Date object.
   */
  getLocal(): Date {
    return this._local;
  }

  /**
   * Local milliseconds, an integer between 0 and 999.
   */
  getMillisecond(): number {
    return this._local.getUTCMilliseconds();
  }

  /**
   * Local seconds, an integer between 0 and 59.
   */
  getSecond(): number {
    return this._local.getUTCSeconds();
  }

  /**
   * Local minutes, an integer between 0 and 59.
   */
  getMinute(): number {
    return this._local.getUTCMinutes();
  }

  /**
   * UTC minutes, an integer between 0 and 59.
   */
  getUTCMinute(): number {
    return this._utc.getUTCMinutes();
  }

  /**
   * Local hours, an integer between 0 and 23, where 0 = midnight.
   */
  getHour(): number {
    return this._local.getUTCHours();
  }

  /**
   * UTC hours, an integer between 0 and 23 where 0 = midnight.
   */
  getUTCHour(): number {
    return this._utc.getUTCHours();
  }

  /**
   * Local Gregorian day of the week, an integer between 1 and 7, where 1 = Monday.
   */
  getDayOfWeek(): number {
    const day = this._local.getUTCDay();
    return day === 0 ? 7 : day;
  }

  /**
   * UTC Gregorian day of the week, an integer between 1 and 7, where 1 = Monday.
   */
  getUTCDayOfWeek(): number {
    const day = this._utc.getUTCDay();
    return day === 0 ? 7 : day;
  }

  /**
   * Local Gregorian day of the month, an integer between 1 and 31.
   */
  getDayOfMonth(): number {
    return this._local.getUTCDate();
  }

  /**
   * UTC Gregorian day of the month, an integer between 1 and 31.
   */
  getUTCDayOfMonth(): number {
    return this._utc.getUTCDate();
  }

  /**
   * Local ordinal day of the year.
   */
  getDayOfYear(): number {
    const leap = this.isLeapYear();
    const month = this.getMonth();
    const day = ORDINAL_DAY[month] + this.getDayOfMonth();
    if (!leap) {
      return day;
    }
    return month > 1 ? day + 1 : day;
  }

  /**
   * Local Gregorian month, an integer between 0 and 11, where 0 = January.
   */
  getMonth(): number {
    return this._local.getUTCMonth();
  }

  /**
   * UTC Gregorian month, an integer between 0 and 11, where 0 = January.
   */
  getUTCMonth(): number {
    return this._utc.getUTCMonth();
  }

  /**
   * Local Gregorian full 4-digit year.
   */
  getYear(): number {
    return this._local.getFullYear();
  }

  /**
   * UTC Gregorian full 4-digit year.
   */
  getUTCYear(): number {
    return this._utc.getFullYear();
  }

  isLeapYear(): boolean {
    return isLeap(this._local.getFullYear());
  }

  isUTCLeapYear(): boolean {
    return isLeap(this._utc.getFullYear());
  }

  /**
   * ISO 8601 Week of week-based year.
   */
  getISOWeekOfWeekYear(): number {
    this.calcISO(this._isoLocal);
    return this._isoLocal[ISO_WEEK];
  }

  /**
   * ISO 8601 Year of week-based Year.
   */
  getISOYearOfWeekYear(): number {
    this.calcISO(this._isoLocal);
    return this._isoLocal[ISO_YEAR];
  }

  fieldOfGreatestDifference(other: ZonedDateTime): DateTimeFieldType {
    if (this._zoneId !== other._zoneId) {
      other = new ZonedDateTime(other._epoch, this._zoneId);
    }
    if (this.getYear() !== other.getYear()) {
      return DateTimeField.YEAR;
    }
    if (this.getMonth() !== other.getMonth()) {
      return DateTimeField.MONTH;
    }
    if (this.getDayOfMonth() !== other.getDayOfMonth()) {
      return DateTimeField.DAY;
    }

    // TODO: AM PM

    if (this.getHour() !== other.getHour()) {
      return DateTimeField.HOUR;
    }
    if (this.getMinute() !== other.getMinute()) {
      return DateTimeField.MINUTE;
    }
    return DateTimeField.SECOND;
  }

  private calcISO(iso: number[]): void {
    if (iso[ISO_WEEK] !== -1) {
      return;
    }
    const year = this.getYear();
    const yearday = this.getDayOfYear();
    const weekday = this.getDayOfWeek();
    const isoWeek = Math.floor((yearday - weekday + 10) / 7);
    console.log('>', isoWeek);
    // TODO:
  }
}
