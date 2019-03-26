import { binarySearch, vuintDecode, z85Decode, Cache } from '@phensley/cldr-utils';

import { DayPeriodType } from '@phensley/cldr-schema';
import { Bundle } from '../../resource/bundle';

import { dayPeriodKeys, dayPeriodRules } from './autogen.dayperiods';

interface Rule {
  minutes: number[];
  keys: DayPeriodType[];
}

const parseRule = (raw: string): Rule => {
  const parts = raw.split('|');
  const minutes = vuintDecode(z85Decode(parts[1]));
  const keys = parts[0].split(' ').map(s => dayPeriodKeys[Number(s)]);
  return { keys, minutes };
};

export class DayPeriodRules {

  private cache: Cache<Rule>;

  constructor(protected cacheSize: number) {
    this.cache = new Cache(parseRule, cacheSize);
  }

  get(bundle: Bundle, minutes: number): DayPeriodType | undefined {
    const raw = dayPeriodRules[bundle.languageRegion()] || dayPeriodRules[bundle.language()];
    if (raw === undefined) {
      return undefined;
    }
    const rule = this.cache.get(raw);
    const i = binarySearch(rule.minutes, true, minutes);
    return rule.keys[i];
  }

}
