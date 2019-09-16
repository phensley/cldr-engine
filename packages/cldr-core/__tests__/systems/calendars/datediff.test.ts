// import { BuddhistDate, GregorianDate, ISO8601Date, JapaneseDate, PersianDate } from '../../../src/systems/calendars';
// import { DayOfWeek } from '../../../src/systems/calendars/fields';

import { GregorianDate } from '../../../src/systems/calendars';

const NEW_YORK = 'America/New_York';
// const LOS_ANGELES = 'America/Los_Angeles';
// const LONDON = 'Europe/London';

// Sat March 11, 2000 8:00:25 AM UTC
const BASE = 952761625000;

const DAY = 86400 * 1000;

// const buddhist = (e: number, z: string) => BuddhistDate.fromUnixEpoch(e, z, 1, 1);
const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);
// const iso8601 = (e: number, z: string) => ISO8601Date.fromUnixEpoch(e, z, 1, 1);
// const japanese = (e: number, z: string) => JapaneseDate.fromUnixEpoch(e, z, 1, 1);
// const persian = (e: number, z: string) => PersianDate.fromUnixEpoch(e, z, 1, 1);

test('basic diff', () => {
  const start = gregorian(BASE, NEW_YORK);
  const end = gregorian(BASE + (DAY * 369), NEW_YORK);
  console.log(start.difference(end));
});
