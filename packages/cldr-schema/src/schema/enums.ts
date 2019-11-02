import { PluralType } from '@phensley/cldr-types';
import { KeyIndex } from '../types/instructions';

export const PluralIndex = new KeyIndex<PluralType>(['other', 'zero', 'one', 'two', 'few', 'many']);

export const AltIndex = new KeyIndex(['none', 'short', 'narrow', 'variant', 'stand-alone']);
