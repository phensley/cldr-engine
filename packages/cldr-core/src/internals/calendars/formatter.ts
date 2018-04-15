import { Schema } from '@phensley/cldr-schema';
import { Bundle } from '../..';
import { CalendarDate } from '../../systems/calendars';
import { NumberSystem } from '../../systems';
import { DateTimeNode } from '../../parsing/patterns/date';
import { Part } from '../../types';

export interface CalendarRenderer<R> {
  add(type: string, value: string): void;
  build(): R;
}

export class StringRenderer implements CalendarRenderer<string> {
  protected str: string = '';

  add(type: string, value: string): void {
    this.str += value;
  }

  build(): string {
    return this.str;
  }

}

export class PartsRenderer implements CalendarRenderer<Part[]> {
  readonly parts: Part[] = [];

  add(type: string, value: string): void {
    this.parts.push({ type, value });
  }

  build(): Part[] {
    return this.parts;
  }
}

/**
 * All context needed for a single format operation.
 */
export interface CalendarContext<T extends CalendarDate> {
  /**
   * Calendar-specific date
   */
  date: T;

  /**
   * Resource bundle for accessing strings
   */
  bundle: Bundle;

  // TODO: number params necessary?

  /**
   * Numbering system for formatting decimal numbers into strings
   */
  numberSystem: NumberSystem;
}

const fieldTypes: { [x: string]: string } = {
  'G': 'era',
  'y': 'year',
  'Y': 'year'
};

// export type FormatterFunc = <T extends CalendarDate>(ctx: CalendarContext<T>, ch: string, width: number) => string;

export abstract class CalendarFormatter<T extends CalendarDate> {

  // TODO: common calendar interfaces set as properties here

  constructor(
    readonly schema: Schema
  ) { }

  format<R>(renderer: CalendarRenderer<R>, ctx: CalendarContext<T>, nodes: DateTimeNode[]): R {
    for (const n of nodes) {
      if (typeof n === 'string') {
        renderer.add('literal', n);
        continue;
      }
      switch (n[0]) {
        case 'G': renderer.add('era', this.era(ctx, n[1])); break;
        case 'y': renderer.add('year', this.year(ctx, n)); break;
        case 'Y': renderer.add('year', this.yearOfWeekYear(ctx, n)); break;

        // TODO: 'u;
        // TODO: 'U'
        // TODO: 'r'

        case 'Q':
        case 'q': renderer.add('quarter', this.quarter(ctx, n)); break;

        case 'M':
        case 'L': renderer.add('month', this.month(ctx, n)); break;

        // 'l' - deprecated

        case 'w': renderer.add('week', this.weekOfWeekYear(ctx, n)); break;
        case 'W': renderer.add('week', this.weekOfMonth(ctx, n)); break;
        case 'd': renderer.add('day', this.dayOfMonth(ctx, n)); break;
        case 'D': renderer.add('day', this.dayOfYear(ctx, n)); break;
        case 'F': renderer.add('day', this.dayOfWeekInMonth(ctx, n)); break;
        case 'g': renderer.add('mjulian-day', this.modifiedJulianDay(ctx, n)); break;
        case 'E': renderer.add('weekday', this.weekday(ctx, n)); break;
        case 'e': renderer.add('weekday', this.weekdayLocal(ctx, n)); break;
        case 'c': renderer.add('weekday', this.weekdayLocalStandalone(ctx, n)); break;
        case 'a': renderer.add('dayperiod', this.dayPeriod(ctx, n)); break;
        case 'b': renderer.add('dayperiod', this.dayPeriodExt(ctx, n)); break;
        case 'B': renderer.add('dayperiod', this.dayPeriodFlex(ctx, n)); break;

        case 'h':
        case 'H': renderer.add('hour', this.hour(ctx, n)); break;

        case 'K':
        case 'k': renderer.add('hour', this.hourAlt(ctx, n)); break;

        // 'j' - input skeleton symbol
        // 'J' - input skeleton symbol
        // 'C' - input skeleton symbol

        case 'm': renderer.add('minute', this.minute(ctx, n)); break;
        case 's': renderer.add('second', this.second(ctx, n)); break;
        case 'S': renderer.add('fracsec', this.fractionalSecond(ctx, n)); break;

        // 'A'

        case 'z': renderer.add('timezone', this.timezone_z(ctx, n)); break;
        case 'Z': renderer.add('timezone', this.timezone_Z(ctx, n)); break;
        case 'O': renderer.add('timezone', this.timezone_O(ctx, n)); break;
        case 'v': renderer.add('timezone', this.timezone_v(ctx, n)); break;
        case 'V': renderer.add('timezone', this.timezone_V(ctx, n)); break;
        case 'X': renderer.add('timezone', this.timezone_X(ctx, n)); break;
        case 'x': renderer.add('timezone', this.timezone_x(ctx, n)); break;
      }
    }
    return renderer.build();
  }

  era(ctx: CalendarContext<T>, width: number): string {
    return '';
  }

  year(ctx: CalendarContext<T>, node: [string, number]): string {
    const era = ctx.date.era();
    return '';
  }

  yearOfWeekYear(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  quarter(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  month(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  weekOfWeekYear(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  weekOfMonth(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  dayOfMonth(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  dayOfYear(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  dayOfWeekInMonth(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  modifiedJulianDay(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  weekday(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  weekdayLocal(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  weekdayLocalStandalone(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  dayPeriod(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  dayPeriodExt(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  dayPeriodFlex(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  hour(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  hourAlt(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  minute(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  second(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  fractionalSecond(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_z(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_Z(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_O(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_v(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_V(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_X(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  timezone_x(ctx: CalendarContext<T>, node: [string, number]): string {
    return '';
  }

  // Helper methods to lookup fields in the common schema.

  eraField(bundle: Bundle, key: string, width: number): string {
    const eras = this.schema.Gregorian.eras;
    switch (width) {
    case 5:
      return eras(bundle, 'narrow', key);
    case 4:
      return eras(bundle, 'names', key);
    default:
      return eras(bundle, 'abbr', key);
    }
  }

  monthField(bundle: Bundle, key: string, width: number, isLeap: boolean = false): string {
    return '';
  }
}
