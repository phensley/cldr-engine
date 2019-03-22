import { KeyIndex } from '../../types';
import { ContextTransformType, ContextTransformValues } from './autogen.context';

export type ListPatternPositionType = 'start' | 'middle' | 'end' | 'two';

export const ListPatternPositionIndex = new KeyIndex<ListPatternPositionType>(
  ['start', 'middle', 'end', 'two']);

export const ContextTransformIndex = new KeyIndex<ContextTransformType>(
  ContextTransformValues
);
