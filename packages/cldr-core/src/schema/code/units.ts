import { field, scope, vector, Scope } from '../instructions';

const unitInfo = (width: string) =>
  scope(width, width, [
    vector('unitPattern', ['plural-key', 'unit-id']),
    vector('displayName', ['unit-id']),
    vector('perUnitPattern', ['unit-id']),
    field('perPattern'),
    field('timesPattern'),
  ]);

export const UNITS: Scope = scope('Units', 'Units', [unitInfo('long'), unitInfo('narrow'), unitInfo('short')]);
