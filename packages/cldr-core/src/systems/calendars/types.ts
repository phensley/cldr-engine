// The internal type name for Gregorian calendar is "gregory" so that it can fit
// into a language tag ("zh-u-ca-gregory") as "gregorian" exceeds the 8-char
// limit.
// See https://www.unicode.org/reports/tr35/#Key_And_Type_Definitions_
export type CalendarType = 'buddhist' | 'gregory' | 'iso8601' | 'japanese' | 'persian';
