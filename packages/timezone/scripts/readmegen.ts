import { TZ } from '../src';

{
  const id = TZ.resolveId('Pacific/Samoa');
  console.log(id);

  const ZONES = [
    'UTC',
    'Pacific/Samoa',
    'America/New_York',
    'Pacific/Pago_Pago',
    'Asia/Tokyo',
    'Europe/Paris'
  ];

  const now = new Date(2020, 2, 18, 12, 30, 0).getTime();
  for (const zoneid of ZONES) {
    const info = TZ.fromUTC(zoneid, now);
    console.log(`${zoneid.padEnd(18)} -> ${JSON.stringify(info)}`);
  }
}

{
  // Sun Mar  8 2020 02:10:00 AM NY time
  const local = 1583633400000;
  const zoneid = 'America/New_York';
  const [utc, info] = TZ.fromWall(zoneid, local)!;
  console.log(utc);
  console.log(JSON.stringify(info));
}
