import { languageBundle } from '../../_helpers';
import { GeneralImpl, InternalsImpl, MeasurementCategory } from '../../../src';

const INTERNALS = new InternalsImpl();

const api = (tag: string) => {
  const bundle = languageBundle(tag);
  return new GeneralImpl(bundle, INTERNALS);
};

test('general', () => {
  // US
  expect(api('en').measurementSystem()).toEqual('us');
  expect(api('und-LR').measurementSystem()).toEqual('us');
  expect(api('und-MM').measurementSystem()).toEqual('us');
  expect(api('es-US').measurementSystem()).toEqual('us');

  // UK
  expect(api('und-GB').measurementSystem()).toEqual('uk');

  // Metric
  expect(api('und-001').measurementSystem()).toEqual('metric');
  expect(api('de').measurementSystem()).toEqual('metric');
});

test('temperature', () => {
  const c: MeasurementCategory = 'temperature';

  // US
  expect(api('und-BS').measurementSystem(c)).toEqual('us');
  expect(api('und-BZ').measurementSystem(c)).toEqual('us');
  expect(api('es-PR').measurementSystem(c)).toEqual('us');
  expect(api('en-PW').measurementSystem(c)).toEqual('us');

  // Metric
  expect(api('und-001').measurementSystem()).toEqual('metric');
  expect(api('de').measurementSystem()).toEqual('metric');
});
