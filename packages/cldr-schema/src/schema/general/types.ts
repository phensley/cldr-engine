import { FieldArrow, Vector1Arrow } from '../arrows';
import { ListPatternPositionType } from './enums';
import { ContextTransformType } from './autogen.context';

export type LineOrderType = 'ltr' | 'rtl';
export type CharacterOrderType = 'ttb' | 'btt';
export type ContextType = 'standalone' | 'ui-list-or-menu';

export interface LayoutSchema {
  readonly characterOrder: FieldArrow;
  readonly lineOrder: FieldArrow;
}

export interface ListPatternsSchema {
  readonly and: Vector1Arrow<ListPatternPositionType>;
  readonly andShort: Vector1Arrow<ListPatternPositionType>;
  readonly or: Vector1Arrow<ListPatternPositionType>;
  readonly unitLong: Vector1Arrow<ListPatternPositionType>;
  readonly unitNarrow: Vector1Arrow<ListPatternPositionType>;
  readonly unitShort: Vector1Arrow<ListPatternPositionType>;
}

export interface ContextTransformSchema {
  readonly contextTransforms: Vector1Arrow<ContextTransformType>;
}
