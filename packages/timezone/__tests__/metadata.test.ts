import { TZ, ZoneMeta } from '../src';

test('standard offset', () => {
  let r: ZoneMeta | undefined;

  r = TZ.zoneMeta('Europe/London')!;
  expect(r.zoneid).toEqual('Europe/London');
  expect(r.stdoffset).toEqual(0);
  expect(r.latitude).toEqual(51.508333);
  expect(r.longitude).toEqual(-0.125278);
  expect(r.countries).toEqual(['GB', 'GG', 'IM', 'JE']);

  r = TZ.zoneMeta('America/New_York')!;
  expect(r.zoneid).toEqual('America/New_York');
  expect(r.stdoffset).toEqual(-18000000);
  expect(r.latitude).toEqual(40.714167);
  expect(r.longitude).toEqual(-74.006389);
  expect(r.countries).toEqual(['US']);

  r = TZ.zoneMeta('Australia/Melbourne')!;
  expect(r.zoneid).toEqual('Australia/Melbourne');
  expect(r.stdoffset).toEqual(36000000);
  expect(r.latitude).toEqual(-37.816667);
  expect(r.longitude).toEqual(144.966667);
  expect(r.countries).toEqual(['AU']);

  r = TZ.zoneMeta('Africa/Bamako')!;
  expect(r.zoneid).toEqual('Africa/Abidjan');
  expect(r.stdoffset).toEqual(0);
  expect(r.latitude).toEqual(5.316667);
  expect(r.longitude).toEqual(-4.033333);
  expect(r.countries).toEqual(['CI', 'BF', 'GH', 'GM', 'GN', 'IS', 'ML', 'MR', 'SH', 'SL', 'SN', 'TG']);

  r = TZ.zoneMeta('CET')!;
  expect(r.zoneid).toEqual('Europe/Brussels');
  expect(r.stdoffset).toEqual(3600000);
  expect(r.latitude).toEqual(50.833333);
  expect(r.longitude).toEqual(4.333333);
  expect(r.countries).toEqual(['BE', 'LU', 'NL']);

  r = TZ.zoneMeta('FOO');
  expect(r).toEqual(undefined);
});
