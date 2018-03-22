// @alpha
class CLDR {
  constructor(options: CLDROptions);
  // (undocumented)
  protected readonly asyncLoader?: (language: string) => Promise<any>;
  protected build(locale: Locale, pack: Pack): CLDRApi;
  get(locale: Locale | string): CLDRApi;
  getAsync(locale: Locale | string): Promise<CLDRApi>;
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
interface CLDRApi {
  readonly Calendars: Calendars;
  readonly General: General;
  readonly Numbers: Numbers;
  readonly Units: Units;
}

// @alpha
class CLDROptions {
  // (undocumented)
  asyncLoader?: (language: string) => Promise<any>;
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
  readonly date?: FormatWidthType | AvailableFormatType;
  // (undocumented)
  readonly datetime?: FormatWidthType;
  // (undocumented)
  readonly time?: FormatWidthType | AvailableFormatType;
  // (undocumented)
  readonly wrap?: FormatWidthType;
}

// @alpha
class Decimal {
  constructor(num: DecimalArg);
  protected _format(formatter: Formatter<any>, decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number, digits: string[]): void;
  protected _increment(): void;
  protected _parse(str: string): string | undefined;
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
  format(decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number, digits?: string[]): string;
  formatParts(decimal: string, group: string, minInt: number, minGroup: number, priGroup: number, secGroup: number, digits?: string[]): Part[];
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
class LocaleMatcher {
  constructor(supportedLocales: string | string[]);
  match(desiredLocales: string | string[], threshold?: number): LanguageMatch;
}

// @alpha (undocumented)
interface MathContext {
  // (undocumented)
  precision?: number;
  // (undocumented)
  rounding?: RoundingModeType;
  // (undocumented)
  scale?: number;
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
  width?: RelativeTimeWidthType;
}

// @alpha (undocumented)
interface UnitFormatOptions extends DecimalFormatOptions {
  // (undocumented)
  length?: UnitNameLength;
}

// @alpha
class ZonedDateTime {
  constructor(date: number | Date | ZonedDateTime, zoneId?: string);
  // (undocumented)
  epochUTC(): number;
  // (undocumented)
  fieldOfGreatestDifference(other: ZonedDateTime): DateTimePatternFieldType;
  getDayOfMonth(): number;
  getDayOfWeek(): number;
  getDayOfYear(): number;
  getHour(): number;
  getISOWeek(): number;
  getISOYear(): number;
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

// WARNING: Unsupported export: parseLocale
// WARNING: Unsupported export: availableLocales
// WARNING: Unsupported export: AvailableFormatType
// WARNING: Unsupported export: CharacterOrderType
// WARNING: Unsupported export: CurrencyType
// WARNING: Unsupported export: CurrencyFormatStyleType
// WARNING: Unsupported export: CurrencySymbolWidthType
// WARNING: Unsupported export: DateFieldType
// WARNING: Unsupported export: DecimalArg
// WARNING: Unsupported export: DecimalConstants
// WARNING: Unsupported export: DecimalFormatStyleType
// WARNING: Unsupported export: FormatWidthType
// WARNING: Unsupported export: RationalArg
// WARNING: Unsupported export: RegionIdType
// WARNING: Unsupported export: ScriptIdType
// WARNING: Unsupported export: UnitNameLength
// WARNING: Unsupported export: UnitType
// (No @packagedocumentation comment for this package)
