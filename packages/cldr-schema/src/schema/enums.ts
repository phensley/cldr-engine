import { PluralType } from '@phensley/cldr-types';
import { KeyIndexImpl } from '../instructions';

/**
 * @public
 */
export const PluralIndex = new KeyIndexImpl<PluralType>(['other', 'zero', 'one', 'two', 'few', 'many']);

/**
 * @public
 */
export const AltIndex = new KeyIndexImpl(['none', 'short', 'narrow', 'variant', 'stand-alone', 'long', 'menu']);
