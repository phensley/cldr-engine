import { Scope, field, scope, vector1 } from '../types';
import { ListPatternPositionIndex } from '../schema/general';

export const LAYOUT: Scope = scope('Layout', 'Layout', [
  field('characterOrder', 'characterOrder'),
  field('lineOrder', 'lineOrder')
]);

const listPattern = (name: string) => vector1(name, ListPatternPositionIndex);

export const LIST_PATTERNS: Scope = scope('ListPatterns', 'ListPatterns', [
  listPattern('and'),
  listPattern('andShort'),
  listPattern('or'),
  listPattern('unitLong'),
  listPattern('unitNarrow'),
  listPattern('unitShort')
]);
