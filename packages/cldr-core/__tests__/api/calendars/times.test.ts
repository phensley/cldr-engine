import { calendarsApi } from '../../_helpers';

import { ZonedDateTime } from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

const NEW_YORK = 'America/New_York';

type HourCase = [number, string, string];

test('hours', () => {
  const api = calendarsApi('en');
  let cases: HourCase[];

  const fmt = (hours: number, ch: string): string =>
    api.formatDateRaw(unix(base + hours * 3600000, NEW_YORK), { pattern: ch });

  const check = (p: string, c: HourCase, i: number) => {
    const [hour, e1, e2] = c;
    const patterns = [p, p + p, p + p + p];
    const expected = [e1, e2, e2];
    for (let j = 0; j < patterns.length; j++) {
      const s = fmt(hour, patterns[j]);
      try {
        expect(s).toEqual(expected[j]);
      } catch (e) {
        console.log(`Failed case ${i} for pattern "${patterns[j]}": ${c}`);
        throw e;
      }
    }
  };

  // Feb 1 2018 midnight NY time
  const base = 1517461200000;

  cases = [
    [0, '12', '12'],
    [1, '1', '01'],
    [2, '2', '02'],
    [3, '3', '03'],
    [4, '4', '04'],
    [5, '5', '05'],
    [6, '6', '06'],
    [7, '7', '07'],
    [8, '8', '08'],
    [9, '9', '09'],
    [10, '10', '10'],
    [11, '11', '11'],
    [12, '12', '12'],
    [13, '1', '01'],
    [14, '2', '02'],
    [15, '3', '03'],
    [16, '4', '04'],
    [17, '5', '05'],
    [18, '6', '06'],
    [19, '7', '07'],
    [20, '8', '08'],
    [21, '9', '09'],
    [22, '10', '10'],
    [23, '11', '11'],
    [24, '12', '12'],
    [25, '1', '01'],
  ];

  cases.forEach((c, i) => check('h', c, i));

  cases = [
    [0, '0', '00'],
    [1, '1', '01'],
    [2, '2', '02'],
    [3, '3', '03'],
    [4, '4', '04'],
    [5, '5', '05'],
    [6, '6', '06'],
    [7, '7', '07'],
    [8, '8', '08'],
    [9, '9', '09'],
    [10, '10', '10'],
    [11, '11', '11'],
    [12, '12', '12'],
    [13, '13', '13'],
    [14, '14', '14'],
    [15, '15', '15'],
    [16, '16', '16'],
    [17, '17', '17'],
    [18, '18', '18'],
    [19, '19', '19'],
    [20, '20', '20'],
    [21, '21', '21'],
    [22, '22', '22'],
    [23, '23', '23'],
    [24, '0', '00'],
    [25, '1', '01'],
  ];

  cases.forEach((c, i) => check('H', c, i));

  cases = [
    [0, '0', '00'],
    [1, '1', '01'],
    [2, '2', '02'],
    [3, '3', '03'],
    [4, '4', '04'],
    [5, '5', '05'],
    [6, '6', '06'],
    [7, '7', '07'],
    [8, '8', '08'],
    [9, '9', '09'],
    [10, '10', '10'],
    [11, '11', '11'],
    [12, '0', '00'],
    [13, '1', '01'],
    [14, '2', '02'],
    [15, '3', '03'],
    [16, '4', '04'],
    [17, '5', '05'],
    [18, '6', '06'],
    [19, '7', '07'],
    [20, '8', '08'],
    [21, '9', '09'],
    [22, '10', '10'],
    [23, '11', '11'],
    [24, '0', '00'],
    [25, '1', '01'],
  ];

  cases.forEach((c, i) => check('K', c, i));

  cases = [
    [0, '24', '24'],
    [1, '1', '01'],
    [2, '2', '02'],
    [3, '3', '03'],
    [4, '4', '04'],
    [5, '5', '05'],
    [6, '6', '06'],
    [7, '7', '07'],
    [8, '8', '08'],
    [9, '9', '09'],
    [10, '10', '10'],
    [11, '11', '11'],
    [12, '12', '12'],
    [13, '13', '13'],
    [14, '14', '14'],
    [15, '15', '15'],
    [16, '16', '16'],
    [17, '17', '17'],
    [18, '18', '18'],
    [19, '19', '19'],
    [20, '20', '20'],
    [21, '21', '21'],
    [22, '22', '22'],
    [23, '23', '23'],
    [24, '24', '24'],
    [25, '1', '01'],
  ];

  cases.forEach((c, i) => check('k', c, i));
});

test('fractional', () => {
  const api = calendarsApi('en');

  // Feb 1 2018 midnight NY time
  const base = 1517461200000;

  const fmt = (ms: number, ch: string): string => api.formatDateRaw(unix(base + ms, NEW_YORK), { pattern: ch });

  expect(fmt(0, 'S')).toEqual('0');
  expect(fmt(0, 'SSSS')).toEqual('0000');

  expect(fmt(1, 'S')).toEqual('0');
  expect(fmt(1, 'SSSS')).toEqual('0010');

  expect(fmt(123, 'S')).toEqual('1');
  expect(fmt(123, 'SSSS')).toEqual('1230');

  expect(fmt(678, 'S')).toEqual('6');
  expect(fmt(678, 'SSSS')).toEqual('6780');

  expect(fmt(999, 'S')).toEqual('9');
  expect(fmt(999, 'SSSS')).toEqual('9990');
  expect(fmt(999, 'SSSSSSSS')).toEqual('99900000');
});
