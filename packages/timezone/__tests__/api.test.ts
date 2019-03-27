import { Timestamp } from './_helpers';
import { TZ, ZoneInfo } from '../src';

const OCT272019_010000 = new Timestamp(1572138000000);

test('invalid zone ids', () => {
  const t = OCT272019_010000;
  let info: ZoneInfo | undefined;

  info = TZ.fromUTC('RANDOM', t.n);
  expect(info).toEqual(undefined);
});

test('resolve id', () => {
  let alias: string | undefined;

  alias = TZ.resolveId('RANDOM');
  expect(alias).toEqual(undefined);

  alias = TZ.resolveId('Pacific/Samoa');
  expect(alias).toEqual('Pacific/Pago_Pago');
});

test('aliases', () => {
  const t = OCT272019_010000;
  let info: ZoneInfo | undefined;

  info = TZ.fromUTC('Africa/Addis_Ababa', t.n)!;
  expect(info.zoneid).toEqual('Africa/Nairobi');

  info = TZ.fromUTC('Pacific/Samoa', t.n)!;
  expect(info.zoneid).toEqual('Pacific/Pago_Pago');
});

test('utc zone', () => {
  expect(TZ.utcZone()).toEqual({ zoneid: 'Etc/UTC', abbr: 'UTC', dst: 0, offset: 0 });
});

test('zone ids', () => {
  const ids = TZ.zoneIds();

  expect(ids).toContainEqual('America/New_York');
  expect(ids).toContainEqual('Etc/UTC');

  // aliases will not appear in list of zone ids
  expect(ids).not.toContainEqual('Pacitic/Samoa');
  expect(ids).not.toContainEqual('UTC');
});

test('all zones', () => {
  const ids = TZ.zoneIds();
  for (const id of ids) {
    const info = TZ.fromUTC(id, OCT272019_010000.n);
    expect(info).toBeDefined();
  }
});