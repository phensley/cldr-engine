import { field, scope, vector1, vector2, Scope } from '../types';
import {
  ContextTransformFieldIndex,
  ListPatternPositionIndex
} from '../schema/general';

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

export const GENERAL_INDICES = {
  'context-transform-field': ContextTransformFieldIndex,
  'list-pattern-position': ListPatternPositionIndex
};

export const CONTEXT_TRANSFORM: Scope = scope('ContextTransforms', 'ContextTransforms', [
  vector1('contextTransforms', 'context-transform-field')
]);
