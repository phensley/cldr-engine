import {
  FieldArrow,
  ScopeArrow,
  Vector1Arrow,
  Vector2Arrow
} from '../arrows';

import { PluralType } from '../enums';
import { DateFieldType, DateFieldValues,
  RelativeTimeFieldValues, RelativeTimeFieldType } from './enums';
import { KeyIndex } from '../../types';

export const DateFieldIndex = new KeyIndex(DateFieldValues);
export const RelativeTimeFieldIndex = new KeyIndex(RelativeTimeFieldValues);

export interface RelativeTimeFields {
  readonly displayName: Vector1Arrow<DateFieldType>;
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
}
