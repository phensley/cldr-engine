import { KeyIndexImpl } from '../../instructions';
import { ContextTransformFieldType, ContextTransformFieldValues } from './autogen.context';

export type ListPatternPositionType = 'start' | 'middle' | 'end' | 'two';

export const ListPatternPositionIndex = new KeyIndexImpl<ListPatternPositionType>(
  ['start', 'middle', 'end', 'two']);

export const ContextTransformFieldIndex = new KeyIndexImpl<ContextTransformFieldType>(
  ContextTransformFieldValues
);
