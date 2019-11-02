import { scope, vector1, vector2, Instruction, Scope } from '../instructions';
import { DateFieldIndex, DateFieldWidthIndex, RelativeTimeFieldIndex } from '../schema';

const prevNext: Instruction[] = ['previous2', 'previous', 'current', 'next', 'next2']
  .map(k => vector1(k, 'relative-time-field'));

const futurePast: Instruction[] = ['future', 'past']
  .map(k => vector2(k, 'plural-key', 'relative-time-field'));

const relativeTimeBody = prevNext.concat(futurePast);

const relativeTimes = (width: string) => scope(width, width, relativeTimeBody);

export const DATEFIELDS: Scope = scope('DateFields', 'DateFields', [
  scope('relativeTimes', 'relativeTimes', [
    relativeTimes('wide'),
    relativeTimes('short'),
    relativeTimes('narrow'),
  ]),

  vector2('displayName', 'date-field', 'date-field-width')
]);

export const DATEFIELDS_INDICES = {
  'date-field': DateFieldIndex,
  'date-field-width': DateFieldWidthIndex,
  'relative-time-field': RelativeTimeFieldIndex
};
