import { languageBundle } from '../../_helpers';

import {
  Bundle,
  Decimal,
  InternalsImpl,
  NumberInternalsImpl,
  PrivateApiImpl
} from '../../../src';

const INTERNALS = new InternalsImpl();

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const numbersImpl = (lang: string) => new NumberInternalsImpl(INTERNALS, 5);

test('number renderer', () => {
  const en = languageBundle('en');
  const priv = privateApi(en);
  const impl = numbersImpl('en');

  const renderer = impl.stringRenderer(priv.getNumberParams('latn'));
  const raw = '+#0.0#;-#0.0#';
  const pattern = impl.getNumberPattern(raw, false);
  const s = renderer.render(new Decimal('12345.6789'), pattern, '', '', '.', 1, false);
  expect(s).toEqual('+12345.6789');
});
