import { FieldArrow, ObjectArrow } from '../arrows';

export type LineOrderType = 'ltr' | 'rtl';
export type CharacterOrderType = 'ttb' | 'btt';

export interface LayoutSchema {
  readonly characterOrder: FieldArrow;
  readonly lineOrder: FieldArrow;
}

export interface ListPattern {
  start: string;
  middle: string;
  end: string;
  two: string;
}

export interface ListPatternsSchema {
  readonly and: ObjectArrow<ListPattern>;
  readonly andShort: ObjectArrow<ListPattern>;
  readonly or: ObjectArrow<ListPattern>;
  readonly unitLong: ObjectArrow<ListPattern>;
  readonly unitNarrow: ObjectArrow<ListPattern>;
  readonly unitShort: ObjectArrow<ListPattern>;
}
