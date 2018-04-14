import { field, objectmap, scope, Scope } from '../types';

export const LAYOUT: Scope = scope('Layout', 'Layout', [
  field('characterOrder', 'characterOrder'),
  field('lineOrder', 'lineOrder')
]);

const listPattern = (name: string) => objectmap(name, ['start', 'end', 'middle', 'two']);

export const LIST_PATTERNS: Scope = scope('ListPatterns', 'ListPatterns', [
  listPattern('and'),
  listPattern('andShort'),
  listPattern('or'),
  listPattern('unitLong'),
  listPattern('unitNarrow'),
  listPattern('unitShort')
]);
