import { scope, vector1, vector2, Instruction, Scope } from '../types';
import { DateFieldIndex, RelativeTimeFieldIndex } from '../schema';

const prevNext: Instruction[] = ['previous2', 'previous', 'current', 'next', 'next2']
  .map(k => vector1(k, 'relative-time-field'));

const futurePast: Instruction[] = ['future', 'past']
  .map(k => vector2(k, 'plural-key', 'relative-time-field'));

const displayName = vector1('displayName', 'date-field');

const relativeTimeBody = prevNext.concat(futurePast).concat([displayName]);

const relativeTimes = (width: string) => scope(width, width, relativeTimeBody);

export const DATEFIELDS: Scope = scope('DateFields', 'DateFields', [
  scope('relativeTimes', 'relativeTimes', [
    relativeTimes('wide'),
    relativeTimes('short'),
    relativeTimes('narrow'),
  ]),
]);

export const DATEFIELDS_INDICES = {
  'date-field': DateFieldIndex,
  'relative-time-field': RelativeTimeFieldIndex
};
