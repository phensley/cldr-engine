import { ContextTransformFieldType, ListPatternPositionType } from '@phensley/cldr-types';
import { KeyIndexImpl } from '../instructions';
import { ContextTransformFieldValues } from './autogen.context';

/**
 * @public
 */
export const ListPatternPositionIndex = new KeyIndexImpl<ListPatternPositionType>(['start', 'middle', 'end', 'two']);

/**
 * @public
 */
export const ContextTransformFieldIndex = new KeyIndexImpl<ContextTransformFieldType>(ContextTransformFieldValues);
