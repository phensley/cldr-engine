import { scope, vector, Scope } from '../instructions';

export const NAMES: Scope = scope('Names', 'Names', [

  scope('languages', 'languages', [
    vector('displayName', ['alt-key', 'language-id'])
  ]),

  scope('scripts', 'scripts', [
    vector('displayName', ['alt-key', 'script-id'])
  ]),

  scope('regions', 'regions', [
    vector('displayName', ['alt-key', 'region-id'])
  ])

]);
