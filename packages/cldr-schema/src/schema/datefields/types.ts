import {
  DateFieldType,
  DateFieldWidthType,
  PluralType,
  RelativeTimeFieldType,
  Vector1Arrow,
  Vector2Arrow
} from '@phensley/cldr-types';

import {
  DateFieldValues,
  DateFieldWidthValues,
  RelativeTimeFieldValues
} from './enums';
import { KeyIndexImpl } from '../../instructions';

export const DateFieldIndex = new KeyIndexImpl(DateFieldValues);
export const DateFieldWidthIndex = new KeyIndexImpl(DateFieldWidthValues);
export const RelativeTimeFieldIndex = new KeyIndexImpl(RelativeTimeFieldValues);

export interface RelativeTimeFields {
  readonly previous2: Vector1Arrow<RelativeTimeFieldType>;
  readonly previous: Vector1Arrow<RelativeTimeFieldType>;
  readonly current: Vector1Arrow<RelativeTimeFieldType>;
  readonly next: Vector1Arrow<RelativeTimeFieldType>;
  readonly next2: Vector1Arrow<RelativeTimeFieldType>;
  readonly future: Vector2Arrow<PluralType, RelativeTimeFieldType>;
  readonly past: Vector2Arrow<PluralType, RelativeTimeFieldType>;
}

// TODO: Consider moving these down and using Vector2Arrow including the width.
// it will make some code more compact.

export interface RelativeTimes {
  readonly wide: RelativeTimeFields;
  readonly narrow: RelativeTimeFields;
  readonly short: RelativeTimeFields;
}

export interface DateFieldsSchema {
  readonly relativeTimes: RelativeTimes;
  readonly displayName: Vector2Arrow<DateFieldType, DateFieldWidthType>;
}
