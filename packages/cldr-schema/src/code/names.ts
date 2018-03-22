import { Scope, scope, fieldmap } from './instructions';
import { ScriptIdValues, RegionIdValues } from '../schema/names';
import { Choice } from '../code';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('scripts', 'scripts', [
    fieldmap('displayName', 'displayName', ScriptIdValues)
  ]),

  scope('territories', 'regions', [
    fieldmap('displayName', 'displayName', RegionIdValues, Choice.ALT)
  ])

]);
