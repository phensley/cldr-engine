import { scope, vector1, vector2, Scope } from '../types';

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
