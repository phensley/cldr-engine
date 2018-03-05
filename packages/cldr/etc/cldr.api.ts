// @alpha
class CLDR {
  constructor(options: CLDROptions);
  protected _get(locale: Locale, pack: Pack): Engine;
  // (undocumented)
  protected readonly asyncLoader?: (language: string) => Promise<any>;
  // (undocumented)
  availableLocales(): Locale[];
  get(locale: Locale | string): Engine;
  getAsync(locale: Locale | string): Promise<Engine>;
  getLocaleMatcher(supported: string | string[]): LocaleMatcher;
  // (undocumented)
  protected readonly gregorianInternal: GregorianInternal;
  // (undocumented)
  info(): string;
  // (undocumented)
  protected readonly loader?: (language: string) => any;
  // (undocumented)
  protected readonly namesInternal: NamesInternal;
  // (undocumented)
  protected readonly numbersInternal: NumbersInternal;
  // (undocumented)
  protected readonly options: CLDROptions;
  // (undocumented)
  protected readonly outstanding: Map<string, Promise<Engine>>;
  // (undocumented)
  protected readonly packCache: LRU<string, Pack>;
  parseLocale(id: string): Locale;
  // (undocumented)
  protected readonly wrapperInternal: WrapperInternal;
}

// @alpha
class CLDROptions {
  // (undocumented)
  asyncLoader?: (language: string) => Promise<any>;
  loader?: (language: string) => any;
  packCacheSize?: number;
  patternCacheSize?: number;
}

// @alpha
class Decimal {
  constructor(num: number | string | Decimal);
  protected _format(formatter: Formatter<any>, decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number): void;
  protected _increment(): void;
  protected _parse(str: string): string | undefined;
  // (undocumented)
  add(v: Decimal): Decimal;
  protected addsub(u: Decimal, v: Decimal, vsign: number): Decimal;
  alignexp(): number;
  protected checkDivision(v: Decimal): Decimal | undefined;
  compare(v: Decimal, abs?: boolean): number;
  // (undocumented)
  protected data: number[];
  divide(v: Decimal, context?: MathContext): Decimal;
  divmod(v: Decimal): [Decimal, Decimal];
  // (undocumented)
  protected exp: number;
  format(decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number): string;
  formatParts(decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number): Part[];
  // (undocumented)
  protected static fromRaw(sign: number, exp: number, data: number[]): Decimal;
  integerDigits(): number;
  isInteger(): boolean;
  isNegative(): boolean;
  protected isodd(): boolean;
  movePoint(n: number): Decimal;
  // (undocumented)
  multiply(v: Decimal): Decimal;
  negate(): Decimal;
  operands(): NumberOperands;
  protected parse(arg: string | number): void;
  precision(): number;
  protected round(rnd: number, mode: RoundingMode): number;
  scale(): number;
  setScale(scale: number, roundingMode?: RoundingMode): Decimal;
  shiftleft(shift: number): Decimal;
  shiftright(shift: number, mode?: RoundingMode): Decimal;
  // (undocumented)
  protected sign: number;
  // (undocumented)
  signum(): number;
  size(n: number): number;
  stripTrailingZeros(): Decimal;
  // (undocumented)
  subtract(v: Decimal): Decimal;
  toString(): string;
  trailingZeros(): number;
  protected trim(): Decimal;
}

// @alpha
interface Engine {
  // (undocumented)
  readonly Gregorian: GregorianEngine;
  // (undocumented)
  readonly locale: Locale;
  // (undocumented)
  readonly Names: NamesEngine;
  // (undocumented)
  readonly Numbers: NumbersEngine;
}

// @alpha
class LanguageTag {
  constructor(language?: string, script?: string, region?: string, variant?: string, extensions?: string[], privateUse?: string);
  // (undocumented)
  protected _extensions?: string[];
  // (undocumented)
  protected _privateUse?: string;
  compact(): string;
  // (undocumented)
  protected core: (undefined | string)[];
  expanded(): string;
  extensions(): string[];
  hasLanguage(): boolean;
  hasRegion(): boolean;
  hasScript(): boolean;
  language(): string;
  privateUse(): string;
  region(): string;
  script(): string;
  toString(): string;
  variant(): string;
}

// @alpha
interface Locale {
  readonly id: string;
  readonly tag: LanguageTag;
}

// @alpha
class LocaleMatcher {
  constructor(supportedLocales: string | string[]);
  match(desiredLocales: string | string[], threshold?: number): LanguageMatch;
}

// @alpha
class Pack {
  constructor(data: any);
  // (undocumented)
  readonly cldrVersion: string;
  // (undocumented)
  get(tag: LanguageTag): Bundle;
  // (undocumented)
  readonly language: string;
  // (undocumented)
  readonly scripts: {
    [x: string]: PackScript;
  }
  // (undocumented)
  readonly version: string;
}

// @alpha
class ZonedDateTime {
  constructor(date: number | Date | ZonedDateTime, zoneId?: string);
  // (undocumented)
  fieldOfGreatestDifference(other: ZonedDateTime): DateTimeFieldType;
  getDayOfMonth(): number;
  getDayOfWeek(): number;
  getDayOfYear(): number;
  getHour(): number;
  getISOWeek(): number;
  getISOYear(): number;
  getLocal(): Date;
  getMillisecond(): number;
  getMinute(): number;
  getMonth(): number;
  getSecond(): number;
  getUTCDayOfMonth(): number;
  getUTCDayOfWeek(): number;
  getUTCHour(): number;
  getUTCMinute(): number;
  getUTCMonth(): number;
  getUTCYear(): number;
  getYear(): number;
  isDaylightSavings(): boolean;
  // (undocumented)
  isLeapYear(): boolean;
  // (undocumented)
  isUTCLeapYear(): boolean;
  metaZoneId(): string | undefined;
  timezoneOffset(): number;
  // (undocumented)
  toISOString(): string;
  zoneId(): string;
}

// (No @packagedocumentation comment for this package)
