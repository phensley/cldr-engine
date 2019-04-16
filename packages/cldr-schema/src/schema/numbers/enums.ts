export type NumberSymbolType = 'currencyDecimal' | 'currencyGroup' | 'decimal' |
  'exponential' | 'group' | 'infinity' | 'list' | 'minusSign' | 'nan' | 'perMille' |
  'percentSign' | 'plusSign' | 'superscriptingExponent' | 'timeSeparator';

export const NumberSymbolValues: NumberSymbolType[] = [
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
];

// Thse are all of the possible numbering systems we've implemented. Just decimal for now.
export type NumberSystemName = 'adlm' | 'ahom' | 'arab' | 'arabext' | 'bali' | 'beng' |
'bhks' | 'brah' | 'cakm' | 'cham' | 'deva' | 'fullwide' | 'gonm' | 'gujr' | 'guru' |
'hanidec' | 'hmng' | 'java' | 'kali' | 'khmr' | 'knda' | 'lana' | 'lanatham' | 'laoo' |
'latn' | 'lepc' | 'limb' | 'mathbold' | 'mathdbl' | 'mathmono' | 'mathsanb' | 'mathsans' |
'mlym' | 'modi' | 'mong' | 'mroo' | 'mtei' | 'mymr' | 'mymrshan' | 'mymrtlng' | 'newa' |
'nkoo' | 'olck' | 'orya' | 'osma' | 'saur' | 'shrd' | 'sind' | 'sinh' | 'sora' | 'sund' |
'takr' | 'talu' | 'tamldec' | 'telu' | 'thai' | 'tibt' | 'tirh' | 'vaii' | 'wara';

export type NumberSystemCategory = 'default' | 'native' | 'finance' | 'traditional';

export const NumberSystemCategoryValues: NumberSystemCategory[] = [
  'default', 'native', 'finance', 'traditional'
];
