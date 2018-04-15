import { CalendarContext, CalendarFormatter } from './formatter';
import { GregorianDate, ISO8601Date, PersianDate } from '../../systems/calendars';

const GregorianInfo = {
  ERAS: ['0', '1']
};

export class GregorianFormatter extends CalendarFormatter<GregorianDate> {

  era(ctx: CalendarContext<GregorianDate>, width: number): string {
    const key = GregorianInfo.ERAS[ctx.date.era()];
    return this.eraField(ctx.bundle, key, width);
  }

  // month(ctx: CalendarContext<GregorianDate>, field: [string, number]): string {
  //   return '';
  // }

  // year(ctx: CalendarContext<GregorianDate>, field: [string, number]): string {
  //   return '';
  // }

  // yearOfWeekYear(ctx: CalendarContext<GregorianDate>, field: [string, number]): string {
  //   return '';
  // }

}

export class ISO8601Formatter extends GregorianFormatter {

  // month(ctx: CalendarContext<ISO8601Date>, field: [string, number]): string {
  //   return '';
  // }

  // year(ctx: CalendarContext<ISO8601Date>, field: [string, number]): string {
  //   return '';
  // }

  // yearOfWeekYear(ctx: CalendarContext<ISO8601Date>, field: [string, number]): string {
  //   return '';
  // }

}

export class PersianFormatter extends CalendarFormatter<PersianDate> {

  month(ctx: CalendarContext<PersianDate>, field: [string, number]): string {
    return '';
  }

  year(ctx: CalendarContext<PersianDate>, width: number): string {
    return '';
  }

  yearOfWeekYear(ctx: CalendarContext<PersianDate>, width: number): string {
    return '';
  }
}
