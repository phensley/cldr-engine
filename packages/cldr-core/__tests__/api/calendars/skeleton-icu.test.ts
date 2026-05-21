import { calendarsApi } from '../../_helpers';

const hasIntl = typeof Intl !== 'undefined' && 'DateTimeFormat' in Intl;

/**
 * The CLDR 48.2.0 source data preserves U+00A0 / U+202F (nbsp / narrow
 * no-break space) in some patterns (e.g. bg "y 'г'."), while ICU renders
 * them as a regular space. Normalize before comparing so the test asserts
 * on pattern selection, not on data-level space rendering.
 */
const normalize = (s: string): string => s.replace(/[\u00A0\u202F]/g, ' ');

// Monday, July 15, 2024 (UTC)
const MS = 1721030400000;
const date = { date: MS, zoneId: 'UTC' };

interface Case {
  skel: string;
  opts: Intl.DateTimeFormatOptions;
}

const longMonthShortWeekday: Case['opts'] = {
  weekday: 'short',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

// Long month + short weekday is the class of skeleton that best-fit
// matching must resolve to a long-month pattern (adjusting the weekday
// width) rather than a short-month pattern (which drops literals like
// 'de'/'den' or degenerates a named month to digits).
const CASES: Case[] = [
  { skel: 'yMMMMdE', opts: longMonthShortWeekday },
  { skel: 'EdMMMMy', opts: longMonthShortWeekday },
  {
    skel: 'yEEEMMMd',
    opts: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
  },
  {
    skel: 'yMMMMEEEEd',
    opts: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  },
];

describe.skipIf(!hasIntl)('skeleton best-fit vs Intl.DateTimeFormat', () => {
  for (const locale of ['es', 'ca', 'cs', 'sk', 'bg', 'lt', 'lv', 'ko', 'da']) {
    for (const { skel, opts } of CASES) {
      it(`${locale} ${skel}`, () => {
        const expected = normalize(new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' }).format(new Date(MS)));
        const actual = normalize(calendarsApi(locale).formatDate(date, { skeleton: skel }));
        expect(actual).toEqual(expected);
      });
    }
  }
});
