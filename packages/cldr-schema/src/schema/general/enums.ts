import { KeyIndex } from '../../types';
import { ContextTransformFieldType, ContextTransformFieldValues } from './autogen.context';

export type ListPatternPositionType = 'start' | 'middle' | 'end' | 'two';

export const ListPatternPositionIndex = new KeyIndex<ListPatternPositionType>(
  ['start', 'middle', 'end', 'two']);

export const ContextTransformFieldIndex = new KeyIndex<ContextTransformFieldType>(
  ContextTransformFieldValues
);
