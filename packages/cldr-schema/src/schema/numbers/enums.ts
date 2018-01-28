import { makeEnum } from '../../types';

export const [ NumberSymbol, NumberSymbolValues ] = makeEnum([
  'decimal',
  'exponential',
  'group',
  'infinity',
  'list',
  'minusSign',
  'nan',
  'perMille',
  'percentSign',
  'plusSign',
  'superscriptingExponent',
  'timeSeparator'
]);

export type NumberSymbolType = 'decimal' | 'exponential' | 'group' | 'infinity' |
  'list' | 'minusSign' | 'nan' | 'perMille' | 'percentSign' | 'plusSign' |
  'superscriptingExponent' | 'timeSeparator';
