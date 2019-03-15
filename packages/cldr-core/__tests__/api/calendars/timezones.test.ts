import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  InternalsImpl,
  PrivateApiImpl,
} from '../../../src';

const INTERNALS = new InternalsImpl();

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

const EN = calendarsApi('en-US');

test('timezone identifiers', () => {
  const ids = EN.timeZoneIds();
  expect(ids).toContain('America/New_York');
  expect(ids).toContain('Europe/Rome');
  expect(ids).toContain('Pacific/Wallis');
});
