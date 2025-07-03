import { Temporal } from '@js-temporal/polyfill';
import { CalendarDate, GregorianDate, TimePeriod, TimePeriodField } from '../../../src';
import {
  FEB_28_2024,
  FEB_29_2024,
  JAN_30_2024,
  MAR_03_2024,
  MAR_10_2024,
  MAR_30_2024,
  NEW_YORK,
  PARIS,
  TOKYO,
  UTC,
} from './_referencedates';
import { CLDRFormatter, durationToPeriod, enumerate, periodToDurationLike, TemporalFormatter } from './_utils';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const tempstr = (t: Temporal.ZonedDateTime): string =>
  `${t.toPlainDate().toString()} ${t.toPlainTime().toString()}${t.offset}`;

const cldrstr = (c: CalendarDate): string =>
  c.toDateTimeString({ includeZoneOffset: true, optionalMilliseconds: true });

const edgeCaseEpochs = (epoch1: number, epoch2: number, zone: string) => {
  const tempfmt = new TemporalFormatter({ includeZoneOffset: true });
  const cldrfmt = new CLDRFormatter({ includeZoneOffset: true });
  const cldr1 = gregorian(epoch1, zone);
  const cldr2 = gregorian(epoch2, zone);
  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch1).toZonedDateTimeISO(zone);
  const temp2 = Temporal.Instant.fromEpochMilliseconds(epoch2).toZonedDateTimeISO(zone);
  const csince = cldr1.since(cldr2);
  const tsince = temp1.since(temp2, { largestUnit: 'year', smallestUnit: 'millisecond' });
  expect(cldrfmt.periodString(csince)).toEqual(tempfmt.durationString(tsince));
};

test('api comment examples', () => {
  const epoch1 = 1706634000000; // 2024-01-30
  const epoch2 = 1709485200000; // 2024-03-03
  edgeCaseEpochs(epoch2, epoch1, NEW_YORK);
  edgeCaseEpochs(epoch1, epoch2, NEW_YORK);
});

test('dates', () => {
  // Format of each test case below:
  // [date1, days-added, fields, date2, duration-since]
  //
  //  date1 + days-added = date2
  //  date1.since(date2, { fields }) == duration-since
  //
  // Empty duration '' means all fields in the result were zero.
  //
  const cases: [number, number, TimePeriodField[], string, string][] = [
    // POSITIVE DURATIONS: date1.since(date2) where date1 > date2

    [MAR_30_2024, -27, [], '2024-03-03', '27d'],
    [MAR_30_2024, -28, [], '2024-03-02', '28d'],
    [MAR_30_2024, -29, [], '2024-03-01', '29d'],
    [MAR_30_2024, -30, [], '2024-02-29', '1m'],
    [MAR_30_2024, -31, [], '2024-02-28', '1m 1d'],
    [MAR_30_2024, -32, [], '2024-02-27', '1m 2d'],
    [MAR_30_2024, -33, [], '2024-02-26', '1m 3d'],

    [MAR_03_2024, -27, [], '2024-02-05', '27d'],
    [MAR_03_2024, -28, [], '2024-02-04', '28d'],
    [MAR_03_2024, -29, [], '2024-02-03', '1m'],
    [MAR_03_2024, -30, [], '2024-02-02', '1m 1d'],
    [MAR_03_2024, -31, [], '2024-02-01', '1m 2d'],
    [MAR_03_2024, -32, [], '2024-01-31', '1m 3d'],
    [MAR_03_2024, -33, [], '2024-01-30', '1m 4d'],

    // // NEGATIVE DURATIONS: date1.since(date2) where date1 < date2

    [JAN_30_2024, 28, [], '2024-02-27', '-28d'],
    [JAN_30_2024, 29, [], '2024-02-28', '-29d'],
    [JAN_30_2024, 30, [], '2024-02-29', '-30d'],
    [JAN_30_2024, 31, [], '2024-03-01', '-1m -1d'],
    [JAN_30_2024, 32, [], '2024-03-02', '-1m -2d'],
    [JAN_30_2024, 33, [], '2024-03-03', '-1m -3d'],

    [FEB_28_2024, 28, [], '2024-03-27', '-28d'],
    [FEB_28_2024, 29, [], '2024-03-28', '-1m'],
    [FEB_28_2024, 30, [], '2024-03-29', '-1m -1d'],
    [FEB_28_2024, 31, [], '2024-03-30', '-1m -2d'],
    [FEB_28_2024, 32, [], '2024-03-31', '-1m -3d'],
    [FEB_28_2024, 33, [], '2024-04-01', '-1m -4d'],

    [FEB_29_2024, 28, [], '2024-03-28', '-28d'],
    [FEB_29_2024, 29, [], '2024-03-29', '-1m'],
    [FEB_29_2024, 30, [], '2024-03-30', '-1m -1d'],
    [FEB_29_2024, 31, [], '2024-03-31', '-1m -2d'],
    [FEB_29_2024, 32, [], '2024-04-01', '-1m -3d'],
    [FEB_29_2024, 33, [], '2024-04-02', '-1m -4d'],

    // ROLLDOWNS

    [FEB_29_2024, -400, ['year'], '2023-01-25', '1y'],
    [FEB_29_2024, -400, ['year', 'month'], '2023-01-25', '1y 1m'],
    [FEB_29_2024, -400, ['year', 'month', 'day'], '2023-01-25', '1y 1m 4d'],
    [FEB_29_2024, -400, ['month'], '2023-01-25', '13m'],
    [FEB_29_2024, -400, ['month', 'day'], '2023-01-25', '13m 4d'],
    [FEB_29_2024, -400, ['day'], '2023-01-25', '400d'],

    [FEB_29_2024, -33, ['year'], '2024-01-27', ''],
    [FEB_29_2024, -33, ['year', 'month'], '2024-01-27', '1m'],
    [FEB_29_2024, -33, ['year', 'month', 'day'], '2024-01-27', '1m 2d'],
    [FEB_29_2024, -33, ['month'], '2024-01-27', '1m'],
    [FEB_29_2024, -33, ['month', 'day'], '2024-01-27', '1m 2d'],
    [FEB_29_2024, -33, ['day'], '2024-01-27', '33d'],
  ];

  const cldrfmt = new CLDRFormatter();
  const zones = [NEW_YORK, PARIS, TOKYO];

  for (const [index, [epoch, day, fields, expDate, expDiff]] of enumerate(cases)) {
    for (const zone of zones) {
      const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(zone);
      const cldr1 = gregorian(epoch, zone);

      const cldrtime: Partial<TimePeriod> = { day };
      const cldr2 = cldr1.add(cldrtime);
      const msg = `case ${index}: ${cldr1.toDateString()} days ${day}`;
      expect(cldr2.toDateString(), msg).toEqual(expDate);
      const cldrsince = cldr1.since(cldr2, { fields });
      expect(cldrfmt.periodString(cldrsince), msg).toEqual(expDiff);

      // Temporal only supports specifying a largest and smallest field, creating a range.
      // It also has weird quirks like only supporting 'week' if it is the largest unit.
      // So it cannot support things like ['year', 'week'] or ['year', 'day'] or ['month', 'week'].
      // For this reason we only compare cases that include all of the fields.
      if (fields.length === 0) {
        const temp2 = temp1.add(periodToDurationLike({ day }));
        const tempsince = temp1.since(temp2, { largestUnit: 'year', smallestUnit: 'millisecond' });
        expect(cldrsince).toEqual(durationToPeriod(tempsince));
      }
    }
  }
});

test('dates and times', () => {
  // Two cases for time adjustment:
  //
  // date1 < date2; date1.since(date2) (result negative)
  //
  // [JAN_30_2024, 29, [], '2024-02-28', '-29d'],
  //
  // 2024-01-30 8:30am  2024-02-28 8:30am  == -29d
  // 2024-01-30 8:30am  2024-02-28 6:30am  == -28d -22H
  // 2024-01-30 8:30am  2024-02-28 10:30am == -29d -2H
  //
  // date1 > date2; date1.since(date2) (result positive)
  //
  // [MAR_30_2024, -29, [], '2024-03-01', '29d'],
  //
  // 2024-03-30 8:30am  2024-03-01 8:30am  == 29d
  // 2024-03-30 8:30am  2024-03-01 6:30am  == 28d 22H
  // 2024-03-30 8:30am  2024-03-01 10:30am == 29d 2H

  // Format of each test case below:
  // [date1, fields-added, fields, date2, duration-since]
  //
  //  date1 + days-added = date2
  //  date1.since(date2, { fields }) == duration-since
  //
  // Empty duration '' means all fields in the result were zero.
  //
  const cases: [number, Partial<TimePeriod>, TimePeriodField[], string, string, string][] = [
    // POSITIVE DURATIONS: date1.since(date2) where date1 > date2

    // Spring DST
    [MAR_10_2024, { minute: 0 }, [], UTC, '2024-03-10', ''],
    [MAR_10_2024, { minute: 1 }, [], UTC, '2024-03-10', '-1M'],
    [MAR_10_2024, { hour: 1 }, [], UTC, '2024-03-10', '-1H'],

    [MAR_10_2024, { day: -10, hour: -10 }, [], UTC, '2024-02-28', '10d 10H'],

    [JAN_30_2024, { day: 28, hour: 1 }, [], UTC, '2024-02-27', '-28d -1H'],
    [JAN_30_2024, { day: 28, hour: 1 }, [], NEW_YORK, '2024-02-27', '-28d -1H'],
    [JAN_30_2024, { day: 28, hour: 2 }, [], UTC, '2024-02-27', '-28d -2H'],
    [JAN_30_2024, { day: 28, hour: 2 }, [], NEW_YORK, '2024-02-27', '-28d -2H'],

    [JAN_30_2024, { day: -28, hour: -1 }, [], UTC, '2024-01-02', '28d 1H'],
    [JAN_30_2024, { day: -28, hour: -1 }, [], NEW_YORK, '2024-01-02', '28d 1H'],
    [JAN_30_2024, { day: -28, hour: -2 }, [], UTC, '2024-01-02', '28d 2H'],
    [JAN_30_2024, { day: -28, hour: -2 }, [], NEW_YORK, '2024-01-02', '28d 2H'],

    [MAR_30_2024, { day: -27, hour: -3 }, [], UTC, '2024-03-03', '27d 3H'],
    [MAR_30_2024, { day: -27, hour: -3 }, [], NEW_YORK, '2024-03-03', '27d 3H'],
    [MAR_30_2024, { day: -27, hour: -17 }, [], UTC, '2024-03-02', '27d 17H'],
    [MAR_30_2024, { day: -27, hour: -17 }, [], NEW_YORK, '2024-03-02', '27d 17H'],

    // Days

    [MAR_30_2024, { day: -28 }, [], NEW_YORK, '2024-03-02', '28d'],
    [MAR_30_2024, { day: -28 }, [], UTC, '2024-03-02', '28d'],
    [MAR_30_2024, { day: -29 }, [], NEW_YORK, '2024-03-01', '29d'],
    [MAR_30_2024, { day: -29 }, [], UTC, '2024-03-01', '29d'],
    [MAR_30_2024, { day: -30 }, [], NEW_YORK, '2024-02-29', '1m'],
    [MAR_30_2024, { day: -30 }, [], UTC, '2024-02-29', '1m'],
    [MAR_30_2024, { day: -31 }, [], NEW_YORK, '2024-02-28', '1m 1d'],
    [MAR_30_2024, { day: -31 }, [], UTC, '2024-02-28', '1m 1d'],
    [MAR_30_2024, { day: -32 }, [], NEW_YORK, '2024-02-27', '1m 2d'],
    [MAR_30_2024, { day: -32 }, [], UTC, '2024-02-27', '1m 2d'],
    [MAR_30_2024, { day: -33 }, [], NEW_YORK, '2024-02-26', '1m 3d'],
    [MAR_30_2024, { day: -33 }, [], UTC, '2024-02-26', '1m 3d'],

    [MAR_03_2024, { day: -27 }, [], NEW_YORK, '2024-02-05', '27d'],
    [MAR_03_2024, { day: -28 }, [], NEW_YORK, '2024-02-04', '28d'],
    [MAR_03_2024, { day: -29 }, [], NEW_YORK, '2024-02-03', '1m'],
    [MAR_03_2024, { day: -30 }, [], NEW_YORK, '2024-02-02', '1m 1d'],
    [MAR_03_2024, { day: -31 }, [], NEW_YORK, '2024-02-01', '1m 2d'],
    [MAR_03_2024, { day: -32 }, [], NEW_YORK, '2024-01-31', '1m 3d'],
    [MAR_03_2024, { day: -33 }, [], NEW_YORK, '2024-01-30', '1m 4d'],

    // NEGATIVE DURATIONS: date1.since(date2) where date1 < date2

    [JAN_30_2024, { day: 29 }, [], UTC, '2024-02-28', '-29d'],
    [JAN_30_2024, { day: 30 }, [], UTC, '2024-02-29', '-30d'],
    [JAN_30_2024, { day: 31 }, [], UTC, '2024-03-01', '-1m -1d'],
    [JAN_30_2024, { day: 32 }, [], UTC, '2024-03-02', '-1m -2d'],
    [JAN_30_2024, { day: 33 }, [], UTC, '2024-03-03', '-1m -3d'],
    [FEB_28_2024, { day: 28 }, [], UTC, '2024-03-27', '-28d'],
    [FEB_28_2024, { day: 29 }, [], UTC, '2024-03-28', '-1m'],
    [FEB_28_2024, { day: 30 }, [], UTC, '2024-03-29', '-1m -1d'],
    [FEB_28_2024, { day: 31 }, [], UTC, '2024-03-30', '-1m -2d'],
    [FEB_28_2024, { day: 32 }, [], UTC, '2024-03-31', '-1m -3d'],
    [FEB_28_2024, { day: 33 }, [], UTC, '2024-04-01', '-1m -4d'],
    [FEB_29_2024, { day: 28 }, [], UTC, '2024-03-28', '-28d'],
    [FEB_29_2024, { day: 29 }, [], UTC, '2024-03-29', '-1m'],
    [FEB_29_2024, { day: 30 }, [], UTC, '2024-03-30', '-1m -1d'],
    [FEB_29_2024, { day: 31 }, [], UTC, '2024-03-31', '-1m -2d'],
    [FEB_29_2024, { day: 32 }, [], UTC, '2024-04-01', '-1m -3d'],
    [FEB_29_2024, { day: 33 }, [], UTC, '2024-04-02', '-1m -4d'],

    // ROLLDOWNS

    [FEB_29_2024, { day: -400 }, ['year'], UTC, '2023-01-25', '1y'],

    [FEB_29_2024, { day: -400 }, ['year', 'month'], UTC, '2023-01-25', '1y 1m'],
    [FEB_29_2024, { day: -400 }, ['year', 'month', 'day'], UTC, '2023-01-25', '1y 1m 4d'],
    [FEB_29_2024, { day: -400 }, ['month'], UTC, '2023-01-25', '13m'],
    [FEB_29_2024, { day: -400 }, ['month', 'day'], UTC, '2023-01-25', '13m 4d'],
    [FEB_29_2024, { day: -400 }, ['day'], UTC, '2023-01-25', '400d'],

    [FEB_29_2024, { day: -33 }, ['year'], UTC, '2024-01-27', ''],
    [FEB_29_2024, { day: -33 }, ['year', 'month'], UTC, '2024-01-27', '1m'],
    [FEB_29_2024, { day: -33 }, ['year', 'month', 'day'], UTC, '2024-01-27', '1m 2d'],
    [FEB_29_2024, { day: -33 }, ['month'], UTC, '2024-01-27', '1m'],
    [FEB_29_2024, { day: -33 }, ['month', 'day'], UTC, '2024-01-27', '1m 2d'],
    [FEB_29_2024, { day: -33 }, ['day'], UTC, '2024-01-27', '33d'],
  ];

  const tempfmt = new TemporalFormatter();
  const cldrfmt = new CLDRFormatter();
  for (const [index, [epoch, added, fields, zone, expDate, expDiff]] of enumerate(cases)) {
    const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(zone || 'UTC');
    const cldr1 = gregorian(epoch, zone || 'UTC');
    const temp2 = temp1.add(periodToDurationLike(added));
    const cldr2 = cldr1.add(added);

    const msg = `case ${index}: ${cldrstr(cldr1)} ${zone} ${JSON.stringify(added)} fields ${JSON.stringify(fields)}`;

    const csince = cldr1.since(cldr2, { fields });

    expect(cldrstr(cldr2), msg).toEqual(tempstr(temp2));
    expect(cldr2.toDateString(), msg).toEqual(expDate);
    expect(cldrfmt.periodString(csince), msg).toEqual(expDiff);

    // Compare to Temporal result when no rollup fields are defined.
    if (fields.length === 0) {
      const tsince = temp1.since(temp2, { largestUnit: 'year', smallestUnit: 'millisecond' });
      expect(cldrfmt.periodString(csince), msg).toEqual(tempfmt.durationString(tsince));
    }
  }
});
