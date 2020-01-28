import { PluralType } from '@phensley/cldr-types';
import { KeyIndexImpl } from '../instructions';

export const PluralIndex = new KeyIndexImpl<PluralType>(['other', 'zero', 'one', 'two', 'few', 'many']);

export const AltIndex = new KeyIndexImpl(['none', 'short', 'narrow', 'variant', 'stand-alone', 'long', 'menu']);
