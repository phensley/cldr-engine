import { Bundle } from '../../resource';
import { DateTimeNode } from '../../parsing/patterns/date';
import { CalendarDate } from '../../systems/calendars';
import { NumberingSystem } from '../../systems/numbering';
import { Renderer } from '../../utils/render';

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

  // TODO: number params

  /**
   * Numbering system for formatting decimal numbers into strings
   */
  system: NumberingSystem;

  /**
   * Latin decimal digit numbering system.
   */
  latnSystem: NumberingSystem;
}

export interface CalendarFormatter<T extends CalendarDate> {

  format<R>(rnd: Renderer<R>, ctx: CalendarContext<T>, nodes: DateTimeNode[]): void;

}
