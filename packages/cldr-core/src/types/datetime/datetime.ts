import { DateTimePatternField, DateTimePatternFieldType } from '@phensley/cldr-schema';
import { substituteZoneAlias, getZoneInfo } from './timezones';
import { binarySearch } from '../../utils/search';
import * as encoding from '../../resource/encoding';

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
const WEEKMS = 7 * 86400000;

/**
 * A date-time object with a timezone identifier.
 *
 * @alpha
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
  private _isoLocal: [number, number] | undefined;

  constructor(date: number | Date | ZonedDateTime, zoneId: string = 'UTC') {
    this._epoch = +date;
    this._utc = new Date(this._epoch);
    this._zoneId = substituteZoneAlias(zoneId);

    const info = getZoneInfo(this._zoneId);
    const len = info.untils.length;
    let index = binarySearch(info.untils, this._epoch);
    this._dst = encoding.bitarrayGet(info.dsts, index);

    // TODO: extend untils/offsets past 2037 programmatically.

    this._offset = index < len ? info.offsets[index] : info.offsets[len - 1];
    this._local = new Date(this._epoch - (this._offset * 60000));

    index = binarySearch(info.metazoneUntils, this._epoch);
    this._metaZoneId = info.metazoneIds[index];
  }

  /**
   * Timezone identifier from the tz database.
   */
  zoneId(): string {
    return this._zoneId;
  }

  epochUTC(): number {
    return this._epoch;
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
    return this._local.getUTCFullYear();
  }

  /**
   * UTC Gregorian full 4-digit year.
   */
  getUTCYear(): number {
    return this._utc.getUTCFullYear();
  }

  isLeapYear(): boolean {
    return isLeap(this.getYear());
  }

  isUTCLeapYear(): boolean {
    return isLeap(this.getUTCYear());
  }

  /**
   * ISO 8601 Week of week-based year.
   */
  getISOWeek(): number {
    const [week, year] = this.calcISO();
    return week;
  }

  /**
   * ISO 8601 Year of week-based Year.
   */
  getISOYear(): number {
    const [week, year] = this.calcISO();
    return year;
  }

  fieldOfGreatestDifference(other: ZonedDateTime): DateTimePatternFieldType {
    if (this._zoneId !== other._zoneId) {
      other = new ZonedDateTime(other._epoch, this._zoneId);
    }
    if (this.getYear() !== other.getYear()) {
      return DateTimePatternField.YEAR;
    }
    if (this.getMonth() !== other.getMonth()) {
      return DateTimePatternField.MONTH;
    }
    if (this.getDayOfMonth() !== other.getDayOfMonth()) {
      return DateTimePatternField.DAY;
    }

    // TODO: AM PM

    if (this.getHour() !== other.getHour()) {
      return DateTimePatternField.HOUR;
    }
    if (this.getMinute() !== other.getMinute()) {
      return DateTimePatternField.MINUTE;
    }
    return DateTimePatternField.SECOND;
  }

  toISOString(): string {
    return this._utc.toISOString();
  }

  private calcISO(): [number, number] {
    if (this._isoLocal !== undefined) {
      return this._isoLocal;
    }

    const month = this.getMonth();
    const year = this.getYear();

    const date  = new Date(this._local.valueOf());
    const yearday = date.getDate();
    const weekday = (date.getDay() + 6) % 7;

    // Thursday of same week.
    date.setDate(yearday - weekday + 3);
    const thursday = date.valueOf();

    // Thursday of first week of January.
    date.setMonth(0, 1);
    if (date.getDay() !== 4) {
      date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
    }

    const isoweek = 1 + Math.ceil((thursday - (+date)) / WEEKMS);
    let isoyear = year;
    if (month === 0 && isoweek >= 52) {
      isoyear--;
    } else if (month === 11 && isoweek === 1) {
      isoyear++;
    }
    this._isoLocal = [isoweek, isoyear];
    return this._isoLocal;
  }
}
