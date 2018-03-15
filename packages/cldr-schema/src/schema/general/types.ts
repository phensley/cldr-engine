import { FieldArrow } from '../arrows';

export type LineOrderType = 'ltr' | 'rtl';
export type CharacterOrderType = 'ttb' | 'btt';

export interface Layout {
  readonly characterOrder: FieldArrow;
  readonly lineOrder: FieldArrow;
}
