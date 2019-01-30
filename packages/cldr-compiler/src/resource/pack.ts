import { encoding, LanguageResolver, LanguageTag, Locale } from '@phensley/cldr-core';
import { getOther } from '../cldr';

// Index default content for each language and language+script combination.
const defaultContent = new Set();

getOther().DefaultContent.forEach((s: string) => {
  const { id, tag } = Locale.resolve(s);
  defaultContent.add(tag.expanded());
});

const { vuintEncode, z85Encode } = encoding;

// TAB delimiter selected as it is (a) a single character, (b) does not occur in
// the CLDR JSON data, (c) is safe to encode in JSON, (d) separates strings
// nicely when viewing the packed string array in a text editor / console.
const DELIMITER = '\\t';

class Layer {

  readonly localeId: string;
  readonly strings: string[] = [];
  readonly index: number[] = [];

  constructor(
    readonly tag: LanguageTag, readonly isDefault: boolean) {
      this.localeId = tag.expanded();
    }
}

const RE_QUOTE = /"/g;

/**
 * Join an array of strings together, escape double quotes, and UTF-8
 * encode the result.
 */
const join = (strings: string[]): string => strings.join(DELIMITER).replace(RE_QUOTE, '\"');

/**
 * Builds a resource pack containing all strings across all regions for a
 * given language.
 *
 * The resulting format attempts to balance compactness with efficiency of
 * the decoding and string lookup at runtime.
 */
export class ResourcePack {

  // Layers are grouped by script
  private layers: { [x: string]: Layer[] } = {};
  private current!: Layer;
  private defaultLayer?: LanguageTag;

  constructor(
    private language: string,
    private version: string,
    private cldrVersion: string
  ) {}

  /**
   * Push a new language layer.
   */
  push(locale: Locale): void {
    const { id, tag } = locale;
    const script = tag.script();
    let layers = this.layers[script];
    if (layers === undefined) {
      layers = [];
      this.layers[script] = layers;
    }

    // Determine the default region / script
    const minimumTag = LanguageResolver.removeLikelySubtags(tag);

    // Determine default layer for this language
    if (minimumTag.compact() === minimumTag.language()) {
      this.defaultLayer = tag;
    }

    const layerIsDefault = defaultContent.has(tag.expanded());
    const layer = new Layer(tag, layerIsDefault);
    this.current = layer;
    layers.push(layer);
  }

  /**
   * Add a (possibly undefined) field value to the current layer.
   */
  add(raw: string | undefined): number {
    const value = typeof raw === 'string' ? raw : '';

    /* istanbul ignore if */
    if (value.indexOf(DELIMITER) !== -1) {
      const id = this.current.localeId;
      throw new Error(`Resource pack delimiter character found in ${id} string "${value}"`);
    }
    const strings = this.current.strings;
    const offset = strings.length;
    strings.push(value);
    return offset;
  }

  render(): string {
    const scripts: string[] = [];
    Object.keys(this.layers).forEach(script => {
      const json = this.renderScript(script);
      scripts.push(`"${script}":${json}`);
    });

    if (this.defaultLayer === undefined) {
      throw new Error(`No default layer found for ${this.language}!`);
    }

    return `{"version":"${this.version}",` +
      `"cldr":"${this.cldrVersion}",` +
      `"language":"${this.language}",` +
      `"default":"${this.defaultLayer}",` +
      `"scripts":{${scripts.join(',')}}}`;
  }

  /**
   * Render the pack to JSON.
   */
  private renderScript(script: string): string {
    const layers = this.layers[script];

    /* istanbul ignore if */
    if (layers === undefined) {
      throw new Error(`Attempt to render a non-existent script layer: ${script}`);
    }
    const len = layers.length;

    /* istanbul ignore if */
    if (len === 0) {
      throw new Error('Attempt to render an empty pack');
    }

    // Select the base layer with the lowest distance to all regions in this
    // pack. For English this ends up being 'en-001'.
    const base = this.selectBaseLayer(layers);

    // Maintain an array of strings that differ from the base layer.
    const exceptions: string[] = [];

    // Keep a mapping of offsets to strings in the exceptions array.
    const index: { [x: string]: number } = {};

    // Iterate over each layer, computing its exception index.
    for (let i = 0; i < layers.length; i++) {
      const curr = layers[i];

      // Iterate over all strings for the current layer.
      for (let j = 0; j < curr.strings.length; j++) {
        const str = curr.strings[j];

        // If the string matches the base layer, continue.
        if (str === base.strings[j]) {
          continue;
        }

        // Push the index of the current string.
        curr.index.push(j);

        // Get the offset of the string in the exceptions array, or add
        // a new string to the array.
        let offset = index[str];
        if (typeof offset !== 'number') {
          offset = exceptions.length;
          exceptions.push(str);
          index[str] = offset;
        }

        // Push the offset into the exceptions array.
        curr.index.push(offset);
      }
    }

    // Pack all regions together with their exception indices.
    let defaultRegion = '';
    const regions = layers.map(curr => {
      const idxarr: number[] = [];
      curr.index.map(n => vuintEncode(n, idxarr));
      const idx = z85Encode(idxarr);

      let id = curr.tag.region();
      if (curr.isDefault) {
        defaultRegion = id;
      }

      // TODO: Revisit variant support. For now we append variant to region
      // to distinguish them.
      const variant = curr.tag.variant();
      if (variant !== '') {
        id += '-' + variant;
      }
      return `"${id}":"${idx}"`;
    });

    if (defaultRegion === '') {
      const def = this.defaultLayer;
      if (def !== undefined && def.script() === script && def.hasRegion()) {
        defaultRegion = def.region();
      } else {
        throw new Error(`Failed to set default region for ${this.language}-${script}`);
      }
    }

    // Manually build the JSON to ensure the same result every time (avoid passing
    // through object hash functions). We return a raw UTF-16 string that the
    // Node.js fs module will write as UTF-8.
    return `{"strings":"${join(base.strings)}",` +
      `"exceptions":"${join(exceptions)}",` +
      `"regions":{${regions.join(',')}},` +
      `"default":"${defaultRegion}"}`;
  }

  /**
   * Select the best base layers for all regions to inherit from.
   *
   * All strings are stored in the base layer, and each region stores its delta
   * from the base. To minimize overall size of the delta indexes we should select
   * a base layer that has the lowest distance to all locales.
   *
   * Here we compute the pairwise distance between all regions and pick the region
   * with the lowest overall distance. Based on a quick check this saves a total of
   * 350KB across all uncompressed resource files.
   *
   * TODO: select the base layer and then compute distances per-script.
   */
  private selectBaseLayer(layers: Layer[]): Layer {
    const distances: [number, Layer][] = [];
    for (const base of layers) {
      const baseLen = base.strings.length;
      let dist = 0;
      for (const curr of layers) {
        // Skip self-comparisons
        if (curr.localeId === base.localeId) {
          continue;
        }

        // If the string array lengths do not match this is a serious error as it
        // means there a severe bug in the encoder.
        const currLen = curr.strings.length;

        /* istanbul ignore if */
        if (baseLen !== currLen) {
          throw new Error(`Severe error: string tables for ${base.localeId} and` +
            `${curr.localeId} lengths differ: ${baseLen} !== ${currLen}`);
        }

        // Distance is the number of field values that differ.
        for (let i = 0; i < curr.strings.length; i++) {
          if (base.strings[i] !== curr.strings[i]) {
            dist++;
          }
        }
      }

      // Keep track of the total distance for each potential base layer.
      distances.push([ dist, base ]);
    }

    // Sort by distance and return the layer with the smallest distance.
    distances.sort((a, b) => a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1);
    return distances[0][1];
  }

}
