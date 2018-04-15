import { Instruction, Scope, scope, vector1, vector2 } from '../types';
import { DateFieldIndex, PluralIndex, RelativeTimeFieldIndex } from '../schema';

const prevNext: Instruction[] = ['previous2', 'previous', 'current', 'next', 'next2']
  .map(k => vector1(k, k, RelativeTimeFieldIndex));

const futurePast: Instruction[] = ['future', 'past']
  .map(k => vector2(k, k, PluralIndex, RelativeTimeFieldIndex));

const displayName = vector1('displayName', 'displayName', DateFieldIndex);

const relativeTimeBody = prevNext.concat(futurePast).concat([displayName]);

const relativeTimes = (width: string) => scope(width, width, relativeTimeBody);

export const DATEFIELDS: Scope = scope('DateFields', 'DateFields', [
  scope('relativeTimes', 'relativeTimes', [
    relativeTimes('wide'),
    relativeTimes('short'),
    relativeTimes('narrow'),
  ]),
]);
