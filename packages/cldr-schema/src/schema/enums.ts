import { KeyIndex } from '../types/instructions';

export type PluralType = 'other' | 'zero' | 'one' | 'two' | 'few' | 'many';

export const PluralIndex = new KeyIndex<PluralType>(['other', 'zero', 'one', 'two', 'few', 'many']);

export type AltType = 'none' | 'short' | 'narrow' | 'variant' | 'stand-alone';

export const AltIndex = new KeyIndex(['none', 'short', 'narrow', 'variant', 'stand-alone']);
