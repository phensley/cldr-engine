# Locales

## Parsing and resolving locales

Parsing a locale identifier / language tag will substitute aliases and fill in add likely subtags, filling in any undefined subtags.

```typescript
import { parseLocale } from '@phensley/cldr';

const { id, tag } = parseLocale('es_419');

// The original string you parsed in is stored on the "id" property
id
// > "es_419"

// The resolved lanugage tag is stored on the "tag" property.
tag.language();
// > "es"

tag.region();
// > "419"

// The "add likely subtags" process filled in the script
tag.script();
// > "Latn"

tag.toString();
// > "es-Latn-419"
```

## Enhanced Language Matching

To perform a language match [based on distance](https://www.unicode.org/reports/tr35/tr35.html#EnhancedLanguageMatching), you can construct a `LanguageMatcher` with the list of your application's supported locales.

The list of supported locale identifiers should be sorted from most- to least-supported. In the example below French is most supported, followed by US English with Spanish last. If no match is sufficiently "close" to one of these, within a given threshold, the first locale in the list is returned.

```typescript
import { LocaleMatcher } from '@phensley/cldr';

const matcher = new LocaleMatcher('fr, en, en-GB, es-419, es-MX, es');
const match = matcher.match('en-NZ');

match.distance
// > 3

const { id, tag } = match.locale;

id;
// > "en-GB"

tag.toString();
// > "en-Latn-GB"

matcher.match('es').locale.id;
// > "es"

matcher.match('es-AR').locale.id;
// > "es-419"
```
