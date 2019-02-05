// @alpha
class CalendarDate {
  protected constructor(_type: CalendarType, _firstDay: number, _minDays: number);
  protected _add(fields: CalendarDateFields): [number, number];
  protected _addTime(fields: CalendarDateFields): [number, number];
  // (undocumented)
  protected _fields: number[];
  // (undocumented)
  protected readonly _firstDay: number;
  // (undocumented)
  protected readonly _minDays: number;
  // (undocumented)
  protected _toString(type: string, year?: string): string;
  // (undocumented)
  protected readonly _type: CalendarType;
  // (undocumented)
  protected _zoneInfo: ZoneInfo;
  // (undocumented)
  abstract add(fields: CalendarDateFields): CalendarDate;
  protected computeWeekFields(): void;
  // (undocumented)
  dayOfMonth(): number;
  dayOfWeek(): number;
  dayOfWeekInMonth(): number;
  // (undocumented)
  dayOfYear(): number;
  // (undocumented)
  era(): number;
  // (undocumented)
  extendedYear(): number;
  fieldOfGreatestDifference(other: CalendarDate): DateTimePatternFieldType;
  // (undocumented)
  firstDayOfWeek(): number;
  hour(): number;
  hourOfDay(): number;
  // (undocumented)
  protected initFromJD(jd: number, msDay: number, zoneId?: string): void;
  // (undocumented)
  protected initFromUnixEpoch(ms: number, zoneId?: string): void;
  // (undocumented)
  isAM(): boolean;
  // (undocumented)
  isDaylightSavings(): boolean;
  // (undocumented)
  isLeapYear(): boolean;
  julianDay(): number;
  // (undocumented)
  metaZoneId(): MetaZoneType;
  // (undocumented)
  milliseconds(): number;
  // (undocumented)
  millisecondsInDay(): number;
  // (undocumented)
  minDaysInFirstWeek(): number;
  minute(): number;
  modifiedJulianDay(): number;
  month(): number;
  // (undocumented)
  protected abstract monthStart(eyear: number, month: number, useMonth: boolean): number;
  ordinalDayOfWeek(): number;
  // (undocumented)
  relatedYear(): number;
  second(): number;
  // (undocumented)
  timeZoneId(): string;
  // (undocumented)
  timeZoneOffset(): number;
  type(): CalendarType;
  unixEpoch(): number;
  // (undocumented)
  protected weekNumber(desiredDay: number, dayOfPeriod: number, dayOfWeek: number): number;
  weekOfMonth(): number;
  // (undocumented)
  weekOfYear(): number;
  // (undocumented)
  year(): number;
  // (undocumented)
  protected yearLength(y: number): number;
  // (undocumented)
  yearOfWeekOfYear(): number;
}

// @alpha
interface CalendarDateFields {
  // (undocumented)
  day?: number;
  // (undocumented)
  hour?: number;
  // (undocumented)
  millis?: number;
  // (undocumented)
  minute?: number;
  // (undocumented)
  month?: number;
  // (undocumented)
  second?: number;
  // (undocumented)
  week?: number;
  // (undocumented)
  year?: number;
  // (undocumented)
  zoneId?: string;
}

// @alpha
class CLDR {
  constructor(locale: Locale, bundle: Bundle, internals: Internals);
  readonly Calendars: Calendars;
  readonly General: General;
  readonly Locales: Locales;
  readonly Numbers: Numbers;
  readonly Units: Units;
}

// @alpha
class CLDRFramework {
  constructor(options: CLDROptions);
  // (undocumented)
  protected readonly asyncLoader?: (language: string) => Promise<any>;
  protected build(locale: Locale, pack: Pack): CLDR;
  get(locale: Locale | string): CLDR;
  getAsync(locale: Locale | string): Promise<CLDR>;
  // (undocumented)
  info(): string;
  // (undocumented)
  protected readonly internals: Internals;
  // (undocumented)
  protected readonly loader?: (language: string) => any;
  // (undocumented)
  protected readonly options: CLDROptions;
  // (undocumented)
  protected readonly packCache: LRU<string, Pack>;
}

// @alpha
class CLDROptions {
  // (undocumented)
  asyncLoader?: (language: string) => Promise<any>;
  debug?: boolean;
  loader?: (language: string) => any;
  packCacheSize?: number;
  patternCacheSize?: number;
}

// @alpha (undocumented)
interface CurrencyFormatOptions extends NumberFormatOptions {
  // (undocumented)
  style?: CurrencyFormatStyleType;
  // (undocumented)
  symbolWidth?: CurrencySymbolWidthType;
}

// @alpha (undocumented)
interface DateFormatOptions {
  // (undocumented)
  ca?: CalendarType;
  // (undocumented)
  date?: FormatWidthType;
  // (undocumented)
  datetime?: FormatWidthType;
  // (undocumented)
  nu?: NumberSystemType;
  // (undocumented)
  skeleton?: string;
  // (undocumented)
  time?: FormatWidthType;
  // (undocumented)
  wrap?: FormatWidthType;
}

// @alpha
class Decimal {
  constructor(num: DecimalArg);
  protected _increment(): void;
  protected _parse(str: string): string | undefined;
  // (undocumented)
  protected _setScale(scale: number, roundingMode?: RoundingModeType): void;
  protected _shiftleft(shift: number): void;
  protected _shiftright(shift: number, mode?: RoundingModeType): void;
  // (undocumented)
  protected _stripTrailingZeros(): void;
  abs(): Decimal;
  // (undocumented)
  add(v: DecimalArg): Decimal;
  protected addsub(u: Decimal, v: Decimal, vsign: number): Decimal;
  alignexp(): number;
  protected checkDivision(v: Decimal): boolean;
  compare(v: DecimalArg, abs?: boolean): number;
  // (undocumented)
  protected data: number[];
  decrement(): Decimal;
  divide(v: DecimalArg, context?: MathContext): Decimal;
  divmod(v: DecimalArg): [Decimal, Decimal];
  // (undocumented)
  protected exp: number;
  format<R>(formatter: DecimalFormatter<R>, decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number, digits?: string[]): void;
  // (undocumented)
  protected static fromRaw(sign: number, exp: number, data: number[]): Decimal;
  increment(): Decimal;
  integerDigits(): number;
  isInteger(): boolean;
  isNegative(): boolean;
  protected isodd(): boolean;
  mod(v: DecimalArg): Decimal;
  movePoint(n: number): Decimal;
  multiply(v: DecimalArg, context?: MathContext): Decimal;
  negate(): Decimal;
  operands(): NumberOperands;
  protected parse(arg: string | number): void;
  precision(): number;
  protected round(rnd: number, rest: number, mode: RoundingModeType): number;
  scale(): number;
  setScale(scale: number, roundingMode?: RoundingModeType): Decimal;
  shiftleft(shift: number): Decimal;
  shiftright(shift: number, mode?: RoundingModeType): Decimal;
  // (undocumented)
  protected sign: number;
  // (undocumented)
  signum(): number;
  stripTrailingZeros(): Decimal;
  subtract(v: DecimalArg): Decimal;
  toInteger(): Decimal;
  toParts(): Part[];
  toString(): string;
  trailingZeros(): number;
  protected trim(): Decimal;
}

// @alpha (undocumented)
interface DecimalFormatOptions extends NumberFormatOptions {
  // (undocumented)
  style?: DecimalFormatStyleType;
}

// @alpha
class GregorianDate extends CalendarDate {
  protected constructor(type: CalendarType, firstDay: number, minDays: number);
  // (undocumented)
  add(fields: CalendarDateFields): GregorianDate;
  // (undocumented)
  static fromUnixEpoch(epoch: number, zoneId: string, firstDay?: number, minDays?: number): GregorianDate;
  // (undocumented)
  protected initFromJD(jd: number, msDay: number, zoneId: string): GregorianDate;
  // (undocumented)
  protected initFromUnixEpoch(epoch: number, zoneId: string): GregorianDate;
  // (undocumented)
  protected initGregorian(): GregorianDate;
  // (undocumented)
  protected monthStart(eyear: number, month: number, useMonth: boolean): number;
  // (undocumented)
  toString(): string;
}

// @alpha
class ISO8601Date extends GregorianDate {
  // (undocumented)
  add(fields: CalendarDateFields): ISO8601Date;
  // (undocumented)
  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): ISO8601Date;
  // (undocumented)
  protected initFromUnixEpoch(epoch: number, zoneId: string): ISO8601Date;
  // (undocumented)
  toString(): string;
}

// @alpha
class LanguageResolver {
  static addLikelySubtags(real: string | LanguageTag): LanguageTag;
  static removeLikelySubtags(real: string | LanguageTag): LanguageTag;
  static resolve(real: string | LanguageTag): LanguageTag;
}

// @alpha
class LanguageTag {
  constructor(language?: string, script?: string, region?: string, variant?: string, extensions?: {
          [x: string]: string[];
      }, privateUse?: string);
  // (undocumented)
  protected _compact?: string;
  // (undocumented)
  protected _expanded?: string;
  // (undocumented)
  protected _extensions?: {
    [x: string]: string[];
  }
  // (undocumented)
  protected _privateUse?: string;
  compact(): string;
  // (undocumented)
  protected core: (undefined | string)[];
  expanded(): string;
  extensions: {
    [x: string]: string[];
  }
  extensionSubtags(key: string): string[];
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
  // (undocumented)
  static resolve(id: string): Locale;
}

// @alpha
interface LocaleMatch {
  // (undocumented)
  distance: number;
  // (undocumented)
  locale: Locale;
}

// @alpha
class LocaleMatcher {
  constructor(supportedLocales: string | string[]);
  match(desiredLocales: string | string[], threshold?: number): LocaleMatch;
}

// @alpha
class Locales {
  constructor(_locale: Locale, _bundle: Bundle);
  // (undocumented)
  protected readonly _bundle: Bundle;
  // (undocumented)
  protected readonly _locale: Locale;
  bundle(): Bundle;
  current(): Locale;
  resolve(tag: string): Locale;
}

// @alpha
interface MathContext {
  // (undocumented)
  precision?: number;
  // (undocumented)
  round?: RoundingModeType;
  // (undocumented)
  scale?: number;
}

// @alpha
class Pack {
  constructor(data: any);
  // (undocumented)
  readonly cldrVersion: string;
  // (undocumented)
  readonly defaultTag: LanguageTag;
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
class PersianDate extends CalendarDate {
  // (undocumented)
  add(fields: CalendarDateFields): PersianDate;
  // (undocumented)
  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): PersianDate;
  // (undocumented)
  protected initFromJD(jd: number, msDay: number, zoneId: string): PersianDate;
  // (undocumented)
  protected initFromUnixEpoch(epoch: number, zoneId: string): PersianDate;
  // (undocumented)
  protected monthStart(eyear: number, month: number, useMonth: boolean): number;
  // (undocumented)
  relatedYear(): number;
  // (undocumented)
  toString(): string;
}

// @alpha (undocumented)
interface Quantity {
  // (undocumented)
  unit?: UnitType;
  // (undocumented)
  value: number | string | Decimal;
}

// @alpha
class Rational {
  constructor(numerator: DecimalArg, denominator?: DecimalArg);
  // (undocumented)
  compare(num: RationalArg, context?: MathContext): number;
  // (undocumented)
  protected denom: Decimal;
  // (undocumented)
  denominator(): Decimal;
  // (undocumented)
  divide(num: RationalArg, context?: MathContext): Rational;
  // (undocumented)
  inverse(): Rational;
  // (undocumented)
  multiply(num: RationalArg, context?: MathContext): Rational;
  // (undocumented)
  protected numer: Decimal;
  // (undocumented)
  numerator(): Decimal;
  // (undocumented)
  toDecimal(context?: MathContext): Decimal;
  // (undocumented)
  toString(): string;
}

// @alpha (undocumented)
interface RelativeTimeFormatOptions {
  // (undocumented)
  readonly nu?: NumberSystemType;
  // (undocumented)
  width?: RelativeTimeWidthType;
}

// @alpha (undocumented)
interface UnitFormatOptions extends DecimalFormatOptions {
  // (undocumented)
  length?: UnitLength;
}

// @alpha (undocumented)
interface ZonedDateTime {
  date: number | Date;
  zoneId?: string;
}

// WARNING: Unsupported export: resolveLocale
// WARNING: Unsupported export: availableLocales
// WARNING: Unsupported export: parseLanguageTag
// WARNING: Unsupported export: CharacterOrderType
// WARNING: Unsupported export: CurrencyType
// WARNING: Unsupported export: CurrencyFormatStyleType
// WARNING: Unsupported export: CurrencySymbolWidthType
// WARNING: Unsupported export: DateFieldType
// WARNING: Unsupported export: DecimalArg
// WARNING: Unsupported export: DecimalConstants
// WARNING: Unsupported export: DecimalFormatStyleType
// WARNING: Unsupported export: FormatWidthType
// WARNING: Unsupported export: ListPatternType
// WARNING: Unsupported export: RationalArg
// WARNING: Unsupported export: RegionIdType
// WARNING: Unsupported export: ScriptIdType
// WARNING: Unsupported export: UnitLength
// WARNING: Unsupported export: UnitType
// (No @packagedocumentation comment for this package)
