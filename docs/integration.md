# Integration

Key goals for this project are ease-of-use and "batteries included". Adding `@phensley/cldr` to your project shouldn't involve too many steps, or require developers to have low-level knowledge about the CLDR, or know in advance which particular modules or formats they will use in their application.

## Installing

Add [@phensley/cldr](https://www.npmjs.com/package/@phensley/cldr) as a dependency. This will download the library and extract the resource packs.

```bash
npm install --save @phensley/cldr

# or

yarn add @phensley/cldr
```

## Language resource packs

The resource packs contain all data for **all regions and scripts of a given language**. There is a high degree of overlap between regions so the resource pack bundles everything together with an internal layered structure, so regions can inherit from a base region.

For example, if your user picks English and then switches between regions (e.g. `en-US` and `en-CA`)  the `"en.json"` resource pack is only loaded once. All English region bundles are constructed from this single pack. Similarly if someone picks Chinese and switches between the Hant and Hans scripts, all are fulfilled from the `"zh.json"` resource pack.

The resource packs will need to be placed somewhere your application can load them at runtime. You'll also need to implement a loader function that will map a language identifier (`"en"`, `"es"`, etc) to the resource pack data.

```bash
% ls node_modules/@phensley/cldr/packs
af.json     cy.json     fil.json     hy.json     ky.json     nb.json     sl.json     uk.json
af.json.gz  cy.json.gz  fil.json.gz  hy.json.gz  ky.json.gz  nb.json.gz  sl.json.gz  uk.json.gz
am.json     da.json     fo.json      id.json     lo.json     ne.json     sq.json     ur.json
am.json.gz  da.json.gz  fo.json.gz   id.json.gz  lo.json.gz  ne.json.gz  sq.json.gz  ur.json.gz
ar.json     de.json     fr.json      is.json     lt.json     nl.json     sr.json     uz.json
ar.json.gz  de.json.gz  fr.json.gz   is.json.gz  lt.json.gz  nl.json.gz  sr.json.gz  uz.json.gz
az.json     el.json     ga.json      it.json     lv.json     pa.json     sv.json     vi.json
az.json.gz  el.json.gz  ga.json.gz   it.json.gz  lv.json.gz  pa.json.gz  sv.json.gz  vi.json.gz
be.json     en.json     gl.json      ja.json     mk.json     pl.json     sw.json     yue.json
be.json.gz  en.json.gz  gl.json.gz   ja.json.gz  mk.json.gz  pl.json.gz  sw.json.gz  yue.json.gz
bg.json     es.json     gu.json      ka.json     ml.json     pt.json     ta.json     zh.json
bg.json.gz  es.json.gz  gu.json.gz   ka.json.gz  ml.json.gz  pt.json.gz  ta.json.gz  zh.json.gz
bn.json     et.json     he.json      kk.json     mn.json     ro.json     te.json     zu.json
bn.json.gz  et.json.gz  he.json.gz   kk.json.gz  mn.json.gz  ro.json.gz  te.json.gz  zu.json.gz
bs.json     eu.json     hi.json      km.json     mr.json     ru.json     th.json
bs.json.gz  eu.json.gz  hi.json.gz   km.json.gz  mr.json.gz  ru.json.gz  th.json.gz
ca.json     fa.json     hr.json      kn.json     ms.json     si.json     to.json
ca.json.gz  fa.json.gz  hr.json.gz   kn.json.gz  ms.json.gz  si.json.gz  to.json.gz
cs.json     fi.json     hu.json      ko.json     my.json     sk.json     tr.json
cs.json.gz  fi.json.gz  hu.json.gz   ko.json.gz  my.json.gz  sk.json.gz  tr.json.gz
```

Adding all world regions doesn't add much to the size of the compressed resource pack. Once loaded a user can freely switch scripts and regions without hitting the network:

```bash
% du -sh node_modules/@phensley/cldr/packs/en.json.gz
24K	node_modules/@phensley/cldr/packs/en.json.gz

% gunzip -c packages/cldr/packs/en.json.gz | fold -w 80
{"version":"0.2.2","cldr":"32.0.1","language":"en","scripts":{"Latn":{"strings":
".\tE\t,\t∞\t;\t-\tNaN\t‰\t%\t+\t×\t:\t1\t¤#,##0.00\t¤#,##0.00;(¤#,##0.00)\t\t\t
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t¤0K\t\t¤0K\t\t\t\t¤00K\t\t¤00K\t\t\t\t¤000K\t\t¤
000K\t\t\t\t¤0M\t\t¤0M\t\t\t\t¤00M\t\t¤00M\t\t\t\t¤000M\t\t¤000M\t\t\t\t¤0B\t\t¤
0B\t\t\t\t¤00B\t\t¤00B\t\t\t\t¤000B\t\t¤000B\t\t\t\t¤0T\t\t¤0T\t\t\t\t¤00T\t\t¤0
0T\t\t\t\t¤000T\t\t¤000T\t\t\t\t0\t0\t0\t3\t3\t3\t6\t6\t6\t9\t9\t9\t12\t12\t12\t
[:^S:]\t[:digit:]\t \t[:^S:]\t[:digit:]\t \t{0} {1}\t\t{0} {1}\t\t\t\t#,##0.###\
t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t0K\t\t0K\t\t\t\t00K\t\t00K\t\t\t\t000K\t\t0
00K\t\t\t\t0M\t\t0M\t\t\t\t00M\t\t00M\t\t\t\t000M\t\t000M\t\t\t\t0B\t\t0B\t\t\t\
t00B\t\t00B\t\t\t\t000B\t\t000B\t\t\t\t0T\t\t0T\t\t\t\t00T\t\t00T\t\t\t\t000T\t\
.. snip ..
```
You can choose to copy the GZIP-compressed or uncompressed resource packs, depending on how your application is served at runtime, and whether your web server already does on-the-fly compression of JSON files.

## Important note

**Resource packs are tied to the exact version of the `@phensley/cldr` you are using and must be kept in sync.** If a resouce pack from a different version is used, the string offsets may not align and you may see randomness.

The resource packs are considered to be an inseparable part of the library. When you upgrade the library you must also copy the resource packs from that version and ensure they are loaded correctly (busting caches, etc).
Otherwise all bets are off and things may break in unexpected ways.

## Initialization

In order to use `@phensley/cldr` you'll need to create a global instance of the `CLDR` class.

There are currently two loaders: synchronous and asynchronous. The async loader returns a Promise that will provide the resource pack data. The actual reading of the resource pack data is up to your application, so they can be placed in the filesystem, webserver, embedded into a JavaScript variable, etc.

#### Initialization options


 * `loader` points to a function that returns resource pack data synchronously.
 * `asyncLoader` pointers to a function that returns a `Promise<any>` that resolves with resource pack data.
 * `packCacheSize` controls the number of resource packs that will be cached in an LRU cache.
 * `patternCacheSize` controls the number of parsed patterns that will be cached in an LRU per engine instance.

The library has a least-recently-used (LRU) implementation for caching resource packs and parsed patterns. It is used to cache objects that may be reused multiple times.

The `packCacheSize` determines the size of the LRU cache holding language packs in memory. This size can be increased if you need to have multiple languages loaded simultaneously.

The `patternCacheSize` is a single setting but controls the maximum size of the LRU caches for parsed patterns, e.g. numbers, dates, wrappers. Since the raw pattern string is used as the cache key, the  caches are framework-wide. For example, even if the number pattern `"0,###.###"` is used by two different languages the parsed representation will be cached once.

#### Initialization example

Below is an example of embedding English into a web application statically. The `en.json` resource is loaded into the framework synchronously while all other languages will be loaded asynchronously.

Note that the SHA-256 digest is read from the `resource.json` and embedded into the URLs. This presumes a build script has copied the resource files and embedded the same version into their filenames.

See https://github.com/phensley/cldr-engine-react-demo for a demonstration.

`cldr.ts`:
```typescript
import wretch from 'wretch';
import { CLDR, CLDROptions } from '@phensley/cldr';

// Import the resource file containing information about the resource packs
import Resource from '@phensley/cldr/packs/resource.json';

// Copy the sha256 hash of all of the packages, to use for cache busting.
// Note: Resource files are be copied by the build process with the
// matching version in the path.
const version = Resource.sha256.substring(0, 10);

// Import default language English directly
import EnglishPack from '@phensley/cldr/packs/en.json';

// Load English synchronously (see below)
const loader = (language: string): any => EnglishPack;

// All other languages are loaded asynchronously at runtime
const asyncLoader = (language: string): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    wretch(`${process.env.PUBLIC_URL}/packs/${language}-${version}.json`)
      .get()
      .json(resolve)
      .catch(reject);
  });
};

const options: CLDROptions = {

  // Sync blocking loader function
  loader,

  // Promise-based loader function
  asyncLoader,

  // Keep up to 8 languages loaded at a time.
  packCacheSize: 8,

  // Patterns are parsed and cached on demand. This will keep up to
  // 50 patterns in cache with least-recently-used eviction.
  patternCacheSize: 50
};

// Global instance of cldr configured for our app
export const cldr = new CLDR(options);

// Default cldr engine to be set in the locale store.
export const English = cldr.get('en');
```

If you're using Redux you might want to place the current language and `Engine` instance into the store. Any components using this store will update when the language changes.

Below is an example showing the use of Redux Sagas to asynchronously switch languages by firing the `locale/change` action.

```typescript
import { call, put, takeEvery } from 'redux-saga/effects';
import { Action } from '../actions';
import { cldr } from '../locale';

const getLanguage = (language: string) => cldr.getAsync(language);

export function* changeLocale(action: Action<string>): IterableIterator<any> {
  const language = action.payload;
  try {
    const request = yield call(getLanguage, language);
    yield put({ type: 'locale/updateEngine', payload: request });
  } catch (e) {
    yield put({ type: 'locale/invalidLanguage', language });
  }
}

export function* localeSaga(): IterableIterator<any> {
  yield takeEvery('locale/change', changeLocale);
}
```
