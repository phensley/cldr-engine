import {
  DateTimePatternFieldType,
  DayPeriodType,
  EraWidthType,
  FieldWidthType,
  FormatWidthType,
  KeyIndex,
  QuarterType,
  WeekdayType,
} from '@phensley/cldr-types';
import { KeyIndexImpl } from '../instructions';

/**
 * Generate a key index containing numeric keys from start to end
 * inclusive.
 */
const rangeindex = (start: number, end: number): KeyIndex<string> => {
  const r: string[] = [];
  for (let i = start; i <= end; i++) {
    r.push(String(i));
  }
  return new KeyIndexImpl(r);
};

/**
 * @public
 */
export const BuddhistEraIndex = rangeindex(0, 0);

/**
 * @public
 */
export const GregorianEraIndex = rangeindex(0, 1);

/**
 * @public
 */
export const JapaneseEraIndex = rangeindex(0, 236);

/**
 * @public
 */
export const PersianEraIndex = BuddhistEraIndex;

/**
 * @public
 */
export const GregorianMonthsIndex = rangeindex(1, 12);

/**
 * @public
 */
export const DateTimePatternFieldValues: DateTimePatternFieldType[] = [
  'G',
  'y',
  'M',
  'd',
  'a',
  'B',
  'H',
  'h',
  'm',
  's',
];

/**
 * @public
 */
export const DayPeriodValues: DayPeriodType[] = [
  'noon',
  'midnight',
  'am',
  'pm',
  'morning1',
  'morning2',
  'afternoon1',
  'afternoon2',
  'evening1',
  'evening2',
  'night1',
  'night2',
];

/**
 * @public
 */
export const EraWidthValues: EraWidthType[] = ['names', 'abbr', 'narrow'];

/**
 * @public
 */
export const FieldWidthValues: FieldWidthType[] = ['abbreviated', 'narrow', 'short', 'wide'];

/**
 * @public
 */
export const FormatWidthValues: FormatWidthType[] = ['short', 'medium', 'long', 'full'];

/**
 * @public
 */
export const QuarterValues: QuarterType[] = ['1', '2', '3', '4'];

/**
 * @public
 */
export const WeekdayValues: WeekdayType[] = ['1', '2', '3', '4', '5', '6', '7'];
