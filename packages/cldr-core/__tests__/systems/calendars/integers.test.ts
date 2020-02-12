import { GregorianDate, TimePeriodField } from '../../../src/systems/calendars';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const FIELDS: TimePeriodField[] = [
  'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millis'
];

test('date field integers', () => {
  const date: GregorianDate = gregorian(0, 'UTC');
  let u: number;

  // Ensure math operations result in integer calendar fields
  const nums = [0.1, 0.11111, 0.2, 0.3, 0.5, 0.7, 1, 1.1, 1.3333333];
  for (const n of nums) {
    for (const f of FIELDS) {
      u = date.add({ [f]: n }).unixEpoch();
      expect(Math.floor(u)).toEqual(u);

      u = date.subtract({ [f]: n }).unixEpoch();
      expect(Math.floor(u)).toEqual(u);
    }
  }
});
