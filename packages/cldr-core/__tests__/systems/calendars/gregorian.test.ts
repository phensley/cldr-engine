import { CalendarDate, GregorianDate } from '../../../src';
import { CalendarConstants } from '../../../src/systems/calendars/constants';
import { DayOfWeek } from '../../../src/systems/calendars/fields';

const make = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const unixEpochFromJD = (jd: number, msDay: number = 0): number => {
  const days = jd - CalendarConstants.JD_UNIX_EPOCH;
  return days * CalendarConstants.ONE_DAY_MS + Math.round(msDay);
};

const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const PARIS = 'Europe/Paris';

test('string methods', () => {
  let d: GregorianDate;
  let n: number;

  // Tuesday, July 8, 2025 11:31:21.234 AM GMT-04:00 DST
  n = 1751988681234;

  d = make(n, NEW_YORK);
  expect(d.toString()).toEqual('Gregorian 2025-07-08 11:31:21.234 America/New_York');
  expect(d.toDateString()).toEqual('2025-07-08');
  expect(d.toTimeString()).toEqual('11:31:21.234');
  expect(d.toTimeString({ includeZoneId: true })).toEqual('11:31:21.234 America/New_York');
  expect(d.toTimeString({ includeZoneId: false })).toEqual('11:31:21.234');
  expect(d.toTimeString({ includeZoneOffset: true })).toEqual('11:31:21.234-04:00');

  let q = d.add({ millis: -234 });
  expect(q.toTimeString({ optionalMilliseconds: true })).toEqual('11:31:21');
  expect(q.toTimeString({ optionalMilliseconds: false })).toEqual('11:31:21.000');

  d = make(n, 'Europe/Paris');
  expect(d.toString()).toEqual('Gregorian 2025-07-08 17:31:21.234 Europe/Paris');
  expect(d.toDateString()).toEqual('2025-07-08');
  expect(d.toTimeString()).toEqual('17:31:21.234');
  expect(d.toTimeString({ includeZoneId: true })).toEqual('17:31:21.234 Europe/Paris');
  expect(d.toTimeString({ includeZoneId: false })).toEqual('17:31:21.234');
  expect(d.toTimeString({ includeZoneOffset: true })).toEqual('17:31:21.234+02:00');
});

test('gregorian date', () => {
  let d: GregorianDate;
  let n: number;

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  n = 1523491199123;

  // 7:59 PM NY time
  d = make(n, NEW_YORK);
  expect(d.toString()).toEqual('Gregorian 2018-04-11 19:59:59.123 America/New_York');
  expect(d.toDateString()).toEqual('2018-04-11');
  expect(d.toTimeString()).toEqual('19:59:59.123');
  expect(d.toTimeString({ includeZoneId: true })).toEqual('19:59:59.123 America/New_York');
  expect(d.toTimeString({ includeZoneId: false })).toEqual('19:59:59.123');
  expect(d.toTimeString({ includeZoneOffset: true })).toEqual('19:59:59.123-04:00');
  expect(d.toTimeString({ includeZoneOffset: false })).toEqual('19:59:59.123');
  expect(d.type()).toEqual('gregory');
  expect(d.unixEpoch()).toEqual(1523491199123);

  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
  expect(d.relatedYear()).toEqual(2018);
  expect(d.month()).toEqual(4);
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(101);
  expect(d.weekOfYear()).toEqual(15);
  expect(d.yearOfWeekOfYear()).toEqual(2018);

  expect(d.hour()).toEqual(7);
  expect(d.hourOfDay()).toEqual(19);
  expect(d.minute()).toEqual(59);
  expect(d.second()).toEqual(59);
  expect(d.milliseconds()).toEqual(123);

  expect(d.metaZoneId()).toEqual('America_Eastern');
  expect(d.timeZoneId()).toEqual('America/New_York');
  expect(d.isLeapYear()).toEqual(false);
  expect(d.isDaylightSavings()).toEqual(true);
  expect(d.timeZoneOffset()).toEqual(-14400000);

  // + 1 second
  d = make(n + 1000, NEW_YORK);

  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(4);
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(101);
  expect(d.weekOfYear()).toEqual(15);
  expect(d.yearOfWeekOfYear()).toEqual(2018);

  expect(d.hour()).toEqual(8);
  expect(d.hourOfDay()).toEqual(20);
  expect(d.minute()).toEqual(0);
  expect(d.second()).toEqual(0);
  expect(d.milliseconds()).toEqual(123);

  // 1:59 AM Paris time
  d = make(n, PARIS);

  expect(d.modifiedJulianDay()).toEqual(2458221);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(4);
  expect(d.dayOfMonth()).toEqual(12);
  expect(d.dayOfYear()).toEqual(102);

  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(1);
  expect(d.minute()).toEqual(59);
  expect(d.second()).toEqual(59);
  expect(d.milliseconds()).toEqual(123);

  // Monday, October 15, 2018 11:59:59 PM UTC
  n = 1539647999000;

  d = make(n, NEW_YORK);

  expect(d.modifiedJulianDay()).toEqual(2458407);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(10);
  expect(d.dayOfMonth()).toEqual(15);
  expect(d.dayOfYear()).toEqual(288);
  expect(d.weekOfYear()).toEqual(42);
  expect(d.yearOfWeekOfYear()).toEqual(2018);

  // March 11, 2018 3:00:25 AM EDT
  n = 1520751625000;

  d = make(n, NEW_YORK);
  expect(d.julianDay()).toEqual(2458188.7919560187); // Real Julian day UTC
  expect(d.modifiedJulianDay()).toEqual(2458189); // CLDR's modified Julian day, midnight local time.
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(3);
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(70);
  expect(d.weekOfYear()).toEqual(11);
  expect(d.yearOfWeekOfYear()).toEqual(2018);
});

test('min / max / clamp', () => {
  let d: CalendarDate;

  const min = unixEpochFromJD(CalendarConstants.JD_MIN, 0);
  const max = unixEpochFromJD(CalendarConstants.JD_MAX, 0);

  d = make(min, 'UTC');
  expect(d.toString()).toEqual('Gregorian -4712-01-01 00:00:00.000 Etc/UTC');

  // Clamp to minimum date
  d = make(min - CalendarConstants.ONE_DAY_MS, 'UTC');
  expect(d.toString()).toEqual('Gregorian -4712-01-01 00:00:00.000 Etc/UTC');

  d = make(max, 'UTC');
  expect(d.toString()).toEqual('Gregorian 8652-12-31 00:00:00.000 Etc/UTC');

  // Clamp to maximum date
  d = make(max + CalendarConstants.ONE_DAY_MS, 'UTC');
  expect(d.toString()).toEqual('Gregorian 8652-12-31 00:00:00.000 Etc/UTC');
});

test('millis in day', () => {
  let d: CalendarDate;
  let n: number;

  // March 10, 2018 5:20:30 AM EST
  n = 1520677230000;
  d = make(n, NEW_YORK);

  expect(d.millisecondsInDay()).toEqual(19230000); // 5 hour, 20 min, 30 sec

  // March 11, 2018 1:59:59 AM EST
  n = 1520751599000;
  d = make(n, NEW_YORK);

  expect(d.millisecondsInDay()).toEqual(7199000); // 1 hour, 59 min, 59 sec

  // March 11, 2018 3:00:00 AM EST
  n += 1000;
  d = make(n, NEW_YORK);

  expect(d.millisecondsInDay()).toEqual(10800000); // 3 hours

  // March 11, 2018 6:20:30 AM EDT
  n = 1520763630000;
  d = make(n, NEW_YORK);

  expect(d.millisecondsInDay()).toEqual(22830000); // 6 hours, 20 min, 30 sec
});

test('leap years 1584-1808', () => {
  const oneYear = CalendarConstants.ONE_DAY_MS * 365;
  let base: number;
  let d: GregorianDate;

  base = -12235430175000;

  const leaps: number[] = [];

  for (let i = 0; i < 230; i++) {
    d = make(base + oneYear * i, NEW_YORK);
    if (d.isLeapYear()) {
      leaps.push(d.year());
    }
  }

  expect(leaps).toEqual([
    1584, 1588, 1592, 1596, 1600, 1604, 1608, 1612, 1616, 1620, 1624, 1628, 1632, 1636, 1640, 1644, 1648, 1652, 1656,
    1660, 1664, 1668, 1672, 1676, 1680, 1684, 1688, 1692, 1696, 1704, 1708, 1712, 1716, 1720, 1724, 1728, 1732, 1736,
    1740, 1744, 1748, 1752, 1756, 1760, 1764, 1768, 1772, 1776, 1780, 1784, 1788, 1792, 1796, 1804, 1808,
  ]);
});

test('leap years 1982-2208', () => {
  const oneYear = CalendarConstants.ONE_DAY_MS * 365;
  let base: number;
  let d: GregorianDate;

  base = 387350625000;
  const leaps: number[] = [];

  for (let i = 0; i < 230; i++) {
    d = make(base + oneYear * i, NEW_YORK);
    if (d.isLeapYear()) {
      leaps.push(d.year());
    }
  }

  expect(leaps).toEqual([
    1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048, 2052, 2056,
    2060, 2064, 2068, 2072, 2076, 2080, 2084, 2088, 2092, 2096, 2104, 2108, 2112, 2116, 2120, 2124, 2128, 2132, 2136,
    2140, 2144, 2148, 2152, 2156, 2160, 2164, 2168, 2172, 2176, 2180, 2184, 2188, 2192, 2196, 2204, 2208,
  ]);
});

test('field of greatest difference', () => {
  let end: CalendarDate;
  let n: number;

  // Wednesday, April 11, 2018 5:23:45 AM UTC
  n = 1523424225000;

  // 7:59 PM NY time
  const base = make(n, NEW_YORK);
  end = make(n + 5000, NEW_YORK);

  expect(base.fieldOfVisualDifference(end)).toEqual('s');

  end = make(n + CalendarConstants.ONE_MINUTE_MS * 5, NEW_YORK);
  expect(base.fieldOfVisualDifference(end)).toEqual('m');

  end = make(n + CalendarConstants.ONE_HOUR_MS * 5, NEW_YORK);
  expect(base.fieldOfVisualDifference(end)).toEqual('H');

  end = make(n + CalendarConstants.ONE_HOUR_MS * 15, NEW_YORK);
  expect(base.fieldOfVisualDifference(end)).toEqual('a');

  end = make(n + CalendarConstants.ONE_DAY_MS * 2, NEW_YORK);
  expect(base.fieldOfVisualDifference(end)).toEqual('d');

  end = make(n + CalendarConstants.ONE_DAY_MS * 45, NEW_YORK);
  expect(base.fieldOfVisualDifference(end)).toEqual('M');

  end = make(n + CalendarConstants.ONE_DAY_MS * 450, NEW_YORK);
  expect(base.fieldOfVisualDifference(end)).toEqual('y');
});

test('week of month', () => {
  // Sunday, January 1, 1984 6:50:41 PM UTC
  const base = 441831041000;
  const day = CalendarConstants.ONE_DAY_MS;
  let d: CalendarDate;

  d = make(base, NEW_YORK);
  expect(d.month()).toEqual(1);
  expect(d.weekOfMonth()).toEqual(1);

  d = make(base + 6 * day, NEW_YORK);
  expect(d.weekOfMonth()).toEqual(1);

  d = make(base + 7 * day, NEW_YORK);
  expect(d.weekOfMonth()).toEqual(2);

  d = make(base + 13 * day, NEW_YORK);
  expect(d.weekOfMonth()).toEqual(2);

  d = make(base + 14 * day, NEW_YORK);
  expect(d.weekOfMonth()).toEqual(3);

  d = make(base + 20 * day, NEW_YORK);
  expect(d.weekOfMonth()).toEqual(3);

  d = make(base + 21 * day, NEW_YORK);
  expect(d.dayOfMonth()).toEqual(22);
  expect(d.weekOfMonth()).toEqual(4);

  d = make(base + 28 * day, NEW_YORK);
  expect(d.dayOfMonth()).toEqual(29);
  expect(d.weekOfMonth()).toEqual(5);

  d = make(base + 30 * day, NEW_YORK);
  expect(d.dayOfMonth()).toEqual(31);
  expect(d.weekOfMonth()).toEqual(5);

  d = make(base + 32 * day, NEW_YORK);
  expect(d.month()).toEqual(2);
  expect(d.dayOfMonth()).toEqual(2);
  expect(d.weekOfMonth()).toEqual(1);
});

test('week of year', () => {
  // March 11, 2018 3:00:25 AM EDT
  let base = 1520751625000;
  let d: CalendarDate;

  d = make(base, LOS_ANGELES);
  expect(d.dayOfWeek()).toEqual(7); // saturday
  expect(d.weekOfYear()).toEqual(10);

  d = make(base, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(1); // sunday
  expect(d.weekOfYear()).toEqual(11);

  // March 11, 2000 3:00:25 AM EST
  base = 952761625000;

  // Jan 2000 31 days
  // Feb 2000 29 days
  //
  //      March 2000
  // Su Mo Tu We Th Fr Sa
  //           1  2  3  4
  //  5  6  7  8  9 10 11
  // 12 13 14 15 16 17 18
  // 19 20 21 22 23 24 25
  // 26 27 28 29 30 31

  const day = CalendarConstants.ONE_DAY_MS;

  d = make(base, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(7); // saturday
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(71);
  expect(d.weekOfYear()).toEqual(11);
  expect(d.isLeapYear()).toEqual(true);

  d = make(base + day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(1); // sunday
  expect(d.dayOfMonth()).toEqual(12);
  expect(d.dayOfYear()).toEqual(72);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 2 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(2); // monday
  expect(d.dayOfMonth()).toEqual(13);
  expect(d.dayOfYear()).toEqual(73);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 3 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(3); // tuesday
  expect(d.dayOfMonth()).toEqual(14);
  expect(d.dayOfYear()).toEqual(74);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 4 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(4); // wednesday
  expect(d.dayOfMonth()).toEqual(15);
  expect(d.dayOfYear()).toEqual(75);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 5 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(5); // thursday
  expect(d.dayOfMonth()).toEqual(16);
  expect(d.dayOfYear()).toEqual(76);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 6 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(6); // friday
  expect(d.dayOfMonth()).toEqual(17);
  expect(d.dayOfYear()).toEqual(77);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 7 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(7); // saturday
  expect(d.dayOfMonth()).toEqual(18);
  expect(d.dayOfYear()).toEqual(78);
  expect(d.weekOfYear()).toEqual(12);

  d = make(base + 8 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(1); // sunday
  expect(d.dayOfMonth()).toEqual(19);
  expect(d.dayOfYear()).toEqual(79);
  expect(d.weekOfYear()).toEqual(13);

  d = make(base + 9 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(2); // monday
  expect(d.dayOfMonth()).toEqual(20);
  expect(d.dayOfYear()).toEqual(80);
  expect(d.weekOfYear()).toEqual(13);

  d = make(base + 10 * day, NEW_YORK);
  expect(d.dayOfWeek()).toEqual(3); // tuesday
  expect(d.dayOfMonth()).toEqual(21);
  expect(d.dayOfYear()).toEqual(81);
  expect(d.weekOfYear()).toEqual(13);
});

type WeekCase = [number, number, number];

test('first/last week of year 2000', () => {
  const day = CalendarConstants.ONE_DAY_MS;

  const check = (c: WeekCase, i: number) => {
    const [dom, woy, ywoy] = c;
    const d = make(base + i * day, NEW_YORK);
    try {
      expect(d.dayOfMonth()).toEqual(dom);
      expect(d.weekOfYear()).toEqual(woy);
      expect(d.yearOfWeekOfYear()).toEqual(ywoy);
    } catch (e) {
      console.log(`failure: ${c}`);
      throw e;
    }
  };

  // Dec 24 1999 12:00:00 UTC
  let base = 946036800000;

  let cases: WeekCase[] = [
    [24, 52, 1999],
    [25, 52, 1999],
    [26, 1, 2000],
    [27, 1, 2000],
    [28, 1, 2000],
    [29, 1, 2000],
    [30, 1, 2000],
    [31, 1, 2000],
    [1, 1, 2000],
    [2, 2, 2000],
    [3, 2, 2000],
  ];

  cases.forEach(check);

  // Dec 26 2000 12:00:00 UTC
  base = 977832000000;

  cases = [
    [26, 53, 2000],
    [27, 53, 2000],
    [28, 53, 2000],
    [29, 53, 2000],
    [30, 53, 2000],
    [31, 1, 2001],
    [1, 1, 2001],
    [2, 1, 2001],
    [3, 1, 2001],
    [4, 1, 2001],
    [5, 1, 2001],
    [6, 1, 2001],
    [7, 2, 2001],
  ];
  cases.forEach(check);

  // Dec 26 2001 12:00:00 UTC
  base = 1009368000000;

  cases = [
    [26, 52, 2001],
    [27, 52, 2001],
    [28, 52, 2001],
    [29, 52, 2001],
    [30, 1, 2002],
    [31, 1, 2002],
    [1, 1, 2002],
    [2, 1, 2002],
    [3, 1, 2002],
    [4, 1, 2002],
    [5, 1, 2002],
    [6, 2, 2002],
    [7, 2, 2002],
  ];
  cases.forEach(check);

  // Dec 26 2002 12:00:00 UTC
  base = 1040904000000;

  cases = [
    [26, 52, 2002],
    [27, 52, 2002],
    [28, 52, 2002],
    [29, 1, 2003],
    [30, 1, 2003],
    [31, 1, 2003],
    [1, 1, 2003],
    [2, 1, 2003],
    [3, 1, 2003],
    [4, 1, 2003],
    [5, 2, 2003],
    [6, 2, 2003],
  ];
  cases.forEach(check);

  // Dec 26 2003 12:00:00 UTC
  base = 1072440000000;

  cases = [
    [26, 52, 2003],
    [27, 52, 2003],
    [28, 1, 2004],
    [29, 1, 2004],
    [30, 1, 2004],
    [31, 1, 2004],
    [1, 1, 2004],
    [2, 1, 2004],
    [3, 1, 2004],
    [4, 2, 2004],
    [5, 2, 2004],
  ];
  cases.forEach(check);

  // Dec 24 2004 12:00:00 UTC
  base = 1103889600000;

  cases = [
    [24, 52, 2004],
    [25, 52, 2004],
    [26, 1, 2005],
    [27, 1, 2005],
    [28, 1, 2005],
    [29, 1, 2005],
    [30, 1, 2005],
    [31, 1, 2005],
    [1, 1, 2005],
    [2, 2, 2005],
    [3, 2, 2005],
    [4, 2, 2005],
  ];
  cases.forEach(check);

  // Dec 24 2005 12:00:00 UTC
  base = 1135425600000;

  cases = [
    [24, 52, 2005],
    [25, 53, 2005],
    [26, 53, 2005],
    [27, 53, 2005],
    [28, 53, 2005],
    [29, 53, 2005],
    [30, 53, 2005],
    [31, 53, 2005],
    [1, 1, 2006],
    [2, 1, 2006],
    [3, 1, 2006],
    [4, 1, 2006],
  ];
  cases.forEach(check);

  // Dec 24 2006 12:00:00 UTC
  base = 1166961600000;

  cases = [
    [24, 52, 2006],
    [25, 52, 2006],
    [26, 52, 2006],
    [27, 52, 2006],
    [28, 52, 2006],
    [29, 52, 2006],
    [30, 52, 2006],
    [31, 1, 2007],
    [1, 1, 2007],
    [2, 1, 2007],
    [3, 1, 2007],
  ];
  cases.forEach(check);

  // Dec 26 2007 12:00:00 UTC
  base = 1198670400000;

  cases = [
    [26, 52, 2007],
    [27, 52, 2007],
    [28, 52, 2007],
    [29, 52, 2007],
    [30, 1, 2008],
    [31, 1, 2008],
    [1, 1, 2008],
    [2, 1, 2008],
    [3, 1, 2008],
  ];
  cases.forEach(check);

  // Dec 26 2008 12:00:00 UTC
  base = 1230292800000;

  cases = [
    [26, 52, 2008],
    [27, 52, 2008],
    [28, 1, 2009],
    [29, 1, 2009],
    [30, 1, 2009],
    [31, 1, 2009],
    [1, 1, 2009],
    [2, 1, 2009],
    [3, 1, 2009],
  ];
  cases.forEach(check);
});

test('constructor', () => {
  let d: GregorianDate;

  d = GregorianDate.fromUnixEpoch(0, 'America/New_York');
  expect(d.toString()).toEqual('Gregorian 1969-12-31 19:00:00.000 America/New_York');

  d = GregorianDate.fromUnixEpoch(0, 'Asia/Tokyo');
  expect(d.toString()).toEqual('Gregorian 1970-01-01 09:00:00.000 Asia/Tokyo');
});

test('days in month/year', () => {
  let d: GregorianDate;

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  d = make(1523491199123, 'UTC');

  // Test protected methods
  expect((d as any).daysInMonth(2025, 0)).toEqual(31);
  expect((d as any).daysInMonth(2022, 0)).toEqual(31);

  // Gregorian leap years
  expect((d as any).daysInMonth(2025, 1)).toEqual(28);
  expect((d as any).daysInMonth(2024, 1)).toEqual(29);

  // Gregorian leap years
  expect((d as any).daysInYear(2025)).toEqual(365);
  expect((d as any).daysInYear(2024)).toEqual(366);
});
