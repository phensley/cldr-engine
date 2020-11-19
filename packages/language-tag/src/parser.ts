import { LanguageTag } from './languagetag';
import { replaceRegion, stringToObject } from './util';
import * as subtags from './autogen.subtags';

// Subtag separator
const SEP = '-';
const UNDERSCORE = /_/g;

// ISO 639 language code
const LANGUAGE = /^[a-z]{2,8}$/i;

// Selected ISO 639 codes
const EXTLANG = /^[a-z]{3}$/i;

// ISO 15924 script code
const SCRIPT = /^[a-z]{4}$/i;

// ISO 3166-1 or UN M.49 code
const REGION = /^([a-z]{2,3}|\d{3})$/i;

// Registered variants
const VARIANT = /^([a-z\d]{5,8}|\d[a-z\d]{3})$/i;

const EXTENSION_PREFIX = /^[\da-wyz]$/i;
const EXTENSION_SUBTAG = /^[\da-z]{2,8}$/i;
const PRIVATEUSE_PREFIX = /^x$/i;
const PRIVATEUSE_SUBTAG = /^[\da-z]{1,8}$/i;

// https://www.unicode.org/reports/tr35/tr35-33/tr35.html#Key_And_Type_Definitions_
const UNICODE_EXTENSION_KEYS: Set<string> = new Set([
  'ca', // calendar
  'co', // collation
  'cu', // currency
  'nu', // numbering system
  'tz', // timezone
  'va', // common variant type
]);

// Grandfathered irregular and regular tags from IANA registry.
let GRANDFATHERED_TAGS: { [x: string]: string } | undefined;

const init = () => {
  GRANDFATHERED_TAGS = {
    ...stringToObject(subtags.grandfatheredRaw, '|', ':'),

    // Additional fallbacks from ICU
    'cel-gaulish': 'xtg-x-cel-gaulish',
    'en-GB-oed': 'en-GB-x-oed',
    'i-default': 'en-x-i-default',
    'i-enochian': 'und-x-i-enochian',
    'i-mingo': 'see-x-i-mingo',
    'zh-min': 'nan-x-zh-min',
  };
};

/**
 * Match the first element of the parts array against the given pattern.
 * Shifts the first element and returns the match, or returns null.
 */
const match = (parts: string[], pattern: RegExp): string | undefined => {
  if (parts.length > 0) {
    const m = parts[0].match(pattern);
    if (m !== null) {
      parts.shift();
      return m[0];
    }
  }
  return undefined;
};

/**
 * Parses a string into a series of language tag fields.
 */
class LanguageTagParser {
  private language?: string;
  private script?: string;
  private region?: string;
  private extlangs: string[] = [];
  private variants: string[] = [];
  private extensions: { [x: string]: string[] } = {};
  private privateUse: string = '';

  private str: string;
  // private errors: string[] = [];

  constructor(str: string) {
    this.str = str;
  }

  /**
   * Parse the string and return a language tag object.
   */
  parse(): LanguageTag {
    if (!GRANDFATHERED_TAGS) {
      init();
    }
    const str = this.str.indexOf('_') === -1 ? this.str : this.str.replace(UNDERSCORE, SEP);
    const preferred = GRANDFATHERED_TAGS![str.toLowerCase()];
    const parts = typeof preferred === 'string' ? preferred.split(SEP) : str.split(SEP);

    if (this.parseLanguage(parts)) {
      this.parseExtLangs(parts);
      this.parseScript(parts);
      this.parseRegion(parts);
      this.parseVariants(parts);
      this.parseExtensions(parts);
    }
    this.parsePrivateUse(parts);

    // If no region was parsed, check if one of the extlangs is actually a valid ISO 3166
    if (!this.region) {
      for (let i = 0; i < this.extlangs.length; i++) {
        const replacement = replaceRegion(this.extlangs[i].toUpperCase());
        if (replacement) {
          this.region = replacement;
          // Ignore the extlangs since we currently don't add them to the LanguageTag.
          break;
        }
      }
    }

    return new LanguageTag(
      this.language,
      this.script,
      this.region,
      this.variants.length === 0 ? undefined : this.variants[0],
      this.extensions,
      this.privateUse,
      this.extlangs,
    );
  }

  private parseLanguage(parts: string[]): boolean {
    this.language = match(parts, LANGUAGE);
    return !!this.language;
  }

  private parseExtLangs(parts: string[]): boolean {
    while (parts.length !== 0) {
      const result = match(parts, EXTLANG);
      if (!result) {
        break;
      }
      this.extlangs.push(result);
    }
    return this.extlangs.length !== 0;
  }

  private parseScript(parts: string[]): boolean {
    this.script = match(parts, SCRIPT);
    return !!this.script;
  }

  private parseRegion(parts: string[]): boolean {
    this.region = match(parts, REGION);
    return !!this.region;
  }

  private parseVariants(parts: string[]): boolean {
    while (parts.length > 0) {
      const result = match(parts, VARIANT);
      if (!result) {
        break;
      }
      this.variants.push(result);
    }
    return this.variants.length !== 0;
  }

  private parseExtensions(parts: string[]): boolean {
    let parsed = false;
    while (parts.length > 0) {
      const prefix = match(parts, EXTENSION_PREFIX);
      if (!prefix) {
        break;
      }

      const subs: string[] = [];
      let temp = '';
      while (parts.length > 0) {
        const subtag = match(parts, EXTENSION_SUBTAG);
        if (!subtag) {
          break;
        }

        if (!UNICODE_EXTENSION_KEYS.has(subtag)) {
          temp += temp ? SEP + subtag : subtag;
          continue;
        }

        if (temp) {
          subs.push(temp);
        }
        temp = subtag;
      }

      if (temp) {
        subs.push(temp);
      }

      if (subs.length > 0) {
        parsed = true;
        subs.sort();
        let curr = this.extensions[prefix];
        curr = curr === undefined ? subs : curr.concat(subs);
        this.extensions[prefix] = curr.sort();
      }
    }
    return parsed;
  }

  private parsePrivateUse(parts: string[]): boolean {
    let parsed = false;
    while (parts.length > 0) {
      const prefix = match(parts, PRIVATEUSE_PREFIX);
      if (!prefix) {
        break;
      }
      const subs = [];
      while (parts.length > 0) {
        const subtag = match(parts, PRIVATEUSE_SUBTAG);
        if (!subtag) {
          break;
        }
        subs.push(subtag);
      }

      if (subs.length > 0) {
        this.privateUse += `${prefix}${SEP}${subs.join(SEP)}`;
        parsed = true;
      }
    }
    return parsed;
  }
}

/**
 * Low-level parsing of a language tag. No resolution is performed.
 *
 * @public
 */
export const parseLanguageTag = (str: string) => new LanguageTagParser(str).parse();
