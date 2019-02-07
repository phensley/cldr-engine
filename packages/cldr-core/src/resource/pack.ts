import { vuintDecode, z85Decode } from '@phensley/cldr-utils';

import { LanguageResolver, LanguageTag } from '../locale';
import { Bundle, ExceptionIndex, StringBundle } from './bundle';

const DELIMITER = '\t';

/**
 * Layer in the pack that supports all regions for a single language + script.
 */
export class PackScript {

  readonly _strings: string[];
  readonly _exceptions: string[];
  readonly _regions: { [x: string]: string };
  readonly _cache: { [x: string]: ExceptionIndex} = {};
  readonly _defaultRegion: string;

  constructor(
    strings: string,
    exceptions: string,
    regions: { [x: string]: string },
    defaultRegion: string
  ) {
    this._strings = strings.split(DELIMITER);
    this._exceptions = exceptions.split(DELIMITER);
    this._regions = regions;
    this._defaultRegion = defaultRegion;
  }

  get(tag: LanguageTag): Bundle {
    let region = tag.region();
    let index = this._cache[region] || this.decode(region);
    if (index === undefined) {
      region = this._defaultRegion;
      tag = new LanguageTag(tag.language(), tag.script(), region, tag.variant(), tag.extensions(), tag.privateUse());
      index = this._cache[region] || this.decode(region);
    }
    return new StringBundle(tag.compact(), tag, this._strings, this._exceptions, index);
  }

  private decode(region: string): ExceptionIndex | undefined {
    const raw = this._regions[region];
    if (raw === undefined) {
      return undefined;
    }

    const decoded = vuintDecode(z85Decode(raw));
    const index: ExceptionIndex = {};
    for (let i = 0; i < decoded.length; i += 2) {
      const k = decoded[i];
      const v = decoded[i + 1];
      index[k] = v;
    }
    this._cache[region] = index;
    return index;
  }
}

/**
 * Runtime resource pack manager.
 *
 * @alpha
 */
export class Pack {

  readonly version: string;
  readonly cldrVersion: string;
  readonly language: string;
  readonly defaultTag: LanguageTag;
  readonly scripts: { [x: string]: PackScript } = {};

  constructor(data: any) {
    const raw: any = typeof data === 'string' ? JSON.parse(data) : data;
    const { version, cldr, language } = raw;
    if (version === undefined) {
      throw new Error('Severe error: data does not look like a valid resource pack.');
    }

    this.version = version;
    this.cldrVersion = cldr;
    this.language = language;
    this.defaultTag = LanguageResolver.resolve(raw.default);

    Object.keys(raw.scripts).forEach(k => {
      const obj = raw.scripts[k];
      this.scripts[k] = new PackScript(obj.strings, obj.exceptions, obj.regions, obj.default);
    });
  }

  get(tag: LanguageTag): Bundle {
    // We need the script and region to find the correct string layer. Caller should
    // ideally supply a resolved language tag to avoid the overhead of this call.
    if (!tag.hasLanguage() || !tag.hasScript() || !tag.hasRegion()) {
      tag = LanguageResolver.resolve(tag);
    }

    // Strings for a language are organized by script.
    let script = this.scripts[tag.script()];
    if (script === undefined) {
      script = this.scripts[this.defaultTag.script()];
      return script.get(this.defaultTag);
    }
    return script.get(tag);
  }

}
