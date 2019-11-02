import { KeyIndex } from '@phensley/cldr-types';
import { KeyIndexImpl } from '../../instructions';
import { CalendarSchema } from './types';

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

export interface BuddhistSchema extends CalendarSchema {

}

export interface GregorianSchema extends CalendarSchema {

}

export interface JapaneseSchema extends CalendarSchema {

}

export interface PersianSchema extends CalendarSchema {

}

export const BuddhistEraIndex = rangeindex(0, 0);
export const GregorianEraIndex = rangeindex(0, 1);
export const JapaneseEraIndex = rangeindex(0, 236);
export const PersianEraIndex = BuddhistEraIndex;
export const GregorianMonthsIndex = rangeindex(1, 12);
