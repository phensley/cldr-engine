import { Choice, Scope, ScopeMap, field, scope, scopemap } from './instructions';
import { UnitValues } from '../schema/units';

const unitInfo = (n: string): ScopeMap => scopemap(n, UnitValues, [
  field('displayName', 'displayName'),
  field('unitPattern', 'unitPattern', Choice.PLURAL)
]);

export const UNITS: Scope = scope('Units', 'Units', [
  unitInfo('long'),
  unitInfo('narrow'),
  unitInfo('short')
]);
