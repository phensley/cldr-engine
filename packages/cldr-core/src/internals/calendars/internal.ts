import { CalendarSchema, DayPeriodType, Schema } from '@phensley/cldr-types';
import { Cache } from '@phensley/cldr-utils';

import { CalendarDate, CalendarType } from '../../systems/calendars';
import { calendarIds, calendarPrefData } from './autogen.calprefs';
import { weekFirstDay, weekMinDays } from './autogen.weekdata';
import { Bundle } from '../../resource';
import { CalendarInternals } from '../internals';
import { AbstractValue } from '../../utils/render';
import { CalendarContext, CalendarFormatter } from './formatter';
import { CalendarFormatterImpl } from './formatterimpl';
import { Internals } from '../internals';
import { intervalPatternBoundary, parseDatePattern, DateTimeNode } from '../../parsing/date';
import { DayPeriodRules } from './rules';

/**
 * Framework scoped calendar functions.
 *
 * @internal
 */
export class CalendarInternalsImpl implements CalendarInternals {

  private schema: Schema;
  private dayPeriodRules: DayPeriodRules;
  private patternCache: Cache<DateTimeNode[]>;
  private hourPatternCache: Cache<[DateTimeNode[], DateTimeNode[]]>;
  private calendarFormatterCache: Cache<CalendarFormatter<CalendarDate>>;
  private availableCalendars: Set<string>;

  constructor(
    private internals: Internals,
    cacheSize: number = 50
  ) {
    this.schema = internals.schema;
    this.dayPeriodRules = new DayPeriodRules(cacheSize);
    this.patternCache = new Cache(parseDatePattern, cacheSize);
    this.availableCalendars = new Set(internals.config.calendars || []);
    this.hourPatternCache = new Cache((raw: string): [DateTimeNode[], DateTimeNode[]] => {
      const parts = raw.split(';');
      return [this.patternCache.get(parts[0]), this.patternCache.get(parts[1])];
    }, cacheSize);

    this.calendarFormatterCache = new Cache((calendar: string) => {
      let s: CalendarSchema | undefined;
      if (this.availableCalendars.has(calendar)) {
        switch (calendar) {
          case 'buddhist':
            s = this.schema.Buddhist;
            break;
          case 'japanese':
            s = this.schema.Japanese;
            break;
          case 'persian':
            s = this.schema.Persian;
            break;
        }
      }
      if (s === undefined) {
        s = this.schema.Gregorian;
      }
      return new CalendarFormatterImpl(this.internals, s);
    }, cacheSize);
  }

  flexDayPeriod(bundle: Bundle, minutes: number): DayPeriodType | undefined {
    return this.dayPeriodRules.get(bundle, minutes);
  }

  getCalendarFormatter(type: CalendarType): CalendarFormatter<CalendarDate> {
    return this.calendarFormatterCache.get(type);
  }

  parseDatePattern(raw: string): DateTimeNode[] {
    return this.patternCache.get(raw);
  }

  getHourPattern(raw: string, negative: boolean): DateTimeNode[] {
    const patterns = this.hourPatternCache.get(raw);
    return patterns[negative ? 1 : 0];
  }

  weekFirstDay(region: string): number {
    return weekFirstDay[region] || weekFirstDay['001'];
  }

  weekMinDays(region: string): number {
    return weekMinDays[region] || weekMinDays['001'];
  }

  formatDateTime<R>(
    calendar: CalendarType, ctx: CalendarContext<CalendarDate>, value: AbstractValue<R>,
    date?: DateTimeNode[], time?: DateTimeNode[], wrapper?: string): R {

    const formatter = this.getCalendarFormatter(calendar);
    let _date: R | undefined;
    let _time: R | undefined;
    if (date) {
      formatter.format(value, ctx, date);
      _date = value.render();
    }
    if (time) {
      formatter.format(value, ctx, time);
      _time = value.render();
    }
    if (_date && _time && wrapper) {
      const pattern = this.internals.general.parseWrapper(wrapper);
      value.wrap(pattern, [_time, _date]);
      return value.render();
    }
    return _date ? _date : _time ? _time : value.empty();
  }

  formatInterval<R>(calendar: CalendarType, ctx: CalendarContext<CalendarDate>,
    value: AbstractValue<R>, end: CalendarDate, pattern: DateTimeNode[]): R {
    const idx = intervalPatternBoundary(pattern);
    const s = this.formatDateTime(calendar, ctx, value, pattern.slice(0, idx));
    ctx.date = end;
    const e = this.formatDateTime(calendar, ctx, value, pattern.slice(idx));
    return value.join(s, e);
  }

  selectCalendar(bundle: Bundle, ca?: CalendarType): CalendarType {
    let calendar = this.supportedCalendar(ca) || this.supportedCalendar(bundle.calendarSystem());
    if (!calendar) {
      const prefs = calendarPrefData[bundle.region()] || calendarPrefData['001'];
      for (const id of prefs) {
        calendar = this.supportedCalendar(calendarIds[id]);
        if (calendar) {
          return calendar;
        }
      }
      return 'gregory';
    }
    return calendar;
  }

  /**
   * Translates a string into a supported calendar type, or undefined if none match.
   */
  private supportedCalendar(c: string | undefined): CalendarType | undefined {
    if (c && this.availableCalendars.has(c)) {
      switch (c) {
        case 'buddhist':
        case 'iso8601':
        case 'japanese':
        case 'persian':
        case 'gregory':
          return c;
        case 'gregorian':
          return 'gregory';
      }
    }
    return undefined;
  }

}
