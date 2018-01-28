import { FieldArrow, FieldIndexedArrow } from '../arrows';
import { CurrencyType } from './autogen.currencies';
import { Plural } from '../enums';

export interface CurrencyInfo {
  readonly displayName: FieldArrow;
  readonly pluralName: FieldIndexedArrow<Plural>;
  readonly symbol: FieldArrow;
}

export interface Currencies {
  (code: CurrencyType): CurrencyInfo;
}
