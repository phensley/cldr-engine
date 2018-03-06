# Design of cldr-engine

This document covers some aspects of the cldr-engine design.



## Field Encoding

This is a basic description of how cldr-engine encodes CLDR field data into resource packs for runtime use.

As an example we'll use the following snippet of the CLDR [`numbers.json`](https://github.com/unicode-cldr/cldr-numbers-modern/blob/master/main/en/numbers.json) file.
```json
{
  "main": {
    "en": {
      "numbers": {
        ...
        "minimumGroupingDigits": "1",
        "symbols-numberSystem-latn": {
          "decimal": ".",
          "group": ",",
          "percentSign": "%",
          "plusSign": "+",
          "minusSign": "-",
          "perMille": "‰",
          "infinity": "∞",
          "nan": "NaN"
        },
        "decimalFormats-numberSystem-latn": {
          "standard": "#,##0.###",
          "long": {
            "decimalFormat": {
              "1000-count-one": "0 thousand",
              "1000-count-other": "0 thousand",
              "10000-count-one": "00 thousand",
              "10000-count-other": "00 thousand",
              "100000-count-one": "000 thousand",
              "100000-count-other": "000 thousand",
              "1000000-count-one": "0 million",
              "1000000-count-other": "0 million",
              ...
```

We want to achieve a few goals:
 * Make the field values (e.g. `"#,##0.###"`) accessible at runtime.
 * Keep the schema structure but eliminate the overhead.
 * Minimize the overall size of the data we need to load at runtime.
 * Make accessing a field as fast as possible.

Solution

We create a simple data description language. This language will define both (1) the heirarchical structure of our data and (2) a deterministic traversal of all permutations of all fields.

For example, we define types with arbitrary names like "scope" and "field" that correspond to structure of our data tree. A special type "digits" defines a pluralized number pattern that changes based on the number of integer digits in the number.

```typescript
const NUMBERS: Scope = scope('numbers', [
  field('minimumGroupingDigits'),
  objectmap('symbols-numberSystem-latn', [
    'decimal',
    'group',
    'percentSign',
    'plusSign',
    'minusSign',
    'perMille',
    'infinity',
    'nan'
  ]),
  scope('decimalFormats-numberSystem-latn', [
    field('standard'),
    scope('long', [
      digits('decimalFormat')
    ]),
    scope('short', [
      digits('decimalFormat')
    ]),
    ...
  ])
]);
```

We then can write an intepreter for this "program" that when executed will traverse a JSON data file, visiting each field defined in our schema.

Executing this interpreter might return the following string, with each field separated by a TAB character:

```json
"1\t.\t,%\t+\t-\t‰\t∞\tNaN\t#,##0.###\t0 thousand\t0 thousand\t00 thousand\t00 thousand\t..."
```

The reducing in space is offset by the storage and complexity needed to create the mapping. This also impacts field lookup speed.

We have:
 1. Created a data description language.
 2. Described our particular data tree `numbers.json`.
 3. Created an interpreter which executes this "program" to visit all field values.
 4. Encoded the field values into a TAB-delimited string.

The schema has been eliminated and we have defined a traversal over all permutations of the `numbers.json` fields.

## Alternatives:

### Option 1: Use JSON directly.

Here we would load the JSON at runtime and traverse the heirarchy to access the values we need.

Problems:
1. There is too much data.
  * We can filter the tree to remove fields we don't use.
  * Ditch the JSON and generate JavaScript. This trades one problem for another, since you'll end up with large JavaScript files differing only by one or two characters, e.g. decimal point and grouping.
  * Rely on compression. Gzip can only do so much.

2. Accessing deep nodes is brittle.

There isn't a great solution to this in vanilla JavaScript. Frameworks end up using one of the following access schemes:

```javascript
cldr.get('main/' + language + '/numbers/symbols-numberSystem-latn/decimal');
```

Or the more efficient:

```javascript
cldr.get(['main', language, 'numbers', 'symbols-numberSystem-latn', 'decimal']);
```

Both of these have issues:
 * Traversing the heirarchy takes time.
 * Relies on string append / split operations during field access. Takes time and creates garbage.
 * Brittle. There is no safety from a typo in one of the arguments. Testing can mitigate this some but is a maintenance risk.

Some of the downside can be compensated for by memoizing and caching results.
