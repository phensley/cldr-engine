import { CalendarSchema, PluralType } from '@phensley/cldr-types';
import { coerceDecimal } from '@phensley/decimal';

import { timeData, timeStrings } from './autogen.timedata';
import { Internals } from '../../internals';
import { Bundle } from '../../resource';
import { DatePatternMatcher, DatePatternMatcherEntry, DateSkeleton, DateSkeletonParser } from './skeleton';
import { parseDatePattern, DateTimeNode } from '../../parsing/date';
import { CalendarDate } from '../../systems/calendars';

export interface CachedSkeletonRequest {
  dateSkel?: DateSkeleton;
  date?: DateTimeNode[];
  time?: DateTimeNode[];
}

export interface CachedIntervalRequest {
  date?: DateTimeNode[];
  range?: DateTimeNode[];
  skeleton?: string;
}

export type StandaloneFieldType = 'dayPeriods' | 'eras' | 'months' | 'quarters' | 'weekdays';

export type TwoLevelMap = { [x: string]: { [y: string]: string } };
export type ThreeLevelMap = { [x: string]: { [y: string]: { [z: string]: string } } };

export interface IntervalSkeleton {
  skeleton: DateSkeleton;
  patterns: any;
}

/**
 * Caches all available date formatting patterns for a given calendar schema.
 * We must cache all available skeletons in order to perform best-fit matching
 * to a given input skeleton. We also need to cache the standard date and time
 * patterns for use in best-fit matching.
 */
export class CalendarPatterns {
  protected readonly language: string;

  private readonly region: string;
  private readonly skeletonParser: DateSkeletonParser;
  private readonly dateFormats: { [x: string]: string };
  private readonly timeFormats: { [x: string]: string };
  private readonly wrapperFormats: { [x: string]: string };
  private readonly wrapperFormatsAt: { [x: string]: string };

  private readonly availableMatcher: DatePatternMatcher<any> = new DatePatternMatcher();
  private readonly intervalMatcher: DatePatternMatcher<IntervalSkeleton> = new DatePatternMatcher();

  private readonly rawIntervalFormats: { [x: string]: { [y: string]: string } } = {};
  private readonly intervalFallback: string;

  protected readonly rawAvailableFormats: { [x: string]: string } = {};
  protected readonly rawPluralFormats: { [x: string]: { [y: string]: string } } = {};

  constructor(
    protected readonly bundle: Bundle,
    protected readonly internals: Internals,
    private readonly schema: CalendarSchema,
    readonly cacheSize: number = 50,
  ) {
    this.language = bundle.language();
    this.region = bundle.region();
    this.skeletonParser = this.buildSkeletonParser();

    // Fetch this locale's main formats
    this.dateFormats = schema.dateFormats.mapping(bundle);
    this.timeFormats = schema.timeFormats.mapping(bundle);
    this.wrapperFormats = schema.dateTimeFormats.mapping(bundle);
    this.wrapperFormatsAt = schema.dateTimeFormatsAt.mapping(bundle);

    // Fetch skeletons and build best-fit matchers
    this.rawAvailableFormats = this.schema.availableFormats.mapping(bundle);
    this.rawPluralFormats = this.schema.pluralFormats.mapping(bundle);
    this.rawIntervalFormats = this.schema.intervalFormats.mapping(bundle);
    this.buildAvailableMatcher();
    this.buildIntervalMatcher();

    this.intervalFallback = this.schema.intervalFormatFallback.get(bundle);
  }

  dayPeriods(): ThreeLevelMap {
    return this.schema.standAlone.dayPeriods.mapping(this.bundle);
  }

  eras(): ThreeLevelMap {
    return this.schema.eras.mapping(this.bundle);
  }

  months(): TwoLevelMap {
    return this.schema.standAlone.months.mapping(this.bundle);
  }

  weekdays(): TwoLevelMap {
    return this.schema.standAlone.weekdays.mapping(this.bundle);
  }

  quarters(): TwoLevelMap {
    return this.schema.standAlone.quarters.mapping(this.bundle);
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

  getWrapperPattern(width: string, atTime: boolean): string {
    let w = this.wrapperFormatsAt[width];
    return atTime && w ? w : this.wrapperFormats[width] || '';
  }

  getAvailablePattern(_d: CalendarDate, s: DateSkeleton): DateTimeNode[] {
    const pattern = s.pattern
      ? s.pattern
      : this.rawAvailableFormats[s.skeleton] || (this.rawPluralFormats.other || {})[s.skeleton];
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

  adjustPattern(pattern: DateTimeNode[], skeleton: DateSkeleton, decimal: string): DateTimeNode[] {
    return this.availableMatcher.adjust(pattern, skeleton, decimal);
  }

  matchAvailable(skeleton: DateSkeleton): DateSkeleton {
    return this.availableMatcher.match(skeleton).skeleton;
  }

  matchInterval(skeleton: DateSkeleton): DatePatternMatcherEntry<IntervalSkeleton> | undefined {
    return this.intervalMatcher.match(skeleton);
  }

  private buildSkeletonParser(): DateSkeletonParser {
    const pair = this.getTimeData();
    const allowed = pair[0].split(' ').map(parseDatePattern);
    const preferred = parseDatePattern(pair[1]);
    return new DateSkeletonParser(preferred, allowed[0]);
  }

  private buildAvailableMatcher(): void {
    for (const width of Object.keys(this.dateFormats)) {
      this.availableMatcher.add(this.skeletonParser.parse(this.dateFormats[width], true));
      this.availableMatcher.add(this.skeletonParser.parse(this.timeFormats[width], true));
    }

    // For the pluralized formats use the 'other' category which will
    // be populated for every locale.
    for (const formats of [this.rawAvailableFormats, this.rawPluralFormats.other || {}]) {
      for (const skeleton of Object.keys(formats)) {
        this.availableMatcher.add(this.skeletonParser.parse(skeleton));
      }
    }
    this.availableMatcher.sort();
  }

  private buildIntervalMatcher(): void {
    for (const rawSkeleton of Object.keys(this.rawIntervalFormats)) {
      const patterns = this.rawIntervalFormats[rawSkeleton];
      if (Object.keys(patterns).length === 0) {
        continue;
      }
      const skeleton = this.skeletonParser.parse(rawSkeleton);
      this.intervalMatcher.add(skeleton, { skeleton, patterns });
    }
    this.intervalMatcher.sort();
  }

  getTimeData(): [string, string] {
    const world = timeData['']['001'];
    let region: number | undefined;
    let lang = timeData[this.language];
    if (lang !== undefined) {
      region = lang[this.region];
    }
    if (region === undefined) {
      region = timeData[''][this.region];
    }
    return timeStrings[region !== undefined ? region : world].split('|') as [string, string];
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
        case 'MMMMW':
        case 'yw': {
          const week = coerceDecimal(s.skeleton === 'yw' ? d.weekOfYear() : d.weekOfMonth());
          plural = this.bundle.plurals().cardinal(week) as PluralType;
          pattern = this.rawPluralFormats[plural][s.skeleton];
          break;
        }
        default:
          pattern = this.rawAvailableFormats[s.skeleton];
          break;
      }
    }
    return this.internals.calendars.parseDatePattern(pattern);
  }
}
