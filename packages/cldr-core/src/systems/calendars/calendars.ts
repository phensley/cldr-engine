import { DateTimePatternField, DateTimePatternFieldType } from '@phensley/cldr-schema';
import { CalendarDate, CalendarType } from './calendar';
import { GregorianDate } from './gregorian';
import { ISO8601Date } from './iso8601';
import { JapaneseDate } from './japanese';
import { PersianDate } from './persian';

export class Calendars {

  static fieldOfGreatestDifference(a: CalendarDate, b: CalendarDate): DateTimePatternFieldType {
    if (a.type() !== b.type()) {
      b = Calendars.convertTo(b, a.type());
    }
    return a.fieldOfGreatestDifference(b);
  }

  /**
   * Convert a calendar object to the target type.
   */
  static convertTo(d: CalendarDate, target: CalendarType): CalendarDate {
    if (target === d.type()) {
      return d;
    }
    switch (target) {
    case 'gregory':
      return Calendars.toGregorianDate(d);
    case 'iso8601':
      return Calendars.toISO8601Date(d);
    case 'japanese':
      return Calendars.toJapaneseDate(d);
    case 'persian':
      return Calendars.toPersianDate(d);
    default:
      return d;
    }
  }

  static toGregorianDate(d: CalendarDate): GregorianDate {
    return GregorianDate.fromUnixEpoch(
      d.unixEpoch(), d.timeZoneId(), d.firstDayOfWeek(), d.minDaysInFirstWeek()
    );
  }

  static toISO8601Date(d: CalendarDate): ISO8601Date {
    return ISO8601Date.fromUnixEpoch(d.unixEpoch(), d.timeZoneId());
  }

  static toJapaneseDate(d: CalendarDate): JapaneseDate {
    return JapaneseDate.fromUnixEpoch(
      d.unixEpoch(), d.timeZoneId(), d.firstDayOfWeek(), d.minDaysInFirstWeek()
    );
  }

  static toPersianDate(d: CalendarDate): PersianDate {
    return PersianDate.fromUnixEpoch(
      d.unixEpoch(), d.timeZoneId(), d.firstDayOfWeek(), d.minDaysInFirstWeek()
    );
  }

}
