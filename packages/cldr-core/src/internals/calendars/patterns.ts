import { CalendarSchema, PluralType } from '@phensley/cldr-schema';
import { coerceDecimal } from '@phensley/decimal';
import { LRU } from '@phensley/cldr-utils';

import { timeData, timeStrings } from './autogen.timedata';
import { Internals } from '../../internals';
import { Bundle } from '../../resource';
import { DatePatternMatcher, DateSkeleton, DateSkeletonParser } from './skeleton';
import { parseDatePattern, DateTimeNode } from '../../parsing/date';
import { CalendarDate } from '../../systems/calendars';
import { pluralRules } from '../../systems/plurals';

export interface CachedSkeletonRequest {
  dateSkel?: DateSkeleton;
  timeSkel?: DateSkeleton;
  date?: DateTimeNode[];
  time?: DateTimeNode[];
}

export interface CachedIntervalRequest {
  date?: DateTimeNode[];
  range?: DateTimeNode[];
  skeleton?: string;
}

export type StandaloneFieldType = 'dayPeriods' | 'eras' | 'months' | 'quarters' | 'weekdays';

export type TwoLevelMap = { [x: string]: |{ [y: string]: string } };

/**
 * Caches all available date formatting patterns for a given calendar schema.
 * We must cache all available skeletons in order to perform best-fit matching
 * to a given input skeleton. We also need to cache the standard date and time
 * patterns for use in best-fit matching.
 */
export class CalendarPatterns {

  protected language: string;
  protected region: string;
  protected namesCache: LRU<{ [x: string]: { [y: string]: string } }>;
  protected skeletonParser: DateSkeletonParser;
  protected skeletonRequestCache: LRU<CachedSkeletonRequest>;
  protected intervalRequestCache: LRU<CachedIntervalRequest>;
  protected dateFormats: { [x: string]: string };
  protected timeFormats: { [x: string]: string };
  protected wrapperFormats: { [x: string]: string };

  protected availableMatcher: DatePatternMatcher = new DatePatternMatcher();
  protected intervalMatcher: { [x: string]: DatePatternMatcher } = {};

  protected rawAvailableFormats: { [x: string]: string } = {};
  protected rawPluralFormats: { [x: string]: { [y: string]: string } } = {};
  protected rawIntervalFormats: { [x: string]: { [y: string]: string } } = {};
  protected intervalFallback: string;

  constructor(
    readonly bundle: Bundle,
    readonly internals: Internals,
    readonly schema: CalendarSchema,
    readonly cacheSize: number = 50
  ) {
    this.language = bundle.language();
    this.region = bundle.region();
    this.skeletonParser = this.buildSkeletonParser();
    this.skeletonRequestCache = new LRU(cacheSize);
    this.intervalRequestCache = new LRU(cacheSize);
    this.namesCache = new LRU(cacheSize);

    // Fetch this locale's main formats
    this.dateFormats = schema.dateFormats.mapping(bundle);
    this.timeFormats = schema.timeFormats.mapping(bundle);
    this.wrapperFormats = schema.dateTimeFormats.mapping(bundle);

    // Fetch skeletons and build best-fit matchers
    this.rawAvailableFormats = this.schema.availableFormats.mapping(bundle);
    this.rawPluralFormats = this.schema.pluralFormats.mapping(bundle);
    this.rawIntervalFormats = this.schema.intervalFormats.mapping(bundle);
    this.buildAvailableMatcher();
    this.buildIntervalMatcher();

    this.intervalFallback = this.schema.intervalFormatFallback.get(bundle);
  }

  dayPeriods(): TwoLevelMap {
    return this._getStandalone('dayPeriods');
  }

  eras(): TwoLevelMap {
    return this._getStandalone('eras');
  }

  months(): TwoLevelMap {
    return this._getStandalone('months');
  }

  weekdays(): TwoLevelMap {
    return this._getStandalone('weekdays');
  }

  quarters(): TwoLevelMap {
    return this._getStandalone('quarters');
  }

  _getStandalone(key: StandaloneFieldType): TwoLevelMap {
    let entry = this.namesCache.get(key);
    if (entry === undefined) {
      switch (key) {
        case 'eras':
          entry = this.schema.eras.mapping(this.bundle);
          break;
        default:
          entry = this.schema.standAlone[key].mapping(this.bundle);
          break;
      }
      this.namesCache.set(key, entry);
    }
    return entry;
  }

  parseSkeleton(raw: string): DateSkeleton {
    return this.skeletonParser.parse(raw);
  }

  getDatePattern(width: string): DateTimeNode[] {
    return this.internals.calendars.parseDatePattern(this.dateFormats[width] || '');
  }

  getTimePattern(width: string): DateTimeNode[] {
    return this.internals.calendars.parseDatePattern(this.timeFormats[width] || '');
  }

  getCachedSkeletonRequest(key: string): CachedSkeletonRequest | undefined {
    return this.skeletonRequestCache.get(key);
  }

  setCachedSkeletonRequest(key: string, req: CachedSkeletonRequest): void {
    this.skeletonRequestCache.set(key, req);
  }

  getCachedIntervalRequest(key: string): CachedIntervalRequest | undefined {
    return this.intervalRequestCache.get(key);
  }

  setCachedIntervalRequest(key: string, req: CachedIntervalRequest): void {
    this.intervalRequestCache.set(key, req);
  }

  getWrapperPattern(width: string): string {
    return this.wrapperFormats[width] || '';
  }

  getAvailablePattern(_d: CalendarDate, s: DateSkeleton): DateTimeNode[] {
    const pattern = s.pattern ? s.pattern :
      this.rawAvailableFormats[s.skeleton] || (this.rawPluralFormats.other || {})[s.skeleton];
    return this.internals.calendars.parseDatePattern(pattern || '');
  }

  getIntervalPattern(field: string, skeleton: string): DateTimeNode[] {
    const group = this.rawIntervalFormats[field];
    const pattern = group ? group[skeleton] : '';
    return this.internals.calendars.parseDatePattern(pattern || '');
  }

  getIntervalFallback(): string {
    return this.intervalFallback;
  }

  adjustPattern(pattern: DateTimeNode[], skeleton: DateSkeleton, decimal: string = '.'): DateTimeNode[] {
    return this.availableMatcher.adjust(pattern, skeleton, decimal);
  }

  matchAvailable(skeleton: DateSkeleton): DateSkeleton {
    return this.availableMatcher.match(skeleton);
  }

  matchInterval(skeleton: DateSkeleton, field: string): DateSkeleton {
    field = field === 's' ? 'm' : field;
    return this.intervalMatcher[field].match(skeleton);
  }

  protected buildSkeletonParser(): DateSkeletonParser {
    const pair = this.getTimeData();
    const allowedFlex = pair[0].split(' ').map(parseDatePattern);
    const preferredFlex = parseDatePattern(pair[1]);
    return new DateSkeletonParser(preferredFlex, allowedFlex[0]);
  }

  protected buildAvailableMatcher(): void {
    for (const width of Object.keys(this.dateFormats)) {
      this.availableMatcher.add(this.skeletonParser.parse(this.dateFormats[width], true));
      this.availableMatcher.add(this.skeletonParser.parse(this.timeFormats[width], true));
    }

    // For the pluralized formats use the 'other' category which will
    // be populated for every locale.
    for (const formats of [this.rawAvailableFormats, this.rawPluralFormats.other || {}]) {
      for (const skeleton of Object.keys(formats)) {
        // Only add skeletons which point to valid formats for this locale. Not all
        // skeletons are implemented for all locales.
        if (formats[skeleton]) {
          this.availableMatcher.add(this.skeletonParser.parse(skeleton));
        }
      }
    }
  }

  protected buildIntervalMatcher(): void {
    for (const field of Object.keys(this.rawIntervalFormats)) {
      const group = this.rawIntervalFormats[field];
      const m = new DatePatternMatcher();
      for (const skeleton of Object.keys(group)) {
        // Only add skeletons which point to valid formats for this locale. Not all
        // skeletons are implemented for all locales.
        if (group[skeleton]) {
          m.add(this.skeletonParser.parse(skeleton));
        }
      }
      this.intervalMatcher[field] = m;
    }
  }

  protected getTimeData(): [string, string] {
    const w = timeData['']['001'];
    const t = timeData[''][this.region] || (timeData[this.language] || {})[this.region];
    return timeStrings[(t !== undefined ? t : w)].split('|') as [string, string];
  }

}

export class GregorianPatterns extends CalendarPatterns {

  /**
   * Apply pluralization rules to select a skeleton pattern. Note: this is slightly
   * future-proofing since at the time of this writing these patterns don't actually
   * differ based on the plural category. This is here so the design has a chance of
   * supporting pluralization of skeleton patterns in the future.
   */
  getAvailablePattern(d: CalendarDate, s: DateSkeleton): DateTimeNode[] {
    let plural: PluralType = 'other';
    let pattern = s.pattern;
    if (!pattern) {
      switch (s.skeleton) {
        case 'MMMMW': {
          const week = coerceDecimal(d.weekOfMonth());
          plural = pluralRules.cardinal(this.language, week.operands());
          pattern = this.rawPluralFormats[plural][s.skeleton];
          break;
        }
        case 'yw': {
          const week = coerceDecimal(d.weekOfYear());
          plural = pluralRules.cardinal(this.language, week.operands());
          pattern = this.rawPluralFormats[plural][s.skeleton];
          break;
        }
        default:
          pattern = this.rawAvailableFormats[s.skeleton];
          break;
      }
    }
    return this.internals.calendars.parseDatePattern(pattern || '');
  }

}
