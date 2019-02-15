import { lruSuite, mapSuite } from './lru';

const options = { async: false, delay: 0.5 };

lruSuite.run(options);
mapSuite.run(options);
