## API Report File for "@phensley/cldr-types"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// @public (undocumented)
export type AltType = 'none' | 'short' | 'narrow' | 'variant' | 'stand-alone' | 'long' | 'menu';

// @public (undocumented)
export interface BuddhistSchema extends CalendarSchema {
}

// @public (undocumented)
export interface CalendarFields {
    // (undocumented)
    readonly dayPeriods: Vector3Arrow<string, string, DayPeriodAltType>;
    // (undocumented)
    readonly months: Vector2Arrow<string, string>;
    // (undocumented)
    readonly quarters: Vector2Arrow<string, string>;
    // (undocumented)
    readonly weekdays: Vector2Arrow<string, string>;
}

// @public (undocumented)
export interface CalendarSchema {
    // (undocumented)
    readonly availableFormats: Vector1Arrow<string>;
    // (undocumented)
    readonly dateFormats: Vector1Arrow<FormatWidthType>;
    // (undocumented)
    readonly dateTimeFormats: Vector1Arrow<FormatWidthType>;
    // (undocumented)
    readonly eras: Vector3Arrow<EraWidthType, string, EraAltType>;
    // (undocumented)
    readonly format: CalendarFields;
    // (undocumented)
    readonly intervalFormatFallback: FieldArrow;
    // (undocumented)
    readonly intervalFormats: Vector2Arrow<DateTimePatternFieldType, string>;
    // (undocumented)
    readonly pluralFormats: Vector2Arrow<PluralType, string>;
    // (undocumented)
    readonly standAlone: CalendarFields;
    // (undocumented)
    readonly timeFormats: Vector1Arrow<FormatWidthType>;
}

// @public (undocumented)
export type CharacterOrderType = 'ttb' | 'btt';

// @public (undocumented)
export type ContextTransformFieldType = ('calendar-field' | 'currencyName' | 'day-format-except-narrow' | 'day-standalone-except-narrow' | 'era-abbr' | 'era-name' | 'keyValue' | 'languages' | 'month-format-except-narrow' | 'month-standalone-except-narrow' | 'number-spellout' | 'relative' | 'script' | 'typographicNames');

// @public (undocumented)
export interface ContextTransformsSchema {
    // (undocumented)
    readonly contextTransforms: Vector1Arrow<ContextTransformFieldType>;
}

// @public (undocumented)
export type ContextType = 'middle-of-text' | 'begin-sentence' | 'standalone' | 'ui-list-or-menu';

// @public (undocumented)
export interface CurrenciesSchema {
    // (undocumented)
    readonly decimal: Vector1Arrow<CurrencyType>;
    // (undocumented)
    readonly displayName: Vector1Arrow<CurrencyType>;
    // (undocumented)
    readonly pluralName: Vector2Arrow<PluralType, CurrencyType>;
    // (undocumented)
    readonly symbol: Vector2Arrow<AltType, CurrencyType>;
}

// @public (undocumented)
export interface CurrencyFormats {
    // (undocumented)
    readonly accounting: FieldArrow;
    // (undocumented)
    readonly short: DigitsArrow<PluralType>;
    // (undocumented)
    readonly spacing: Vector2Arrow<CurrencySpacingPos, CurrencySpacingPattern>;
    // (undocumented)
    readonly standard: FieldArrow;
    // (undocumented)
    readonly unitPattern: Vector1Arrow<PluralType>;
}

// @public (undocumented)
export type CurrencySpacingPattern = 'currencyMatch' | 'surroundingMatch' | 'insertBetween';

// @public (undocumented)
export type CurrencySpacingPos = 'before' | 'after';

// @public (undocumented)
export type CurrencyType = ('ADP' | 'AED' | 'AFA' | 'AFN' | 'ALK' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'AOK' | 'AON' | 'AOR' | 'ARA' | 'ARL' | 'ARM' | 'ARP' | 'ARS' | 'ATS' | 'AUD' | 'AWG' | 'AZM' | 'AZN' | 'BAD' | 'BAM' | 'BAN' | 'BBD' | 'BDT' | 'BEC' | 'BEF' | 'BEL' | 'BGL' | 'BGM' | 'BGN' | 'BGO' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOL' | 'BOP' | 'BOV' | 'BRB' | 'BRC' | 'BRE' | 'BRL' | 'BRN' | 'BRR' | 'BRZ' | 'BSD' | 'BTN' | 'BUK' | 'BWP' | 'BYB' | 'BYN' | 'BYR' | 'BZD' | 'CAD' | 'CDF' | 'CHE' | 'CHF' | 'CHW' | 'CLE' | 'CLF' | 'CLP' | 'CNH' | 'CNX' | 'CNY' | 'COP' | 'COU' | 'CRC' | 'CSD' | 'CSK' | 'CUC' | 'CUP' | 'CVE' | 'CYP' | 'CZK' | 'DDM' | 'DEM' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'ECS' | 'ECV' | 'EEK' | 'EGP' | 'ERN' | 'ESA' | 'ESB' | 'ESP' | 'ETB' | 'EUR' | 'FIM' | 'FJD' | 'FKP' | 'FRF' | 'GBP' | 'GEK' | 'GEL' | 'GHC' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GNS' | 'GQE' | 'GRD' | 'GTQ' | 'GWE' | 'GWP' | 'GYD' | 'HKD' | 'HNL' | 'HRD' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'IEP' | 'ILP' | 'ILR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISJ' | 'ISK' | 'ITL' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRH' | 'KRO' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LTT' | 'LUC' | 'LUF' | 'LUL' | 'LVL' | 'LVR' | 'LYD' | 'MAD' | 'MAF' | 'MCF' | 'MDC' | 'MDL' | 'MGA' | 'MGF' | 'MKD' | 'MKN' | 'MLF' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MTP' | 'MUR' | 'MVP' | 'MVR' | 'MWK' | 'MXN' | 'MXP' | 'MXV' | 'MYR' | 'MZE' | 'MZM' | 'MZN' | 'NAD' | 'NGN' | 'NIC' | 'NIO' | 'NLG' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEI' | 'PEN' | 'PES' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PLZ' | 'PTE' | 'PYG' | 'QAR' | 'RHD' | 'ROL' | 'RON' | 'RSD' | 'RUB' | 'RUR' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDD' | 'SDG' | 'SDP' | 'SEK' | 'SGD' | 'SHP' | 'SIT' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SRG' | 'SSP' | 'STD' | 'STN' | 'SUR' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJR' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TPE' | 'TRL' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UAK' | 'UGS' | 'UGX' | 'USD' | 'USN' | 'USS' | 'UYI' | 'UYP' | 'UYU' | 'UYW' | 'UZS' | 'VEB' | 'VEF' | 'VES' | 'VND' | 'VNN' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XEU' | 'XFO' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XRE' | 'XSU' | 'XTS' | 'XUA' | 'XXX' | 'YDD' | 'YER' | 'YUD' | 'YUM' | 'YUN' | 'YUR' | 'ZAL' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZRN' | 'ZRZ' | 'ZWD' | 'ZWL' | 'ZWR');

// @public (undocumented)
export const enum DateField {
    // (undocumented)
    DAY = "day",
    // (undocumented)
    DAY_OF_YEAR = "dayOfYear",
    // (undocumented)
    DAY_PERIOD = "dayperiod",
    // (undocumented)
    ERA = "era",
    // (undocumented)
    FRI = "fri",
    // (undocumented)
    HOUR = "hour",
    // (undocumented)
    MINUTE = "minute",
    // (undocumented)
    MON = "mon",
    // (undocumented)
    MONTH = "month",
    // (undocumented)
    QUARTER = "quarter",
    // (undocumented)
    SAT = "sat",
    // (undocumented)
    SECOND = "second",
    // (undocumented)
    SUN = "sun",
    // (undocumented)
    THU = "thu",
    // (undocumented)
    TUE = "tue",
    // (undocumented)
    WED = "wed",
    // (undocumented)
    WEEK = "week",
    // (undocumented)
    WEEK_OF_MONTH = "weekOfMonth",
    // (undocumented)
    WEEKDAY = "weekday",
    // (undocumented)
    WEEKDAY_OF_MONTH = "weekdayOfMonth",
    // (undocumented)
    YEAR = "year",
    // (undocumented)
    ZONE = "zone"
}

// @public (undocumented)
export interface DateFieldsSchema {
    // (undocumented)
    readonly displayName: Vector2Arrow<DateFieldType, DateFieldWidthType>;
    // (undocumented)
    readonly relativeTimes: RelativeTimes;
}

// @public
export type DateFieldSymbol = 'G' | 'y' | 'Y' | 'u' | 'U' | 'r' | 'Q' | 'q' | 'M' | 'L' | 'l' | 'w' | 'W' | 'd' | 'D' | 'F' | 'g' | 'E' | 'e' | 'c' | 'a' | 'b' | 'B' | 'h' | 'H' | 'K' | 'k' | 'j' | 'J' | 'C' | 'm' | 's' | 'S' | 'A' | 'z' | 'Z' | 'O' | 'v' | 'V' | 'X' | 'x';

// @public (undocumented)
export type DateFieldType = 'era' | 'year' | 'quarter' | 'month' | 'week' | 'weekday' | 'weekdayOfMonth' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'day' | 'dayperiod' | 'hour' | 'minute' | 'second' | 'zone';

// @public (undocumented)
export const enum DateFieldWidth {
    // (undocumented)
    NARROW = "narrow",
    // (undocumented)
    SHORT = "short",
    // (undocumented)
    WIDE = "wide"
}

// @public (undocumented)
export type DateFieldWidthType = 'short' | 'narrow' | 'wide';

// @public (undocumented)
export const enum DateTimePatternField {
    // (undocumented)
    DAY = "d",
    // (undocumented)
    DAYPERIOD = "a",
    // (undocumented)
    HOUR = "H",
    // (undocumented)
    MINUTE = "m",
    // (undocumented)
    MONTH = "M",
    // (undocumented)
    SECOND = "s",
    // (undocumented)
    YEAR = "y"
}

// @public
export type DateTimePatternFieldType = 'y' | 'M' | 'd' | 'a' | 'H' | 'm' | 's';

// @public (undocumented)
export const enum DayPeriod {
    // (undocumented)
    AFTERNOON1 = "afternoon1",
    // (undocumented)
    AFTERNOON2 = "afternoon2",
    // (undocumented)
    AM = "am",
    // (undocumented)
    EVENING1 = "evening1",
    // (undocumented)
    EVENING2 = "evening2",
    // (undocumented)
    MIDNIGHT = "midnight",
    // (undocumented)
    MORNING1 = "morning1",
    // (undocumented)
    MORNING2 = "morning2",
    // (undocumented)
    NIGHT1 = "night1",
    // (undocumented)
    NIGHT2 = "night2",
    // (undocumented)
    NOON = "noon",
    // (undocumented)
    PM = "pm"
}

// @public (undocumented)
export type DayPeriodAltType = 'none' | 'casing';

// @public (undocumented)
export type DayPeriodType = 'noon' | 'midnight' | 'am' | 'pm' | 'morning1' | 'morning2' | 'afternoon1' | 'afternoon2' | 'evening1' | 'evening2' | 'night1' | 'night2';

// @public (undocumented)
export interface DecimalFormats {
    // (undocumented)
    readonly long: DigitsArrow<PluralType>;
    // (undocumented)
    readonly short: DigitsArrow<PluralType>;
    // (undocumented)
    readonly standard: FieldArrow;
}

// @public
export interface DigitsArrow<T extends string> {
    get(bundle: PrimitiveBundle, key: T, digits: number): [string, number];
    // (undocumented)
    readonly index: KeyIndex<T>;
    // (undocumented)
    readonly offset: number;
    // (undocumented)
    readonly size2: number;
    // (undocumented)
    readonly values: number[];
}

// @public (undocumented)
export type EraAltType = 'none' | 'sensitive';

// @public (undocumented)
export const enum EraWidth {
    // (undocumented)
    ABBR = "abbr",
    // (undocumented)
    NAMES = "names",
    // (undocumented)
    NARROW = "narrow"
}

// @public (undocumented)
export type EraWidthType = 'names' | 'abbr' | 'narrow';

// Warning: (ae-internal-missing-underscore) The name "Extension" should be prefixed with an underscore because the declaration is marked as @internal
//
// @internal
export interface Extension {
}

// @public
export interface FieldArrow {
    // (undocumented)
    get(bundle: PrimitiveBundle): string;
    // (undocumented)
    readonly offset: number;
}

// @public (undocumented)
export const enum FieldWidth {
    // (undocumented)
    ABBREVIATED = "abbreviated",
    // (undocumented)
    NARROW = "narrow",
    // (undocumented)
    SHORT = "short",
    // (undocumented)
    WIDE = "wide"
}

// @public (undocumented)
export type FieldWidthType = 'abbreviated' | 'narrow' | 'short' | 'wide';

// @public (undocumented)
export const enum FormatWidth {
    // (undocumented)
    FULL = "full",
    // (undocumented)
    LONG = "long",
    // (undocumented)
    MEDIUM = "medium",
    // (undocumented)
    SHORT = "short"
}

// @public (undocumented)
export type FormatWidthType = 'short' | 'medium' | 'long' | 'full';

// @public (undocumented)
export interface GregorianSchema extends CalendarSchema {
}

// @public (undocumented)
export interface JapaneseSchema extends CalendarSchema {
}

// @public
export interface KeyIndex<T extends string> {
    // (undocumented)
    get(key: T): number;
    // (undocumented)
    readonly index: {
        [P in T]: number;
    };
    // (undocumented)
    readonly keys: T[];
    // (undocumented)
    readonly last: number;
    // (undocumented)
    readonly size: number;
}

// @public
export interface KeyIndexMap {
    // (undocumented)
    [name: string]: KeyIndex<string>;
}

// @public (undocumented)
export type LanguageIdType = ('aa' | 'ab' | 'ace' | 'ach' | 'ada' | 'ady' | 'ae' | 'aeb' | 'af' | 'afh' | 'agq' | 'ain' | 'ak' | 'akk' | 'akz' | 'ale' | 'aln' | 'alt' | 'am' | 'an' | 'ang' | 'anp' | 'ar' | 'ar-001' | 'arc' | 'arn' | 'aro' | 'arp' | 'arq' | 'ars' | 'arw' | 'ary' | 'arz' | 'as' | 'asa' | 'ase' | 'ast' | 'av' | 'avk' | 'awa' | 'ay' | 'az' | 'az-Arab' | 'ba' | 'bal' | 'ban' | 'bar' | 'bas' | 'bax' | 'bbc' | 'bbj' | 'be' | 'bej' | 'bem' | 'bew' | 'bez' | 'bfd' | 'bfq' | 'bg' | 'bgn' | 'bho' | 'bi' | 'bik' | 'bin' | 'bjn' | 'bkm' | 'bla' | 'bm' | 'bn' | 'bo' | 'bpy' | 'bqi' | 'br' | 'bra' | 'brh' | 'brx' | 'bs' | 'bss' | 'bua' | 'bug' | 'bum' | 'byn' | 'byv' | 'ca' | 'cad' | 'car' | 'cay' | 'cch' | 'ccp' | 'ce' | 'ceb' | 'cgg' | 'ch' | 'chb' | 'chg' | 'chk' | 'chm' | 'chn' | 'cho' | 'chp' | 'chr' | 'chy' | 'cic' | 'ckb' | 'co' | 'cop' | 'cps' | 'cr' | 'crh' | 'crs' | 'cs' | 'csb' | 'cu' | 'cv' | 'cy' | 'da' | 'dak' | 'dar' | 'dav' | 'de' | 'de-AT' | 'de-CH' | 'del' | 'den' | 'dgr' | 'din' | 'dje' | 'doi' | 'dsb' | 'dtp' | 'dua' | 'dum' | 'dv' | 'dyo' | 'dyu' | 'dz' | 'dzg' | 'ebu' | 'ee' | 'efi' | 'egl' | 'egy' | 'eka' | 'el' | 'elx' | 'en' | 'en-AU' | 'en-CA' | 'en-GB' | 'en-US' | 'enm' | 'eo' | 'es' | 'es-419' | 'es-ES' | 'es-MX' | 'esu' | 'et' | 'eu' | 'ewo' | 'ext' | 'fa' | 'fa-AF' | 'fan' | 'fat' | 'ff' | 'fi' | 'fil' | 'fit' | 'fj' | 'fo' | 'fon' | 'fr' | 'fr-CA' | 'fr-CH' | 'frc' | 'frm' | 'fro' | 'frp' | 'frr' | 'frs' | 'fur' | 'fy' | 'ga' | 'gaa' | 'gag' | 'gan' | 'gay' | 'gba' | 'gbz' | 'gd' | 'gez' | 'gil' | 'gl' | 'glk' | 'gmh' | 'gn' | 'goh' | 'gom' | 'gon' | 'gor' | 'got' | 'grb' | 'grc' | 'gsw' | 'gu' | 'guc' | 'gur' | 'guz' | 'gv' | 'gwi' | 'ha' | 'hai' | 'hak' | 'haw' | 'he' | 'hi' | 'hif' | 'hil' | 'hit' | 'hmn' | 'ho' | 'hr' | 'hsb' | 'hsn' | 'ht' | 'hu' | 'hup' | 'hy' | 'hz' | 'ia' | 'iba' | 'ibb' | 'id' | 'ie' | 'ig' | 'ii' | 'ik' | 'ilo' | 'inh' | 'io' | 'is' | 'it' | 'iu' | 'izh' | 'ja' | 'jam' | 'jbo' | 'jgo' | 'jmc' | 'jpr' | 'jrb' | 'jut' | 'jv' | 'ka' | 'kaa' | 'kab' | 'kac' | 'kaj' | 'kam' | 'kaw' | 'kbd' | 'kbl' | 'kcg' | 'kde' | 'kea' | 'ken' | 'kfo' | 'kg' | 'kgp' | 'kha' | 'kho' | 'khq' | 'khw' | 'ki' | 'kiu' | 'kj' | 'kk' | 'kkj' | 'kl' | 'kln' | 'km' | 'kmb' | 'kn' | 'ko' | 'koi' | 'kok' | 'kos' | 'kpe' | 'kr' | 'krc' | 'kri' | 'krj' | 'krl' | 'kru' | 'ks' | 'ksb' | 'ksf' | 'ksh' | 'ku' | 'kum' | 'kut' | 'kv' | 'kw' | 'ky' | 'la' | 'lad' | 'lag' | 'lah' | 'lam' | 'lb' | 'lez' | 'lfn' | 'lg' | 'li' | 'lij' | 'liv' | 'lkt' | 'lmo' | 'ln' | 'lo' | 'lol' | 'lou' | 'loz' | 'lrc' | 'lt' | 'ltg' | 'lu' | 'lua' | 'lui' | 'lun' | 'luo' | 'lus' | 'luy' | 'lv' | 'lzh' | 'lzz' | 'mad' | 'maf' | 'mag' | 'mai' | 'mak' | 'man' | 'mas' | 'mde' | 'mdf' | 'mdr' | 'men' | 'mer' | 'mfe' | 'mg' | 'mga' | 'mgh' | 'mgo' | 'mh' | 'mi' | 'mic' | 'min' | 'mk' | 'ml' | 'mn' | 'mnc' | 'mni' | 'moh' | 'mos' | 'mr' | 'mrj' | 'ms' | 'mt' | 'mua' | 'mul' | 'mus' | 'mwl' | 'mwr' | 'mwv' | 'my' | 'mye' | 'myv' | 'mzn' | 'na' | 'nan' | 'nap' | 'naq' | 'nb' | 'nd' | 'nds' | 'nds-NL' | 'ne' | 'new' | 'ng' | 'nia' | 'niu' | 'njo' | 'nl' | 'nl-BE' | 'nmg' | 'nn' | 'nnh' | 'no' | 'nog' | 'non' | 'nov' | 'nqo' | 'nr' | 'nso' | 'nus' | 'nv' | 'nwc' | 'ny' | 'nym' | 'nyn' | 'nyo' | 'nzi' | 'oc' | 'oj' | 'om' | 'or' | 'os' | 'osa' | 'ota' | 'pa' | 'pag' | 'pal' | 'pam' | 'pap' | 'pau' | 'pcd' | 'pcm' | 'pdc' | 'pdt' | 'peo' | 'pfl' | 'phn' | 'pi' | 'pl' | 'pms' | 'pnt' | 'pon' | 'prg' | 'pro' | 'ps' | 'pt' | 'pt-BR' | 'pt-PT' | 'qu' | 'quc' | 'qug' | 'raj' | 'rap' | 'rar' | 'rgn' | 'rif' | 'rm' | 'rn' | 'ro' | 'ro-MD' | 'rof' | 'rom' | 'root' | 'rtm' | 'ru' | 'rue' | 'rug' | 'rup' | 'rw' | 'rwk' | 'sa' | 'sad' | 'sah' | 'sam' | 'saq' | 'sas' | 'sat' | 'saz' | 'sba' | 'sbp' | 'sc' | 'scn' | 'sco' | 'sd' | 'sdc' | 'sdh' | 'se' | 'see' | 'seh' | 'sei' | 'sel' | 'ses' | 'sg' | 'sga' | 'sgs' | 'sh' | 'shi' | 'shn' | 'shu' | 'si' | 'sid' | 'sk' | 'sl' | 'sli' | 'sly' | 'sm' | 'sma' | 'smj' | 'smn' | 'sms' | 'sn' | 'snk' | 'so' | 'sog' | 'sq' | 'sr' | 'sr-ME' | 'srn' | 'srr' | 'ss' | 'ssy' | 'st' | 'stq' | 'su' | 'suk' | 'sus' | 'sux' | 'sv' | 'sw' | 'sw-CD' | 'swb' | 'syc' | 'syr' | 'szl' | 'ta' | 'tcy' | 'te' | 'tem' | 'teo' | 'ter' | 'tet' | 'tg' | 'th' | 'ti' | 'tig' | 'tiv' | 'tk' | 'tkl' | 'tkr' | 'tl' | 'tlh' | 'tli' | 'tly' | 'tmh' | 'tn' | 'to' | 'tog' | 'tpi' | 'tr' | 'tru' | 'trv' | 'ts' | 'tsd' | 'tsi' | 'tt' | 'ttt' | 'tum' | 'tvl' | 'tw' | 'twq' | 'ty' | 'tyv' | 'tzm' | 'udm' | 'ug' | 'uga' | 'uk' | 'umb' | 'und' | 'ur' | 'uz' | 'vai' | 've' | 'vec' | 'vep' | 'vi' | 'vls' | 'vmf' | 'vo' | 'vot' | 'vro' | 'vun' | 'wa' | 'wae' | 'wal' | 'war' | 'was' | 'wbp' | 'wo' | 'wuu' | 'xal' | 'xh' | 'xmf' | 'xog' | 'yao' | 'yap' | 'yav' | 'ybb' | 'yi' | 'yo' | 'yrl' | 'yue' | 'za' | 'zap' | 'zbl' | 'zea' | 'zen' | 'zgh' | 'zh' | 'zh-Hans' | 'zh-Hant' | 'zu' | 'zun' | 'zxx' | 'zza');

// @public (undocumented)
export interface LanguageNameInfo {
    // (undocumented)
    readonly displayName: Vector2Arrow<AltType, LanguageIdType>;
}

// @public (undocumented)
export interface LayoutSchema {
    // (undocumented)
    readonly characterOrder: FieldArrow;
    // (undocumented)
    readonly lineOrder: FieldArrow;
}

// @public (undocumented)
export type LineOrderType = 'ltr' | 'rtl';

// @public (undocumented)
export type ListPatternPositionType = 'start' | 'middle' | 'end' | 'two';

// @public (undocumented)
export interface ListPatternsSchema {
    // (undocumented)
    readonly and: Vector1Arrow<ListPatternPositionType>;
    // (undocumented)
    readonly andShort: Vector1Arrow<ListPatternPositionType>;
    // (undocumented)
    readonly or: Vector1Arrow<ListPatternPositionType>;
    // (undocumented)
    readonly unitLong: Vector1Arrow<ListPatternPositionType>;
    // (undocumented)
    readonly unitNarrow: Vector1Arrow<ListPatternPositionType>;
    // (undocumented)
    readonly unitShort: Vector1Arrow<ListPatternPositionType>;
}

// @public (undocumented)
export interface MetaZoneInfo {
    // (undocumented)
    readonly long: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
    // (undocumented)
    readonly short: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
}

// @public (undocumented)
export type MetaZoneType = 'Acre' | 'Afghanistan' | 'Africa_Central' | 'Africa_Eastern' | 'Africa_Southern' | 'Africa_Western' | 'Alaska' | 'Almaty' | 'Amazon' | 'America_Central' | 'America_Eastern' | 'America_Mountain' | 'America_Pacific' | 'Anadyr' | 'Apia' | 'Aqtau' | 'Aqtobe' | 'Arabian' | 'Argentina' | 'Argentina_Western' | 'Armenia' | 'Atlantic' | 'Australia_Central' | 'Australia_CentralWestern' | 'Australia_Eastern' | 'Australia_Western' | 'Azerbaijan' | 'Azores' | 'Bangladesh' | 'Bhutan' | 'Bolivia' | 'Brasilia' | 'Brunei' | 'Cape_Verde' | 'Casey' | 'Chamorro' | 'Chatham' | 'Chile' | 'China' | 'Choibalsan' | 'Christmas' | 'Cocos' | 'Colombia' | 'Cook' | 'Cuba' | 'Davis' | 'DumontDUrville' | 'East_Timor' | 'Easter' | 'Ecuador' | 'Europe_Central' | 'Europe_Eastern' | 'Europe_Further_Eastern' | 'Europe_Western' | 'Falkland' | 'Fiji' | 'French_Guiana' | 'French_Southern' | 'GMT' | 'Galapagos' | 'Gambier' | 'Georgia' | 'Gilbert_Islands' | 'Greenland_Eastern' | 'Greenland_Western' | 'Guam' | 'Gulf' | 'Guyana' | 'Hawaii_Aleutian' | 'Hong_Kong' | 'Hovd' | 'India' | 'Indian_Ocean' | 'Indochina' | 'Indonesia_Central' | 'Indonesia_Eastern' | 'Indonesia_Western' | 'Iran' | 'Irkutsk' | 'Israel' | 'Japan' | 'Kamchatka' | 'Kazakhstan_Eastern' | 'Kazakhstan_Western' | 'Korea' | 'Kosrae' | 'Krasnoyarsk' | 'Kyrgystan' | 'Lanka' | 'Line_Islands' | 'Lord_Howe' | 'Macau' | 'Macquarie' | 'Magadan' | 'Malaysia' | 'Maldives' | 'Marquesas' | 'Marshall_Islands' | 'Mauritius' | 'Mawson' | 'Mexico_Northwest' | 'Mexico_Pacific' | 'Mongolia' | 'Moscow' | 'Myanmar' | 'Nauru' | 'Nepal' | 'New_Caledonia' | 'New_Zealand' | 'Newfoundland' | 'Niue' | 'Norfolk' | 'Noronha' | 'North_Mariana' | 'Novosibirsk' | 'Omsk' | 'Pakistan' | 'Palau' | 'Papua_New_Guinea' | 'Paraguay' | 'Peru' | 'Philippines' | 'Phoenix_Islands' | 'Pierre_Miquelon' | 'Pitcairn' | 'Ponape' | 'Pyongyang' | 'Qyzylorda' | 'Reunion' | 'Rothera' | 'Sakhalin' | 'Samara' | 'Samoa' | 'Seychelles' | 'Singapore' | 'Solomon' | 'South_Georgia' | 'Suriname' | 'Syowa' | 'Tahiti' | 'Taipei' | 'Tajikistan' | 'Tokelau' | 'Tonga' | 'Truk' | 'Turkmenistan' | 'Tuvalu' | 'Uruguay' | 'Uzbekistan' | 'Vanuatu' | 'Venezuela' | 'Vladivostok' | 'Volgograd' | 'Vostok' | 'Wake' | 'Wallis' | 'Yakutsk' | 'Yekaterinburg';

// @public (undocumented)
export interface NamesSchema {
    // (undocumented)
    readonly languages: LanguageNameInfo;
    // (undocumented)
    readonly regions: RegionNameInfo;
    // (undocumented)
    readonly scripts: ScriptNameInfo;
}

// @public (undocumented)
export type NumberMiscPatternType = 'at-least' | 'at-most' | 'approx' | 'range';

// @public (undocumented)
export interface NumbersSchema {
    // (undocumented)
    readonly minimumGroupingDigits: FieldArrow;
    // (undocumented)
    readonly numberSystem: ScopeArrow<NumberSystemName, NumberSystemInfo>;
    // (undocumented)
    readonly numberSystems: Vector1Arrow<NumberSystemCategory>;
}

// @public (undocumented)
export type NumberSymbolType = 'currencyDecimal' | 'currencyGroup' | 'decimal' | 'exponential' | 'group' | 'infinity' | 'list' | 'minusSign' | 'nan' | 'perMille' | 'percentSign' | 'plusSign' | 'superscriptingExponent' | 'timeSeparator';

// @public (undocumented)
export type NumberSystemCategory = 'default' | 'native' | 'finance' | 'traditional';

// @public (undocumented)
export interface NumberSystemInfo {
    // (undocumented)
    readonly currencyFormats: CurrencyFormats;
    // (undocumented)
    readonly decimalFormats: DecimalFormats;
    // (undocumented)
    readonly miscPatterns: Vector1Arrow<NumberMiscPatternType>;
    // (undocumented)
    readonly percentFormat: FieldArrow;
    // (undocumented)
    readonly scientificFormat: FieldArrow;
    // (undocumented)
    readonly symbols: Vector1Arrow<NumberSymbolType>;
}

// @public
export type NumberSystemName = 'adlm' | 'ahom' | 'arab' | 'arabext' | 'bali' | 'beng' | 'bhks' | 'brah' | 'cakm' | 'cham' | 'deva' | 'fullwide' | 'gonm' | 'gujr' | 'guru' | 'hanidec' | 'hmng' | 'java' | 'kali' | 'khmr' | 'knda' | 'lana' | 'lanatham' | 'laoo' | 'latn' | 'lepc' | 'limb' | 'mathbold' | 'mathdbl' | 'mathmono' | 'mathsanb' | 'mathsans' | 'mlym' | 'modi' | 'mong' | 'mroo' | 'mtei' | 'mymr' | 'mymrshan' | 'mymrtlng' | 'newa' | 'nkoo' | 'olck' | 'orya' | 'osma' | 'saur' | 'shrd' | 'sind' | 'sinh' | 'sora' | 'sund' | 'takr' | 'talu' | 'tamldec' | 'telu' | 'thai' | 'tibt' | 'tirh' | 'vaii' | 'wara';

// @public (undocumented)
export interface PersianSchema extends CalendarSchema {
}

// @public (undocumented)
export type PluralType = 'other' | 'zero' | 'one' | 'two' | 'few' | 'many';

// @public
export interface PrimitiveBundle {
    // (undocumented)
    get(offset: number): string;
    // (undocumented)
    id(): string;
    // (undocumented)
    language(): string;
    // (undocumented)
    region(): string;
}

// @public (undocumented)
export const enum Quarter {
    // (undocumented)
    FIRST = "1",
    // (undocumented)
    FOURTH = "4",
    // (undocumented)
    SECOND = "2",
    // (undocumented)
    THIRD = "3"
}

// @public (undocumented)
export type QuarterType = '1' | '2' | '3' | '4';

// @public (undocumented)
export type RegionIdType = ('001' | '002' | '003' | '005' | '009' | '011' | '013' | '014' | '015' | '017' | '018' | '019' | '021' | '029' | '030' | '034' | '035' | '039' | '053' | '054' | '057' | '061' | '142' | '143' | '145' | '150' | '151' | '154' | '155' | '202' | '419' | 'AC' | 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CP' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DG' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EA' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'EU' | 'EZ' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'IC' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'QO' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TA' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'UN' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'XA' | 'XB' | 'XK' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW' | 'ZZ');

// @public (undocumented)
export interface RegionNameInfo {
    // (undocumented)
    readonly displayName: Vector2Arrow<AltType, RegionIdType>;
}

// @public (undocumented)
export const enum RelativeTimeField {
    // (undocumented)
    DAY = "day",
    // (undocumented)
    FRI = "fri",
    // (undocumented)
    HOUR = "hour",
    // (undocumented)
    MINUTE = "minute",
    // (undocumented)
    MON = "mon",
    // (undocumented)
    MONTH = "month",
    // (undocumented)
    QUARTER = "quarter",
    // (undocumented)
    SAT = "sat",
    // (undocumented)
    SECOND = "second",
    // (undocumented)
    SUN = "sun",
    // (undocumented)
    THU = "thu",
    // (undocumented)
    TUE = "tue",
    // (undocumented)
    WED = "wed",
    // (undocumented)
    WEEK = "week",
    // (undocumented)
    YEAR = "year"
}

// @public (undocumented)
export interface RelativeTimeFields {
    // (undocumented)
    readonly current: Vector1Arrow<RelativeTimeFieldType>;
    // (undocumented)
    readonly future: Vector2Arrow<PluralType, RelativeTimeFieldType>;
    // (undocumented)
    readonly next: Vector1Arrow<RelativeTimeFieldType>;
    // (undocumented)
    readonly next2: Vector1Arrow<RelativeTimeFieldType>;
    // (undocumented)
    readonly past: Vector2Arrow<PluralType, RelativeTimeFieldType>;
    // (undocumented)
    readonly previous: Vector1Arrow<RelativeTimeFieldType>;
    // (undocumented)
    readonly previous2: Vector1Arrow<RelativeTimeFieldType>;
}

// @public (undocumented)
export type RelativeTimeFieldType = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'hour' | 'minute' | 'second';

// @public (undocumented)
export interface RelativeTimes {
    // (undocumented)
    readonly narrow: RelativeTimeFields;
    // (undocumented)
    readonly short: RelativeTimeFields;
    // (undocumented)
    readonly wide: RelativeTimeFields;
}

// @public (undocumented)
export interface Schema {
    // (undocumented)
    readonly Buddhist: BuddhistSchema;
    // (undocumented)
    readonly ContextTransforms: ContextTransformsSchema;
    // (undocumented)
    readonly Currencies: CurrenciesSchema;
    // (undocumented)
    readonly DateFields: DateFieldsSchema;
    // (undocumented)
    readonly Gregorian: GregorianSchema;
    // (undocumented)
    readonly Japanese: JapaneseSchema;
    // (undocumented)
    readonly Layout: LayoutSchema;
    // (undocumented)
    readonly ListPatterns: ListPatternsSchema;
    // (undocumented)
    readonly Names: NamesSchema;
    // (undocumented)
    readonly Numbers: NumbersSchema;
    // (undocumented)
    readonly Persian: PersianSchema;
    // (undocumented)
    readonly TimeZones: TimeZoneSchema;
    // (undocumented)
    readonly Units: UnitsSchema;
}

// @public
export interface ScopeArrow<T extends string, R> {
    // (undocumented)
    get(key: T): R | undefined;
    // (undocumented)
    readonly map: {
        [P in T]: R;
    };
}

// @public (undocumented)
export type ScriptIdType = ('Adlm' | 'Afak' | 'Aghb' | 'Ahom' | 'Arab' | 'Aran' | 'Armi' | 'Armn' | 'Avst' | 'Bali' | 'Bamu' | 'Bass' | 'Batk' | 'Beng' | 'Bhks' | 'Blis' | 'Bopo' | 'Brah' | 'Brai' | 'Bugi' | 'Buhd' | 'Cakm' | 'Cans' | 'Cari' | 'Cham' | 'Cher' | 'Chrs' | 'Cirt' | 'Copt' | 'Cprt' | 'Cyrl' | 'Cyrs' | 'Deva' | 'Diak' | 'Dogr' | 'Dsrt' | 'Dupl' | 'Egyd' | 'Egyh' | 'Egyp' | 'Elba' | 'Elym' | 'Ethi' | 'Geok' | 'Geor' | 'Glag' | 'Gong' | 'Gonm' | 'Goth' | 'Gran' | 'Grek' | 'Gujr' | 'Guru' | 'Hanb' | 'Hang' | 'Hani' | 'Hano' | 'Hans' | 'Hant' | 'Hatr' | 'Hebr' | 'Hira' | 'Hluw' | 'Hmng' | 'Hmnp' | 'Hrkt' | 'Hung' | 'Inds' | 'Ital' | 'Jamo' | 'Java' | 'Jpan' | 'Jurc' | 'Kali' | 'Kana' | 'Khar' | 'Khmr' | 'Khoj' | 'Kits' | 'Knda' | 'Kore' | 'Kpel' | 'Kthi' | 'Lana' | 'Laoo' | 'Latf' | 'Latg' | 'Latn' | 'Lepc' | 'Limb' | 'Lina' | 'Linb' | 'Lisu' | 'Loma' | 'Lyci' | 'Lydi' | 'Mahj' | 'Maka' | 'Mand' | 'Mani' | 'Marc' | 'Maya' | 'Medf' | 'Mend' | 'Merc' | 'Mero' | 'Mlym' | 'Modi' | 'Mong' | 'Moon' | 'Mroo' | 'Mtei' | 'Mult' | 'Mymr' | 'Nand' | 'Narb' | 'Nbat' | 'Newa' | 'Nkgb' | 'Nkoo' | 'Nshu' | 'Ogam' | 'Olck' | 'Orkh' | 'Orya' | 'Osge' | 'Osma' | 'Palm' | 'Pauc' | 'Perm' | 'Phag' | 'Phli' | 'Phlp' | 'Phlv' | 'Phnx' | 'Plrd' | 'Prti' | 'Qaag' | 'Rjng' | 'Rohg' | 'Roro' | 'Runr' | 'Samr' | 'Sara' | 'Sarb' | 'Saur' | 'Sgnw' | 'Shaw' | 'Shrd' | 'Sidd' | 'Sind' | 'Sinh' | 'Sogd' | 'Sogo' | 'Sora' | 'Soyo' | 'Sund' | 'Sylo' | 'Syrc' | 'Syre' | 'Syrj' | 'Syrn' | 'Tagb' | 'Takr' | 'Tale' | 'Talu' | 'Taml' | 'Tang' | 'Tavt' | 'Telu' | 'Teng' | 'Tfng' | 'Tglg' | 'Thaa' | 'Thai' | 'Tibt' | 'Tirh' | 'Ugar' | 'Vaii' | 'Visp' | 'Wara' | 'Wcho' | 'Wole' | 'Xpeo' | 'Xsux' | 'Yezi' | 'Yiii' | 'Zanb' | 'Zinh' | 'Zmth' | 'Zsye' | 'Zsym' | 'Zxxx' | 'Zyyy' | 'Zzzz');

// @public (undocumented)
export interface ScriptNameInfo {
    // (undocumented)
    readonly displayName: Vector2Arrow<AltType, ScriptIdType>;
}

// @public (undocumented)
export type TimeZoneNameType = 'daylight' | 'generic' | 'standard';

// @public (undocumented)
export interface TimeZoneSchema {
    // (undocumented)
    readonly exemplarCity: Vector1Arrow<string>;
    // (undocumented)
    readonly gmtFormat: FieldArrow;
    // (undocumented)
    readonly gmtZeroFormat: FieldArrow;
    // (undocumented)
    readonly hourFormat: FieldArrow;
    // (undocumented)
    readonly metaZones: MetaZoneInfo;
    // (undocumented)
    readonly regionFormat: FieldArrow;
}

// @public (undocumented)
export type UnitCategory = 'acceleration' | 'angle' | 'area' | 'concentr' | 'consumption' | 'digital' | 'duration' | 'electric' | 'energy' | 'force' | 'frequency' | 'graphics' | 'length' | 'light' | 'mass' | 'power' | 'pressure' | 'speed' | 'temperature' | 'torque' | 'volume';

// @public (undocumented)
export interface UnitInfo {
    // (undocumented)
    readonly displayName: Vector1Arrow<UnitType>;
    // (undocumented)
    readonly perPattern: FieldArrow;
    // (undocumented)
    readonly perUnitPattern: Vector1Arrow<UnitType>;
    // (undocumented)
    readonly timesPattern: FieldArrow;
    // (undocumented)
    readonly unitPattern: Vector2Arrow<PluralType, UnitType>;
}

// @public (undocumented)
export interface UnitsSchema {
    // (undocumented)
    readonly long: UnitInfo;
    // (undocumented)
    readonly narrow: UnitInfo;
    // (undocumented)
    readonly short: UnitInfo;
}

// @public (undocumented)
export type UnitType = 'g-force' | 'meter-per-square-second' | 'arc-minute' | 'arc-second' | 'degree' | 'radian' | 'revolution' | 'acre' | 'dunam' | 'hectare' | 'square-centimeter' | 'square-foot' | 'square-inch' | 'square-kilometer' | 'square-meter' | 'square-mile' | 'square-yard' | 'karat' | 'milligram-per-deciliter' | 'millimole-per-liter' | 'mole' | 'percent' | 'permille' | 'permillion' | 'permyriad' | 'liter-per-100-kilometer' | 'liter-per-kilometer' | 'mile-per-gallon' | 'mile-per-gallon-imperial' | 'bit' | 'byte' | 'gigabit' | 'gigabyte' | 'kilobit' | 'kilobyte' | 'megabit' | 'megabyte' | 'petabyte' | 'terabit' | 'terabyte' | 'century' | 'day' | 'decade' | 'hour' | 'microsecond' | 'millisecond' | 'minute' | 'month' | 'nanosecond' | 'second' | 'week' | 'year' | 'ampere' | 'milliampere' | 'ohm' | 'volt' | 'british-thermal-unit' | 'calorie' | 'electronvolt' | 'foodcalorie' | 'joule' | 'kilocalorie' | 'kilojoule' | 'kilowatt-hour' | 'therm-us' | 'newton' | 'pound-force' | 'gigahertz' | 'hertz' | 'kilohertz' | 'megahertz' | 'dot-per-centimeter' | 'dot-per-inch' | 'em' | 'megapixel' | 'pixel' | 'pixel-per-centimeter' | 'pixel-per-inch' | 'astronomical-unit' | 'centimeter' | 'decimeter' | 'fathom' | 'foot' | 'furlong' | 'inch' | 'kilometer' | 'light-year' | 'meter' | 'micrometer' | 'mile' | 'mile-scandinavian' | 'millimeter' | 'nanometer' | 'nautical-mile' | 'parsec' | 'picometer' | 'point' | 'solar-radius' | 'yard' | 'lux' | 'solar-luminosity' | 'carat' | 'dalton' | 'earth-mass' | 'gram' | 'kilogram' | 'metric-ton' | 'microgram' | 'milligram' | 'ounce' | 'ounce-troy' | 'pound' | 'solar-mass' | 'stone' | 'ton' | 'gigawatt' | 'horsepower' | 'kilowatt' | 'megawatt' | 'milliwatt' | 'watt' | 'atmosphere' | 'bar' | 'hectopascal' | 'inch-ofhg' | 'kilopascal' | 'megapascal' | 'millibar' | 'millimeter-ofhg' | 'pascal' | 'pound-force-per-square-inch' | 'kilometer-per-hour' | 'knot' | 'meter-per-second' | 'mile-per-hour' | 'celsius' | 'fahrenheit' | 'temperature' | 'kelvin' | 'newton-meter' | 'pound-force-foot' | 'acre-foot' | 'barrel' | 'bushel' | 'centiliter' | 'cubic-centimeter' | 'cubic-foot' | 'cubic-inch' | 'cubic-kilometer' | 'cubic-meter' | 'cubic-mile' | 'cubic-yard' | 'cup' | 'cup-metric' | 'deciliter' | 'fluid-ounce' | 'fluid-ounce-imperial' | 'gallon' | 'gallon-imperial' | 'hectoliter' | 'liter' | 'megaliter' | 'milliliter' | 'pint' | 'pint-metric' | 'quart' | 'tablespoon' | 'teaspoon';

// @public
export interface Vector1Arrow<T extends string> {
    exists(bundle: PrimitiveBundle): boolean;
    get(bundle: PrimitiveBundle, key: T | T[]): string;
    mapping(bundle: PrimitiveBundle): {
        [P in T]: string;
    };
}

// @public
export interface Vector2Arrow<T extends string, S extends string> {
    exists(bundle: PrimitiveBundle): boolean;
    get(bundle: PrimitiveBundle, key1: T | T[], key2: S | S[]): string;
    mapping(bundle: PrimitiveBundle): {
        [P in T]: {
            [Q in S]: string;
        };
    };
}

// @public
export interface Vector3Arrow<T extends string, S extends string, U extends string> {
    exists(bundle: PrimitiveBundle): boolean;
    get(bundle: PrimitiveBundle, key1: T | T[], key2: S | S[], key3: U | U[]): string;
    mapping(bundle: PrimitiveBundle): {
        [P in T]: {
            [Q in S]: {
                [R in U]: string;
            };
        };
    };
}

// @public (undocumented)
export const enum Weekday {
    // (undocumented)
    FRIDAY = "6",
    // (undocumented)
    MONDAY = "2",
    // (undocumented)
    SATURDAY = "7",
    // (undocumented)
    SUNDAY = "1",
    // (undocumented)
    THURSDAY = "5",
    // (undocumented)
    TUESDAY = "3",
    // (undocumented)
    WEDNESDAY = "4"
}

// @public (undocumented)
export type WeekdayType = '1' | '2' | '3' | '4' | '5' | '6' | '7';


// (No @packageDocumentation comment for this package)

```