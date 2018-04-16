import { DateTimePatternField, DateTimePatternFieldType } from '@phensley/cldr-schema';
import { CalendarDate, CalendarType } from './calendar';
import { GregorianDate } from './gregorian';
import { ISO8601Date } from './iso8601';
import { JapaneseDate } from './japanese';
import { PersianDate } from './persian';

export class Calendars {

  static fieldOfGreatestDifference(a: CalendarDate, b: CalendarDate): DateTimePatternFieldType {
    if (a.type() !== b.type() || a.timeZoneOffset() !== b.timeZoneOffset()) {
      b = Calendars.convertTo(b, a.type(), a.timeZoneId());
    }
    return a.fieldOfGreatestDifference(b);
  }

  /**
   * Convert a calendar object to the target type.
   */
  static convertTo(d: CalendarDate, target: CalendarType, zoneId?: string): CalendarDate {
    if (target === d.type()) {
      return d;
    }
    switch (target) {
    case 'gregory':
      return Calendars.toGregorianDate(d, zoneId);
    case 'iso8601':
      return Calendars.toISO8601Date(d, zoneId);
    case 'japanese':
      return Calendars.toJapaneseDate(d, zoneId);
    case 'persian':
      return Calendars.toPersianDate(d, zoneId);
    default:
      return d;
    }
  }

  static toGregorianDate(d: CalendarDate, zoneId?: string): GregorianDate {
    return GregorianDate.fromUnixEpoch(
      d.unixEpoch(), zoneId ? zoneId : d.timeZoneId(), d.firstDayOfWeek(), d.minDaysInFirstWeek()
    );
  }

  static toISO8601Date(d: CalendarDate, zoneId?: string): ISO8601Date {
    return ISO8601Date.fromUnixEpoch(d.unixEpoch(), zoneId ? zoneId : d.timeZoneId());
  }

  static toJapaneseDate(d: CalendarDate, zoneId?: string): JapaneseDate {
    return JapaneseDate.fromUnixEpoch(
      d.unixEpoch(), zoneId ? zoneId : d.timeZoneId(), d.firstDayOfWeek(), d.minDaysInFirstWeek()
    );
  }

  static toPersianDate(d: CalendarDate, zoneId?: string): PersianDate {
    return PersianDate.fromUnixEpoch(
      d.unixEpoch(), zoneId ? zoneId : d.timeZoneId(), d.firstDayOfWeek(), d.minDaysInFirstWeek()
    );
  }

}
