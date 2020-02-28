import { LanguageResolver, LanguageTag } from '../locale';
import { Bundle, ExceptionIndex, StringBundle } from './bundle';
import { numarray } from '../utils/string';

const enum Chars {
  // Fields in a resource pack are separated by an UNDERSCORE character
  DELIM = '_'
}
const U = undefined;

/**
 * Layer in the pack that supports all regions for a single language + script.
 *
 * @public
 */
export class PackScript {

  private _strings: string[];
  private _exceptions: string[];
  private _regions: { [x: string]: string };
  private _cache: { [x: string]: ExceptionIndex } = {};
  private _defaultRegion: string;

  constructor(
    strings: string,
    exceptions: string,
    regions: { [x: string]: string },
    defaultRegion: string,
    private _spellout: any
  ) {
    this._strings = strings.split(Chars.DELIM);
    this._exceptions = exceptions.split(Chars.DELIM);
    this._regions = regions;
    this._defaultRegion = defaultRegion;
  }

  get(tag: LanguageTag): Bundle {
    let region = tag.region();
    let index = this._cache[region] || this.decode(region);
    if (index === U) {
      region = this._defaultRegion;
      tag = new LanguageTag(tag.language(), tag.script(), region, tag.variant(), tag.extensions(), tag.privateUse());
      index = this._cache[region] || this.decode(region);
    }
    return new StringBundle(tag.compact(), tag, this._strings, this._exceptions, index, this._spellout);
  }

  private decode(region: string): ExceptionIndex | undefined {
    const raw = this._regions[region];
    if (raw === U) {
      return U;
    }

    const decoded = numarray(raw, 36);
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
 * @public
 */
export class Pack {

  readonly version: string;
  readonly cldrVersion: string;
  readonly checksum: string;
  readonly language: string;
  readonly defaultTag: LanguageTag;
  readonly scripts: { [x: string]: PackScript } = {};
  readonly spellout: any;

  constructor(data: any) {
    const raw: any = typeof data === 'string' ? JSON.parse(data) : data;
    const { version, cldr, checksum, language, spellout } = raw;
    if (version === U) {
      throw new Error('Severe error: data does not look like a valid resource pack.');
    }

    this.version = version;
    this.cldrVersion = cldr;
    this.checksum = checksum;
    this.language = language;
    this.spellout = spellout;
    this.defaultTag = LanguageResolver.resolve(raw.defaultTag);

    Object.keys(raw.scripts).forEach(k => {
      const obj = raw.scripts[k];
      this.scripts[k] = new PackScript(obj.strings, obj.exceptions, obj.regions, obj.defaultRegion, this.spellout);
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
    if (script === U) {
      // Swap in the default script
      tag = new LanguageTag(
        this.defaultTag.language(),
        this.defaultTag.script(),
        this.defaultTag.region(),
        this.defaultTag.variant(),
        tag.extensions(),
        tag.privateUse());
      script = this.scripts[tag.script()];
    }
    return script.get(tag);
  }

}
