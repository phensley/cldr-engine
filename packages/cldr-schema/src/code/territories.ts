import { Scope, scope, fieldmap } from './instructions';
import { TerritoryValues } from '../schema/territories';
import { Choice } from '../code';

export const TERRITORIES: Scope = scope('Territories', 'Territories', [
  fieldmap('territories', 'displayName', TerritoryValues, Choice.ALT)
]);
