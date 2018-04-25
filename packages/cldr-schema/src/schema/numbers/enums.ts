import { makeEnum } from '../../types';

export const [ NumberSymbol, NumberSymbolValues ] = makeEnum([
  'currencyDecimal',
  'currencyGroup',
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

export type NumberSymbolType = 'currencyDecimal' | 'currencyGroup' | 'decimal' |
  'exponential' | 'group' | 'infinity' | 'list' | 'minusSign' | 'nan' | 'perMille' |
  'percentSign' | 'plusSign' | 'superscriptingExponent' | 'timeSeparator';

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

export const NumberSystems = ['default', 'native', 'finance', 'traditional'];

export type NumberSystemCategory = 'default' | 'native' | 'finance' | 'traditional';
