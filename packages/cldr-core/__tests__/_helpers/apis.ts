const defaultconfig = require('../../../cldr/src/config.json');

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

export const buildConfig = (cfg: any) => ({ ...defaultconfig, ...cfg } as SchemaConfig);

export const INTERNALS = new InternalsImpl(defaultconfig as SchemaConfig);

export const privateApi = (bundle: Bundle, config: SchemaConfig = defaultconfig) =>
  new PrivateApiImpl(bundle, new InternalsImpl(config));

export const calendarsApi = (tag: string, config: SchemaConfig = defaultconfig) => {
  const bundle = languageBundle(tag);
  const internals = new InternalsImpl(config);
  return new CalendarsImpl(bundle, internals, privateApi(bundle));
};

export const generalApi = (tag: string, config: SchemaConfig = defaultconfig) => {
  const bundle = languageBundle(tag);
  const internals = new InternalsImpl(config);
  return new GeneralImpl(bundle, Locale.resolve(tag), internals);
};

export const numbersApi = (tag: string, config: SchemaConfig = defaultconfig) => {
  const bundle = languageBundle(tag);
  const internals = new InternalsImpl(config);
  return new NumbersImpl(bundle, internals, new PrivateApiImpl(bundle, internals));
};

export const unitsApi = (tag: string, config: SchemaConfig = defaultconfig) => {
  const bundle = languageBundle(tag);
  const internals = new InternalsImpl(config);
  return new UnitsImpl(bundle, internals, new PrivateApiImpl(bundle, internals));
};
