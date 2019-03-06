import { field, scope, vector1, Scope } from '../types';
import { ListPatternPositionIndex } from '../schema/general';

export const LAYOUT: Scope = scope('Layout', 'Layout', [
  field('characterOrder'),
  field('lineOrder')
]);

const listPattern = (name: string) => vector1(name, 'list-pattern-position');

export const LIST_PATTERNS: Scope = scope('ListPatterns', 'ListPatterns', [
  listPattern('and'),
  listPattern('andShort'),
  listPattern('or'),
  listPattern('unitLong'),
  listPattern('unitNarrow'),
  listPattern('unitShort')
]);

export const LIST_PATTERNS_INDICES = {
  'list-pattern-position': ListPatternPositionIndex
};
