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

export const buildConfig = (cfg: any) => ({ ...defaultconfig, ...cfg } as SchemaConfig);

export const INTERNALS = () => new InternalsImpl(defaultconfig as SchemaConfig);

export const privateApi = (bundle: Bundle, config?: SchemaConfig) =>
  new PrivateApiImpl(bundle, new InternalsImpl(config || defaultconfig));

export const calendarsApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig);
  const _private = new PrivateApiImpl(bundle, internals);
  return new CalendarsImpl(bundle, internals, _private);
};

export const generalApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig);
  return new GeneralImpl(bundle, Locale.resolve(tag), internals);
};

export const numbersApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig);
  return new NumbersImpl(bundle, internals, new PrivateApiImpl(bundle, internals));
};

export const unitsApi = (tag: string, config?: SchemaConfig) => {
  const bundle = languageBundle(tag, config);
  const internals = new InternalsImpl(config || defaultconfig);
  return new UnitsImpl(bundle, internals, new PrivateApiImpl(bundle, internals));
};
