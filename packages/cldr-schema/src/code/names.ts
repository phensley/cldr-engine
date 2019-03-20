import { scope, vector1, vector2, Scope } from '../types';
import { LanguageIdIndex, RegionIdIndex, ScriptIdIndex } from '../schema/names';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('languages', 'languages', [
    vector1('displayName', 'language-id')
  ]),

  scope('scripts', 'scripts', [
    vector1('displayName', 'script-id')
  ]),

  scope('regions', 'regions', [
    vector2('displayName', 'alt-key', 'region-id')
  ])

]);

export const NAMES_INDICES = {
  'language-id': LanguageIdIndex,
  'region-id': RegionIdIndex,
  'script-id': ScriptIdIndex
};
