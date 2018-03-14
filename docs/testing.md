## Browser testing, stress test

The project transpiles to EcmaScript 5 which has good browser support, but no extensive browser testing has been done yet. There is an initial command line stress test; a similar test could be produced for browsers that exercises all functionality across all locales.

This test iterates over all available locales, constructs an engine for each (triggering a load of the corresponding resource pack) and then formats several numbers and dates with permutations of the formatting options.

Locales that share the same language (`af`, `af-NA`) will use the internal cached resource pack. Compressed resource packs are used so the load time includes decompression and JSON parse.

```bash
$ yarn stress

yarn run v1.5.1
$ lerna run --stream --concurrency=1 stress
lerna info version 2.9.0
@phensley/cldr: $ ts-node ./__stress__
@phensley/cldr: load 'af' locale: 4725.893 micros
@phensley/cldr: format 90 gregorian permutations: 2072.649 micros
@phensley/cldr: load 'af-NA' locale: 113.454 micros
@phensley/cldr: format 180 gregorian permutations: 517.318 micros
@phensley/cldr: load 'am' locale: 1760.075 micros
@phensley/cldr: format 270 gregorian permutations: 690.049 micros
@phensley/cldr: load 'ar' locale: 2490.053 micros
@phensley/cldr: format 360 gregorian permutations: 596.304 micros
.. snip ..
```
