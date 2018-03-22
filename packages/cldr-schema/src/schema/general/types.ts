import { FieldArrow } from '../arrows';

export type LineOrderType = 'ltr' | 'rtl';
export type CharacterOrderType = 'ttb' | 'btt';

export interface LayoutSchema {
  readonly characterOrder: FieldArrow;
  readonly lineOrder: FieldArrow;
}
