import {
  FieldArrow,
  FieldIndexedArrow,
  FieldMapArrow,
  FieldMapIndexedArrow,
  ScopeArrow
} from '../arrows';

import { Alt, Plural } from '../enums';
import { DateFieldType } from './enums';

export interface RelativeTimeFields {
  readonly pattern: FieldIndexedArrow<Plural>;
}

export interface RelativeFields {
  readonly previous: FieldArrow;
  readonly current: FieldArrow;
  readonly next: FieldArrow;
  readonly future: RelativeTimeFields;
  readonly past: RelativeTimeFields;
}

export interface RelativeTimes {
  readonly wide: RelativeFields;
  readonly short: RelativeFields;
  readonly narrow: RelativeFields;
}

export interface DateFieldsSchema {
  readonly relativeTimes: ScopeArrow<DateFieldType, RelativeTimes>;
}
