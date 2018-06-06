import { scope, vector1, vector2, Scope } from '../types';
import { RegionIdIndex, ScriptIdIndex } from '../schema/names';
import { AltIndex } from '../schema';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('scripts', 'scripts', [
    vector1('displayName', ScriptIdIndex)
  ]),

  scope('regions', 'regions', [
    vector2('displayName', AltIndex, RegionIdIndex)
  ])

]);
