import { field, scope, Scope } from './instructions';

export const LAYOUT: Scope = scope('Layout', 'Layout', [
  field('characterOrder', 'characterOrder'),
  field('lineOrder', 'lineOrder')
]);
