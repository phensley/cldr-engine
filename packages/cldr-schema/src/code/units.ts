import { field, scope, vector1, vector2, Scope } from '../types';

const unitInfo = (width: string) => scope(width, width, [
  vector2('unitPattern', 'plural-key', 'unit-id'),
  vector1('displayName', 'unit-id'),
  vector1('perUnitPattern', 'unit-id'),
  field('compoundUnitPattern')
]);

export const UNITS: Scope = scope('Units', 'Units', [
  unitInfo('long'),
  unitInfo('narrow'),
  unitInfo('short')
]);
