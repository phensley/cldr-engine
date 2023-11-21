import { config as defaultconfig } from '../../../cldr/src/config';

import { languageBundle } from './bundle';
import {
  Bundle,
  CalendarsImpl,
  GeneralImpl,
  InternalsImpl,
  LocaleResolver,
  NumbersImpl,
  PrivateApiImpl,
  SchemaConfig,
  UnitsImpl,
} from '../../src';

import { VERSION as _VERSION } from '../../src/utils/version';

export const VERSION = _VERSION;

export const buildConfig = (cfg: SchemaConfig): SchemaConfig => ({ ...defaultconfig, ...cfg }) as SchemaConfig;

export const INTERNALS = (): InternalsImpl => new InternalsImpl(defaultconfig as SchemaConfig, VERSION);

export const privateApi = (bundle: Bundle, config?: SchemaConfig): PrivateApiImpl =>
  new PrivateApiImpl(bundle, new InternalsImpl(config || defaultconfig, VERSION));

export const calendarsApi = (tag: string, config?: SchemaConfig): CalendarsImpl => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  const _private = new PrivateApiImpl(bundle, internals);
  return new CalendarsImpl(bundle, internals, _private);
};

export const generalApi = (tag: string, config?: SchemaConfig): GeneralImpl => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  return new GeneralImpl(bundle, LocaleResolver.resolve(tag), internals, privateApi(bundle, config));
};

export const numbersApi = (tag: string, config?: SchemaConfig): NumbersImpl => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  return new NumbersImpl(bundle, internals.numbers, internals.general, privateApi(bundle, config));
};

export const unitsApi = (tag: string, config?: SchemaConfig): UnitsImpl => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig, VERSION);
  return new UnitsImpl(bundle, internals, new PrivateApiImpl(bundle, internals));
};
