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

// These are the number systems defined in the numbers schema.
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

// Thse are all of the possible numbering systems we've implemented. Just decimal for now.
export type NumberSystemName = 'adlm' | 'ahom' | 'arab' | 'arabext' | 'bali' | 'beng' |
'bhks' | 'brah' | 'cakm' | 'cham' | 'deva' | 'fullwide' | 'gonm' | 'gujr' | 'guru' |
'hanidec' | 'hmng' | 'java' | 'kali' | 'khmr' | 'knda' | 'lana' | 'lanatham' | 'laoo' |
'latn' | 'lepc' | 'limb' | 'mathbold' | 'mathdbl' | 'mathmono' | 'mathsanb' | 'mathsans' |
'mlym' | 'modi' | 'mong' | 'mroo' | 'mtei' | 'mymr' | 'mymrshan' | 'mymrtlng' | 'newa' |
'nkoo' | 'olck' | 'orya' | 'osma' | 'saur' | 'shrd' | 'sind' | 'sinh' | 'sora' | 'sund' |
'takr' | 'talu' | 'tamldec' | 'telu' | 'thai' | 'tibt' | 'tirh' | 'vaii' | 'wara';

export const NumberSystems = ['default', 'native', 'finance', 'traditional'];

export type NumberSystemCategory = 'default' | 'native' | 'finance' | 'traditional';
