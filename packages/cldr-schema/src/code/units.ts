import { scope, vector1, vector2, Scope } from '../types';
import { UnitNameIndex, UnitValues } from '../schema/units';

const unitInfo = (width: string) => scope(width, width, [
  vector2('unitPattern', 'plural-key', 'unit-name'),
  vector1('displayName', 'unit-name')
]);

export const UNITS: Scope = scope('Units', 'Units', [
  unitInfo('long'),
  unitInfo('narrow'),
  unitInfo('short')
]);

export const UNITS_INDICES = {
  'unit-name': UnitNameIndex,
};

export const UNITS_VALUES = {
  'unit-name': UnitValues
};
