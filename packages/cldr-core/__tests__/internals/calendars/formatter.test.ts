import { languageBundle, INTERNALS } from '../../_helpers';
import { StringValue } from '../../../src/utils/render';
import {
  CalendarFormatterImpl
} from '../../../src/internals/calendars/formatterimpl';
import { CalendarContext } from '../../../src/internals/calendars/formatter';
import { DecimalNumberingSystem, GregorianDate } from '../../../src';
import { ContextTransformInfo, NumberSymbols } from '../../../src/common/private';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SYMBOLS: NumberSymbols = {
  decimal: '.',
  group: ','
} as NumberSymbols;

test('calendar formatter', () => {
  const en = languageBundle('en');
  const internals = INTERNALS();
  const schema = internals.schema.Gregorian;
  const value = new StringValue();
  const impl = new CalendarFormatterImpl(internals, schema);
  const system = new DecimalNumberingSystem('latn', DIGITS, SYMBOLS, 1, 3, 3);

  let date: GregorianDate;

  date = GregorianDate.fromUnixEpoch(0, 'America/New_York', 1, 1);
  const ctx: CalendarContext<GregorianDate> = {
    alt: {},
    bundle: en,
    date,
    system,
    latnSystem: system,
    transform: {} as ContextTransformInfo
  };

  impl.format(value, ctx, [['M', 3]]);
  expect(value.render()).toEqual('Dec');

  // Unknown field
  impl.format(value, ctx, [['M', 3], ['R', 4], ' ', ['d', 2]]);
  expect(value.render()).toEqual('Dec 31');

  // Era widths
  impl.format(value, ctx, [['G', 4]]);
  expect(value.render()).toEqual('Anno Domini');

  impl.format(value, ctx, [['G', 5]]);
  expect(value.render()).toEqual('A');

  // Month standalone
  impl.format(value, ctx, [['L', 3]]);
  expect(value.render()).toEqual('Dec');

  // Weekday local
  impl.format(value, ctx, [['e', 3]]);
  expect(value.render()).toEqual('Wed');

  impl.format(value, ctx, [['e', 4]]);
  expect(value.render()).toEqual('Wednesday');

  // Weekday standalone
  impl.format(value, ctx, [['E', 3]]);
  expect(value.render()).toEqual('Wed');

  impl.format(value, ctx, [['E', 4]]);
  expect(value.render()).toEqual('Wednesday');

  // Timezone Z
  impl.format(value, ctx, [['Z', 5]]);
  expect(value.render()).toEqual('-05:00');

  impl.format(value, ctx, [['Z', 6]]);
  expect(value.render()).toEqual('');

  // Day period extended
  impl.format(value, ctx, [['b', 3]]);
  expect(value.render()).toEqual('PM');

  ctx.date = GregorianDate.fromUnixEpoch(0, 'Asia/Tokyo', 1, 1);
  impl.format(value, ctx, [['Z', 5]]);
  expect(value.render()).toEqual('+09:00');

  // Day period extended
  impl.format(value, ctx, [['b', 3]]);
  expect(value.render()).toEqual('AM');

  ctx.date = GregorianDate.fromUnixEpoch(120000, 'Asia/Tokyo', 1, 1);
  // Day period extended
  impl.format(value, ctx, [['b', 3]]);
  expect(value.render()).toEqual('AM');
});
