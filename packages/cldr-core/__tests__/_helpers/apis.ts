import { config as defaultconfig } from '../../../cldr/src/config';

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

import { VERSION as _VERSION } from '../../src/utils/version';

export const VERSION = _VERSION;

export const buildConfig = (cfg: any) => ({ ...defaultconfig, ...cfg } as SchemaConfig);

export const INTERNALS = () => new InternalsImpl(defaultconfig as SchemaConfig, VERSION);

export const privateApi = (bundle: Bundle, config?: SchemaConfig) =>
  new PrivateApiImpl(bundle, new InternalsImpl(config || defaultconfig, VERSION));

export const calendarsApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  const _private = new PrivateApiImpl(bundle, internals);
  return new CalendarsImpl(bundle, internals, _private);
};

export const generalApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  return new GeneralImpl(bundle, Locale.resolve(tag), internals, privateApi(bundle, config));
};

export const numbersApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  return new NumbersImpl(bundle, internals.numbers, privateApi(bundle, config));
};

export const unitsApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  return new UnitsImpl(bundle, internals, new PrivateApiImpl(bundle, internals));
};
