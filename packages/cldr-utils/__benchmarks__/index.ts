import { fnv1aSuite } from './fnv1a';
import { lruSuite, mapSuite } from './lru';

const options = { async: false, delay: 0.5 };

fnv1aSuite.run(options);
lruSuite.run(options);
mapSuite.run(options);
