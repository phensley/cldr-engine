import { calendarsApi } from '../../_helpers';
import { Quantity } from '../../../src';

test('time period to quantity', () => {
  let q: Quantity[];

  const api = calendarsApi('en');

  q = api.timePeriodToQuantity({ year: 3, month: 5, day: 27.5 });
  expect(q).toEqual([
    { unit: 'year', value: 3 },
    { unit: 'month', value: 5 },
    { unit: 'day', value: 27.5 }
  ]);

  q = api.timePeriodToQuantity({ minute: 75, hour: 12.5, year: 4.2 });
  expect(q).toEqual([
    { unit: 'year', value: 4.2 },
    { unit: 'hour', value: 12.5 },
    { unit: 'minute', value: 75 }
  ]);

  q = api.timePeriodToQuantity({ millis: 125, month: 7 });
  expect(q).toEqual([
    { unit: 'month', value: 7 },
    { unit: 'millisecond', value: 125 }
  ]);
});
