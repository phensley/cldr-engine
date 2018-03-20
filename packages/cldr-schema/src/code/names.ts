import { Scope, scope, fieldmap } from './instructions';
import { ScriptValues, TerritoryValues } from '../schema/names';
import { Choice } from '../code';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('scripts', 'scripts', [
    fieldmap('displayName', 'displayName', ScriptValues)
  ]),

  scope('territories', 'territories', [
    fieldmap('displayName', 'displayName', TerritoryValues, Choice.ALT)
  ])

]);
