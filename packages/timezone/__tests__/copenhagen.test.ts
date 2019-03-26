import { roundtrip, Timestamp } from './_helpers';
import { TZ, ZoneInfo } from '../src';

const ID = 'Europe/Copenhagen';

const OCT272019_010000 = new Timestamp(1572138000000);
const DEC311889_230940 = new Timestamp(-2524524620000);

test('copenhagen min / max', () => {
  let info = TZ.fromUTC(ID, Timestamp.MIN.n);
  expect(info).toEqual({ abbr: 'LMT', dst: 0, offset: 3020000 });

  const t = DEC311889_230940;
  info = TZ.fromUTC(ID, t.n);
  expect(info).toEqual({ abbr: 'CMT', dst: 0, offset: 3020000 });

  info = TZ.fromUTC(ID, t.mins(-1).n);
  expect(info).toEqual({ abbr: 'LMT', dst: 0, offset: 3020000 });

  info = TZ.fromUTC(ID, Timestamp.MAX.n);
  expect(info).toEqual({ abbr: 'CET', dst: 0, offset: 3600000 });
});

test('copenhagen roundtrip', () => {
  const t = OCT272019_010000;
  roundtrip(ID, t.n);
  roundtrip(ID, t.mins(1).n);
  roundtrip(ID, t.mins(-1).n);
  roundtrip(ID, t.mins(-2).n);
});

test('copenhagen zones', () => {
  const t = OCT272019_010000;
  let info: ZoneInfo | undefined;

  info = TZ.fromUTC(ID, t.secs(-30).n);
  expect(info).toEqual({ abbr: 'CEST', dst: 1, offset: 7200000 });

  info = TZ.fromUTC(ID, t.n);
  expect(info).toEqual({ abbr: 'CET', dst: 0, offset: 3600000 });

  info = TZ.fromUTC(ID, t.secs(30).n);
  expect(info).toEqual({ abbr: 'CET', dst: 0, offset: 3600000 });
});
