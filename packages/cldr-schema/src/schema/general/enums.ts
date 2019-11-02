import { ContextTransformFieldType, ListPatternPositionType } from '@phensley/cldr-types';
import { KeyIndexImpl } from '../../instructions';
import { ContextTransformFieldValues } from './autogen.context';

export const ListPatternPositionIndex = new KeyIndexImpl<ListPatternPositionType>(
  ['start', 'middle', 'end', 'two']);

export const ContextTransformFieldIndex = new KeyIndexImpl<ContextTransformFieldType>(
  ContextTransformFieldValues
);
