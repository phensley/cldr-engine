import { KeyIndex } from '../../types';

export type ListPatternPositionType = 'start' | 'middle' | 'end' | 'two';

export const ListPatternPositionIndex = new KeyIndex<ListPatternPositionType>(
  ['start', 'middle', 'end', 'two']);
