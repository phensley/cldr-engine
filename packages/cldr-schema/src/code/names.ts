import { Choice, Scope, scope, fieldmap } from '../types';
import { ScriptIdValues, RegionIdValues } from '../schema/names';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('scripts', 'scripts', [
    fieldmap('displayName', 'displayName', ScriptIdValues)
  ]),

  scope('territories', 'regions', [
    fieldmap('displayName', 'displayName', RegionIdValues, Choice.ALT)
  ])

]);
