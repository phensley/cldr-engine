import { config as defaultconfig } from '../../../cldr/src/config';
import { CalendarType, InternalsImpl, SchemaConfig } from '../../src';
import { languageBundle } from '../_helpers';

test('skip checksum', () => {
  const internals = new InternalsImpl({} as SchemaConfig, '1.0', false, true);
  expect(internals.checksum).toEqual('');
});

test('calendar lookup', () => {
  const internals = new InternalsImpl(defaultconfig, '1.0', false, true);
  const formatter = internals.calendars.getCalendarFormatter('x' as CalendarType);
  console.log(formatter);
});

test('select calendar', () => {
  const bundle = languageBundle('und-TH');
  console.log(bundle.languageRegion());
  const internals = new InternalsImpl(defaultconfig, '1.0', false, true);
  const cal = internals.calendars.selectCalendar(bundle);
  expect(cal).toEqual('buddhist');
});
