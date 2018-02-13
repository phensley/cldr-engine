import { FieldArrow, FieldIndexedArrow } from '../arrows';
import { CurrencyType } from './autogen.currencies';
import { Alt, Plural } from '../enums';

export interface CurrencyInfo {
  readonly displayName: FieldArrow;
  readonly pluralName: FieldIndexedArrow<Plural>;
  readonly symbol: FieldIndexedArrow<Alt>;
}

export interface Currencies {
  (code: CurrencyType): CurrencyInfo;
}
