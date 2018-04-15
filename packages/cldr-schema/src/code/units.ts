import { Scope, scope, vector1, vector2 } from '../types';
import { PluralIndex } from '../schema';
import { UnitNameIndex, UnitValues } from '../schema/units';

const unitInfo = (width: string) => scope(width, width, [
  vector2('unitPattern', PluralIndex, UnitNameIndex),
  vector1('displayName', UnitNameIndex)
]);

export const UNITS: Scope = scope('Units', 'Units', [
  unitInfo('long'),
  unitInfo('narrow'),
  unitInfo('short')
]);
