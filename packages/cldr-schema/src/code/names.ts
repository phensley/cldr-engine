import { Choice, Scope, scope, fieldmap, vector1, vector2 } from '../types';
import { ScriptIdIndex, RegionIdIndex } from '../schema/names';
import { AltIndex } from '../schema';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('scripts', 'scripts', [
    vector1('displayName', 'displayName', ScriptIdIndex)
  ]),

  scope('territories', 'regions', [
    vector2('displayName', 'displayName', AltIndex, RegionIdIndex)
  ])

]);
