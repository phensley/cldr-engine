import { lruSuite, mapSuite } from './lru';
import { vuintSuite } from './vuint';

const options = { async: false, delay: 0.5 };

lruSuite.run(options);
mapSuite.run(options);
vuintSuite.run(options);
