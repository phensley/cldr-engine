const config = require('../../../cldr/src/config.json');

import { SchemaConfig } from '@phensley/cldr-schema';
import { languageBundle } from './bundle';
import {
  Bundle,
  CalendarsImpl,
  GeneralImpl,
  InternalsImpl,
  Locale,
  NumbersImpl,
  PrivateApiImpl,
  UnitsImpl,
} from '../../src';

export const INTERNALS = new InternalsImpl(config as SchemaConfig);

export const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);

export const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

export const generalApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new GeneralImpl(bundle, Locale.resolve(tag), INTERNALS);
};

export const numbersApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new NumbersImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));
};

export const unitsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new UnitsImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));
};
