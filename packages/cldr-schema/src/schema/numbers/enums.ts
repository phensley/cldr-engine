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

export const [ NumberSystemName, NumberSystemNameValues ] = makeEnum([
  'arab',
  'arabext',
  'beng',
  'deva',
  'gujr',
  'guru',
  'hanidec',
  'khmr',
  'knda',
  'laoo',
  'latn',
  'mlym',
  'mymr',
  'tamldec',
  'telu',
  'thai'
]);

export type NumberSystemName = 'arab' | 'arabext' | 'beng' | 'deva' | 'gujr' | 'guru' |
  'hanidec' | 'khmr' | 'knda' | 'laoo' | 'latn' | 'mlym' | 'mymr' | 'tamldec' | 'telu' | 'thai';

export const NumberSystemTypes = ['default', 'native', 'finance', 'traditional'];
