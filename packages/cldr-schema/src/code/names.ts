import { scope, vector2, Scope } from '../instructions';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('languages', 'languages', [
    vector2('displayName', 'alt-key', 'language-id')
  ]),

  scope('scripts', 'scripts', [
    vector2('displayName', 'alt-key', 'script-id')
  ]),

  scope('regions', 'regions', [
    vector2('displayName', 'alt-key', 'region-id')
  ])

]);
