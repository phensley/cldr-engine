import { languageBundle } from '../../_helpers/bundle';
import { buildSchema } from '../../../src/schema';
import { GregorianEngine, GregorianInternal } from '../../../src/engine/gregorian';
import { ZonedDateTime } from '../../../src/types/datetime';

const EN = languageBundle('en');
const EN_GB = languageBundle('en-GB');
const ES = languageBundle('es');
const ES_419 = languageBundle('es-419');
const FR = languageBundle('fr');
const LT = languageBundle('lt');
const SR = languageBundle('sr');
const ZH = languageBundle('zh');

const INTERNAL = new GregorianInternal(buildSchema());

const LOS_ANGELES = 'America/Los_Angeles';
const MARCH_11_2018 = new ZonedDateTime(1520751625000, LOS_ANGELES);
const MARCH_14_2018 = new ZonedDateTime(1520751625000 + (86400000 * 3), LOS_ANGELES);

test('basics', () => {
  let formatter = new GregorianEngine(INTERNAL, EN);
  let s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('Saturday, March 10, 2018');

  s = formatter.formatInterval(MARCH_11_2018, MARCH_14_2018, 'yMMMd');
  expect(s).toEqual('Mar 10 – 14, 2018');

  formatter = new GregorianEngine(INTERNAL, EN_GB);
  s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('Saturday, 10 March 2018');

  s = formatter.formatInterval(MARCH_11_2018, MARCH_14_2018, 'yMMMd');
  expect(s).toEqual('10–14 Mar 2018');

  formatter = new GregorianEngine(INTERNAL, ES);
  s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('sábado, 10 de marzo de 2018');

  formatter = new GregorianEngine(INTERNAL, ES_419);
  s = formatter.format(MARCH_11_2018, { date: 'medium' });
  expect(s).toEqual('10 mar. 2018');

  formatter = new GregorianEngine(INTERNAL, FR);
  s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('samedi 10 mars 2018');

  formatter = new GregorianEngine(INTERNAL, LT);
  s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('2018 m. kovo 10 d., šeštadienis');

  formatter = new GregorianEngine(INTERNAL, SR);
  s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('субота, 10. март 2018.');

  formatter = new GregorianEngine(INTERNAL, ZH);
  s = formatter.format(MARCH_11_2018, { date: 'full' });
  expect(s).toEqual('2018年3月10日星期六');
});
