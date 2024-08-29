import { Locale } from '@phensley/cldr-core';
import { fixJapaneseUnits } from './japanese';

/**
 * Occasionally there are issues with the upstream data that
 * we need to resolve. We could do this via the patching feature
 * but since we're doing this internally that extra overhead is
 * unnecessary.
 */
export const applyFixes = (locale: Locale, data: any) => {
  if (locale.tag.language() === 'ja') {
    fixJapaneseUnits(data);
  }
};
