import {
  GregorianMonthsIndex,
  // JapaneseAvailableFormatIndex,
  JapaneseEraIndex,
  JapaneseIntervalFormatIndex,
} from '../schema';

import { calendarScope } from './common';
import { KeyIndexMap } from '../types';

export const JAPANESE = calendarScope('japanese', 'Japanese');

export const JAPANESE_INDICES: KeyIndexMap = {
  // 'japanese-available-format': JapaneseAvailableFormatIndex,
  'japanese-era': JapaneseEraIndex,
  'japanese-interval-format': JapaneseIntervalFormatIndex,
  'japanese-month': GregorianMonthsIndex
};
