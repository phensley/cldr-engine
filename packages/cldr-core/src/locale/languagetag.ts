export const LANGUAGE = 0;
export const SCRIPT = 1;
export const REGION = 2;
export const VARIANT = 3;

const SEP = '-';

const UNDEFINED_VALUES = [
  'und',
  'Zzzz',
  'ZZ',
  '',
];

const KEYS = [LANGUAGE, SCRIPT, REGION, VARIANT];

const TRANSFORMS: ((s: string) => string)[] = [
  s => s.toLowerCase(),
  s => s[0].toUpperCase() + s.substring(1),
  s => s.toUpperCase(),
  s => s.toLowerCase(),
];

/**
 * Ensure the given field is in canonical form.
 */
const canonicalize = (field: number, value?: string): string | undefined => {
  if (field === LANGUAGE && value === 'root') {
    value = undefined;
  } else if (value === UNDEFINED_VALUES[field]) {
    value = undefined;
  }
  if (typeof value === 'string' && value.length > 0) {
    return TRANSFORMS[field](value);
  }
  return undefined;
};

/**
 * IETF BCP 47 language tag with static methods for parsing, adding likely
 * subtags, etc.
 *
 * @alpha
 */
export class LanguageTag {

  protected core: (undefined | string)[];
  protected _extensions?: string[];
  protected _privateUse?: string;

  constructor(
    language?: string,
    script?: string,
    region?: string,
    variant?: string,
    extensions?: string[],
    privateUse?: string) {
    this.core = [
      canonicalize(LANGUAGE, language),
      canonicalize(SCRIPT, script),
      canonicalize(REGION, region),
      canonicalize(VARIANT, variant)
    ];
    this._extensions = extensions;
    this._privateUse = privateUse;
  }

  /**
   * Language subtag.
   */
  language(): string {
    return this.core[LANGUAGE] || UNDEFINED_VALUES[LANGUAGE];
  }

  /**
   * Returns true if the language subtag is defined.
   */
  hasLanguage(): boolean {
    return this.core[LANGUAGE] !== undefined;
  }

  /**
   * Script subtag.
   */
  script(): string {
    return this.core[SCRIPT] || UNDEFINED_VALUES[SCRIPT];
  }

  /**
   * Returns true if the script subtag is defined.
   */
  hasScript(): boolean {
    return this.core[SCRIPT] !== undefined;
  }

  /**
   * Region subtag.
   */
  region(): string {
    return this.core[REGION] || UNDEFINED_VALUES[REGION];
  }

  /**
   * Returns true if the region subtag is defined.
   */
  hasRegion(): boolean {
    return this.core[REGION] !== undefined;
  }

  /**
   * Variant subtag.
   */
  variant(): string {
    return this.core[VARIANT] || UNDEFINED_VALUES[VARIANT];
  }

  /**
   * Extension subtags.
   */
  extensions(): string[] {
    return this._extensions === undefined ? [] : this._extensions.slice(0);
  }

  /**
   * Private use subtag.
   */
  privateUse(): string {
    return this._privateUse === undefined ? '' : this._privateUse;
  }

  /**
   * Return a compact string representation of the language tag. Any undefined
   * fields will be omitted.
   */
  compact(): string {
    return this.render(false);
  }

  /**
   * Return an expanded string representation of the language tag. Any undefined
   * fields will emit their undefined value.
   */
  expanded(): string {
    return this.render(true);
  }

  /**
   * Return a compact string representation of the language tag. Any undefined
   * fields will be omitted.
   */
  toString(): string {
    return this.compact();
  }

  /**
   * Render a tag in compact or expanded form.
   */
  private render(expanded: boolean): string {
    let buf: string = '';
    KEYS.forEach(key => {
      const force: boolean = key !== VARIANT && (key === LANGUAGE || expanded);
      const val: string | undefined = this.core[key];
      if (val !== undefined || force) {
        if (buf.length > 0) {
          buf += SEP;
        }
        buf += val ? val : UNDEFINED_VALUES[key];
      }
    });
    if (Array.isArray(this._extensions) && this._extensions.length > 0) {
      buf += SEP + this._extensions.join(SEP);
    }
    if (typeof this._privateUse === 'string' && this._privateUse.length > 0) {
      buf += SEP + this._privateUse;
    }
    return buf;
  }

}
