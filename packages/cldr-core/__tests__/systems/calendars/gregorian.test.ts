import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { CalendarDate, CalendarType, GregorianDate } from '../../../src/systems/calendars';
import { CalendarConstants } from '../../../src/systems/calendars/constants';

const make = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const PARIS = 'Europe/Paris';

test('gregorian date', () => {
  let d: GregorianDate;
  let n: number;

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  n = 1523491199123;

  // 7:59 PM NY time
  d = make(n, NEW_YORK);
  expect(d.toString()).toEqual('Gregorian 2018-04-11 19:59:59.123 America/New_York');
  expect(d.type()).toEqual('gregory');
  expect(d.unixEpoch()).toEqual(1523491199123);

  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
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
  expect(d.timeZoneOffset()).toEqual(14400000);

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
  expect(d.modifiedJulianDay()).toEqual(2458189);    // CLDR's modified Julian day, midnight local time.
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(3);
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(70);
  expect(d.weekOfYear()).toEqual(11);
  expect(d.yearOfWeekOfYear()).toEqual(2018);
});

test('min / max date', () => {
  let d: GregorianDate;
  let n: number;

  const unix = CalendarConstants.JD_UNIX_EPOCH;

  n = (unix - 1) * CalendarConstants.ONE_DAY_MS;
  d = make(-n, NEW_YORK);
  expect(d.era()).toEqual(0);
  expect(d.extendedYear()).toEqual(-4712);
  expect(d.year()).toEqual(4713);
  expect(d.month()).toEqual(1); // Jan
  expect(d.dayOfMonth()).toEqual(1);

  // Attempting to represent Dec 31 4714 BC
  expect(() => make(-n - CalendarConstants.ONE_DAY_MS, NEW_YORK)).toThrowError();

  n = (CalendarConstants.JD_MAX - unix + 1) * CalendarConstants.ONE_DAY_MS;
  d = make(n, NEW_YORK);
  expect(d.era()).toEqual(1);
  expect(d.extendedYear()).toEqual(8652);
  expect(d.year()).toEqual(8652);
  expect(d.month()).toEqual(12); // Dec
  expect(d.dayOfMonth()).toEqual(31);

  // Attempt to represent Jan  1 8653 AD
  expect(() => make(n + CalendarConstants.ONE_DAY_MS, NEW_YORK)).toThrowError();
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
    d = make(base + (oneYear * i), NEW_YORK);
    if (d.isLeapYear()) {
      leaps.push(d.year());
    }
  }

  expect(leaps).toEqual([
    1584, 1588, 1592, 1596, 1600, 1604, 1608, 1612, 1616, 1620, 1624, 1628, 1632, 1636,
    1640, 1644, 1648, 1652, 1656, 1660, 1664, 1668, 1672, 1676, 1680, 1684, 1688, 1692, 1696,
    1704, 1708, 1712, 1716, 1720, 1724, 1728, 1732, 1736, 1740, 1744, 1748, 1752, 1756, 1760,
    1764, 1768, 1772, 1776, 1780, 1784, 1788, 1792, 1796,
    1804, 1808
  ]);
});

test('leap years 1982-2208', () => {
  const oneYear = CalendarConstants.ONE_DAY_MS * 365;
  let base: number;
  let d: GregorianDate;

  base = 387350625000;
  const leaps: number[] = [];

  for (let i = 0; i < 230; i++) {
    d = make(base + (oneYear * i), NEW_YORK);
    if (d.isLeapYear()) {
      leaps.push(d.year());
    }
  }

  expect(leaps).toEqual([
    1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036,
    2040, 2044, 2048, 2052, 2056, 2060, 2064, 2068, 2072, 2076, 2080, 2084, 2088, 2092, 2096,
    2104, 2108, 2112, 2116, 2120, 2124, 2128, 2132, 2136, 2140, 2144, 2148, 2152, 2156, 2160,
    2164, 2168, 2172, 2176, 2180, 2184, 2188, 2192, 2196,
    2204, 2208
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

  expect(base.fieldOfGreatestDifference(end)).toEqual('s');

  end = make(n + (CalendarConstants.ONE_MINUTE_MS * 5), NEW_YORK);
  expect(base.fieldOfGreatestDifference(end)).toEqual('m');

  end = make(n + (CalendarConstants.ONE_HOUR_MS * 5), NEW_YORK);
  expect(base.fieldOfGreatestDifference(end)).toEqual('H');

  end = make(n + (CalendarConstants.ONE_HOUR_MS * 15), NEW_YORK);
  expect(base.fieldOfGreatestDifference(end)).toEqual('a');

  end = make(n + (CalendarConstants.ONE_DAY_MS * 2), NEW_YORK);
  expect(base.fieldOfGreatestDifference(end)).toEqual('d');

  end = make(n + (CalendarConstants.ONE_DAY_MS * 45), NEW_YORK);
  expect(base.fieldOfGreatestDifference(end)).toEqual('M');

  end = make(n + (CalendarConstants.ONE_DAY_MS * 450), NEW_YORK);
  expect(base.fieldOfGreatestDifference(end)).toEqual('y');
});

test('week of month', () => {
  // Sunday, January 1, 1984 6:50:41 PM UTC
  const base = 441831041000;
  const day = CalendarConstants.ONE_DAY_MS;
  let d: CalendarDate;

  d = make(base, NEW_YORK);
  expect(d.month()).toEqual(1);
  expect(d.weekOfMonth()).toEqual(1);

  d = make(base + (6 * day), NEW_YORK);
  expect(d.weekOfMonth()).toEqual(1);

  d = make(base + (7 * day), NEW_YORK);
  expect(d.weekOfMonth()).toEqual(2);

  d = make(base + (13 * day), NEW_YORK);
  expect(d.weekOfMonth()).toEqual(2);

  d = make(base + (14 * day), NEW_YORK);
  expect(d.weekOfMonth()).toEqual(3);

  d = make(base + (20 * day), NEW_YORK);
  expect(d.weekOfMonth()).toEqual(3);

  d = make(base + (21 * day), NEW_YORK);
  expect(d.dayOfMonth()).toEqual(22);
  expect(d.weekOfMonth()).toEqual(4);

  d = make(base + (28 * day), NEW_YORK);
  expect(d.dayOfMonth()).toEqual(29);
  expect(d.weekOfMonth()).toEqual(5);

  d = make(base + (30 * day), NEW_YORK);
  expect(d.dayOfMonth()).toEqual(31);
  expect(d.weekOfMonth()).toEqual(5);

  d = make(base + (32 * day), NEW_YORK);
  expect(d.month()).toEqual(2);
  expect(d.dayOfMonth()).toEqual(2);
  expect(d.weekOfMonth()).toEqual(1);
});

test('week of year', () => {
  // March 11, 2018 3:00:25 AM EDT
  let base = 1520751625000;
  let d: CalendarDate;

  d = GregorianDate.fromUnixEpoch(base, LOS_ANGELES, 1, 1);
  expect(d.dayOfWeek()).toEqual(7); // saturday
  expect(d.weekOfYear()).toEqual(10);

  d = GregorianDate.fromUnixEpoch(base, NEW_YORK, 1, 1);
  expect(d.dayOfWeek()).toEqual(1); // sunday
  expect(d.weekOfYear()).toEqual(11);

  // March 11, 2000 3:00:25 AM EST
  base = 952761625000;

  d = GregorianDate.fromUnixEpoch(base, NEW_YORK, 1, 1);
  expect(d.dayOfWeek()).toEqual(7); // saturday
  expect(d.weekOfYear()).toEqual(11);
  expect(d.isLeapYear()).toEqual(true);
});
