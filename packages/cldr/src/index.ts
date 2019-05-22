export * from './exports';

// Wire up the default configuration
import { CLDRFramework } from '@phensley/cldr-core';
import { config } from './config';

CLDRFramework.setDefaultConfig(config);
