import { EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { GregorianEngine, GregorianInternal, WrapperInternal } from '../../../src/engine';
import { ZonedDateTime } from '../../../src/types/datetime';

const SCHEMA = buildSchema();
const INTERNAL = new GregorianInternal(SCHEMA, new WrapperInternal());

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

test('quarter', () => {
  // TODO:
  // let e = new GregorianEngine(INTERNAL, EN);
  // let s: string;

  // s = e.getQuarter('1');
  // expect(s).toEqual('1st quarter');

  // e = new GregorianEngine(INTERNAL, DE);

  // s = e.getQuarter('1');
  // expect(s).toEqual('1. Quartal');
});

test('day period', () => {
  // TODO:
  // let e = new GregorianEngine(INTERNAL, EN);
  // let s: string;

  // s = e.getDayPeriod('midnight');
  // expect(s).toEqual('midnight');

  // e = new GregorianEngine(INTERNAL, DE);
  // s = e.getDayPeriod('noon');
  // expect(s).toEqual('');
});
