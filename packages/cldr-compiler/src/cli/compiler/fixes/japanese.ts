import { UnitLength } from '@phensley/cldr-core';

/**
 * Remove spaces in Japanese unit patterns.
 *
 * Our Japanese translators indicate there should be no spaces in these
 * unit patterns, for either standalone or mid-sentence contexts.
 *
 * See:
 *  - https://unicode-org.atlassian.net/browse/CLDR-10556?focusedCommentId=116703
 *  - https://unicode-org.atlassian.net/browse/CLDR-10715
 */
export const fixJapaneseUnits = (data: any) => {
  fix(data, 'long');
  fix(data, 'short');
  fix(data, 'narrow');
};

const fix = (data: any, length: UnitLength) => {
  const units = data.Units[length].unitPattern.other;
  for (const key of Object.keys(units)) {
    const value = units[key];
    const i = value.indexOf('{0}');
    // Ensure no space separates the unit from the quantity "{0}" in the pattern
    units[key] = value.slice(0, i).trim() + '{0}' + value.slice(i + 3).trim();
  }
};
