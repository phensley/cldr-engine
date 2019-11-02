import {
  DateTimePatternFieldType,
  DayPeriodType,
  EraWidthType,
  FieldWidthType,
  FormatWidthType,
  KeyIndex,
  QuarterType,
  WeekdayType
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

export const BuddhistEraIndex = rangeindex(0, 0);
export const GregorianEraIndex = rangeindex(0, 1);
export const JapaneseEraIndex = rangeindex(0, 236);
export const PersianEraIndex = BuddhistEraIndex;
export const GregorianMonthsIndex = rangeindex(1, 12);

export const DateTimePatternFieldValues: DateTimePatternFieldType[] = [
  'y', 'M', 'd', 'a', 'H', 'm', 's'
];

export const DayPeriodValues: DayPeriodType[] = [
  'noon', 'midnight', 'am', 'pm', 'morning1', 'morning2',
  'afternoon1', 'afternoon2', 'evening1', 'evening2', 'night1', 'night2',
];

export const EraWidthValues: EraWidthType[] = [
  'names', 'abbr', 'narrow'
];

export const FieldWidthValues: FieldWidthType[] = [
  'abbreviated', 'narrow', 'short', 'wide'
];

export const FormatWidthValues: FormatWidthType[] = [
  'short', 'medium', 'long', 'full'
];

export const QuarterValues: QuarterType[] = [
  '1', '2', '3', '4'
];

export const WeekdayValues: WeekdayType[] = [
  '1', '2', '3', '4', '5', '6', '7'
];
