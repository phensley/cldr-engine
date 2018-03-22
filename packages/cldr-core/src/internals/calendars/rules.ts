import { base100decode } from '../../resource/encoding';
import { Bundle } from '../../resource';
import { Cache } from '../../utils/cache';
import { binarySearch } from '../../utils/search';

import { dayPeriodKeys, dayPeriodRules } from './autogen.dayperiods';

interface Rule {
  minutes: number[];
  keys: string[];
}

const parseRule = (raw: string): Rule => {
  const parts = raw.split('|');
  const minutes = parts[1].split(' ').map(base100decode);
  const keys = parts[0].split(' ').map(s => dayPeriodKeys[Number(s)]);
  return { keys, minutes };
};

export class DayPeriodRules {

  private cache: Cache<Rule>;

  constructor(protected cacheSize: number) {
    this.cache = new Cache(parseRule, cacheSize);
  }

  get(bundle: Bundle, minutes: number): string | undefined {
    const raw = dayPeriodRules[bundle.languageRegion()] || dayPeriodRules[bundle.language()];
    if (raw === undefined) {
      return undefined;
    }
    const rule = this.cache.get(raw);
    const i = binarySearch(rule.minutes, minutes);
    return rule.keys[i];
  }

}
