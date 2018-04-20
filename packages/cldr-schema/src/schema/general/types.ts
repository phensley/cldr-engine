import { FieldArrow, Vector1Arrow } from '../arrows';
import { ListPatternPositionType } from './enums';

export type LineOrderType = 'ltr' | 'rtl';
export type CharacterOrderType = 'ttb' | 'btt';

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
