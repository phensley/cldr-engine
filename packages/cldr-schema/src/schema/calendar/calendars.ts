import { KeyIndex } from '../../types';
import {  CalendarSchema } from './types';

const rangeindex = (s: number, e: number): KeyIndex<string> => {
  const r: string[] = [];
  for (let i = s; i <= e; i++) {
    r.push(String(i));
  }
  return new KeyIndex(r);
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
