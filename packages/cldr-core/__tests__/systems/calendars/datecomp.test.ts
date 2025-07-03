import { CalendarDate, GregorianDate } from '../../../src';
import { MAR_11_2000, NEW_YORK } from './_referencedates';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

test('comparison', () => {
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, NEW_YORK);

  end = start.add({ year: 1 });
  expect(start.compare(end)).toEqual(-1);

  end = start.add({ millis: 1 });
  expect(start.compare(end)).toEqual(-1);

  end = start.add({});
  expect(start.compare(end)).toEqual(0);

  end = start.add({ year: 0, millis: 0 });
  expect(start.compare(end)).toEqual(0);

  end = start.add({ millis: -1 });
  expect(start.compare(end)).toEqual(1);

  end = start.add({ year: -1 });
  expect(start.compare(end)).toEqual(1);
});
