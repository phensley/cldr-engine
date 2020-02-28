export const enum LanguageTagField {
  LANGUAGE = 0,
  SCRIPT = 1,
  REGION = 2,
  VARIANT = 3
}

const SEP = '-';

const UNDEFINED_VALUES = [
  'und',
  'Zzzz',
  'ZZ',
  '',
];

const KEYS = [LanguageTagField.LANGUAGE, LanguageTagField.SCRIPT, LanguageTagField.REGION, LanguageTagField.VARIANT];

const TRANSFORMS: ((s: string) => string)[] = [
  s => s.toLowerCase(),
  s => s[0].toUpperCase() + s.substring(1).toLowerCase(),
  s => s.toUpperCase(),
  s => s.toLowerCase(),
];

/**
 * Ensure the given field is in canonical form.
 */
const canonicalize = (field: number, value?: string): string | undefined => {
  if (field === LanguageTagField.LANGUAGE && value === 'root') {
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
 * @public
 */
export class LanguageTag {

  protected core: (undefined | string)[];
  protected _extensions: { [x: string]: string[] };
  protected _privateUse: string;
  protected _compact?: string;
  protected _expanded?: string;

  constructor(
    language?: string,
    script?: string,
    region?: string,
    variant?: string,
    extensions?: { [x: string]: string[] },
    privateUse?: string) {
    this.core = [
      canonicalize(LanguageTagField.LANGUAGE, language),
      canonicalize(LanguageTagField.SCRIPT, script),
      canonicalize(LanguageTagField.REGION, region),
      canonicalize(LanguageTagField.VARIANT, variant)
    ];
    this._extensions = extensions || {};
    this._privateUse = privateUse || '';
  }

  /**
   * Language subtag.
   */
  language(): string {
    return this.core[LanguageTagField.LANGUAGE] || UNDEFINED_VALUES[LanguageTagField.LANGUAGE];
  }

  /**
   * Returns true if the language subtag is defined.
   */
  hasLanguage(): boolean {
    return this.core[LanguageTagField.LANGUAGE] !== undefined;
  }

  /**
   * Script subtag.
   */
  script(): string {
    return this.core[LanguageTagField.SCRIPT] || UNDEFINED_VALUES[LanguageTagField.SCRIPT];
  }

  /**
   * Returns true if the script subtag is defined.
   */
  hasScript(): boolean {
    return this.core[LanguageTagField.SCRIPT] !== undefined;
  }

  /**
   * Region subtag.
   */
  region(): string {
    return this.core[LanguageTagField.REGION] || UNDEFINED_VALUES[LanguageTagField.REGION];
  }

  /**
   * Returns true if the region subtag is defined.
   */
  hasRegion(): boolean {
    return this.core[LanguageTagField.REGION] !== undefined;
  }

  /**
   * Variant subtag.
   */
  variant(): string {
    return this.core[LanguageTagField.VARIANT] || UNDEFINED_VALUES[LanguageTagField.VARIANT];
  }

  /**
   * Return a copy of this language tag's extensions map.
   */
  extensions(): { [x: string]: string[] } {
    const exts = this._extensions;
    const res: { [x: string]: string[] } = {};
    Object.keys(exts).forEach(k => {
      res[k] = exts[k];
    });
    return res;
  }

  /**
   * Return a copy of the extensions of the given type. Use 'u' for Unicode
   * and 't' for Transforms.
   */
  extensionSubtags(key: string): string[] {
    const exts = this._extensions[key];
    return exts || [];
  }

  /**
   * Private use subtag.
   */
  privateUse(): string {
    return this._privateUse;
  }

  /**
   * Return a compact string representation of the language tag. Any undefined
   * fields will be omitted.
   */
  compact(): string {
    if (!this._compact) {
      this._compact = this.render(false);
    }
    return this._compact;
  }

  /**
   * Return an expanded string representation of the language tag. Any undefined
   * fields will emit their undefined value.
   */
  expanded(): string {
    if (!this._expanded) {
      this._expanded = this.render(true);
    }
    return this._expanded;
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
      const force: boolean = key !== LanguageTagField.VARIANT && (key === LanguageTagField.LANGUAGE || expanded);
      const val: string | undefined = this.core[key];
      if (val !== undefined || force) {
        if (buf.length > 0) {
          buf += SEP;
        }
        buf += val ? val : UNDEFINED_VALUES[key];
      }
    });
    const exts = this._extensions;
    const keys = Object.keys(exts);
    if (keys.length) {
      keys.sort().forEach(k => {
        const vals = exts[k];
        if (vals !== undefined && vals.length > 0) {
          buf += SEP + k + SEP + exts[k].join(SEP);
        }
      });
    }
    if (this._privateUse.length > 0) {
      buf += SEP + this._privateUse;
    }
    return buf;
  }

}
