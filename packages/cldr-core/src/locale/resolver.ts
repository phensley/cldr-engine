import { LanguageTag, LANGUAGE, SCRIPT, REGION } from './locale';
import { parseLanguageTag } from './parser';
import { substituteRegionAliases, FastTag, LanguageAliasMap } from './util';
import { stringToObject } from '../utils/string';

import { languageAliasRaw } from './autogen.aliases';
import * as subtags from './autogen.subtags';

/**
 * Put a nested map into the given map.
 */
const putMap = (map: any, key: string | number) => {
  let val: any = map[key];
  if (val === undefined) {
    val = [];
    map[key] = val;
  }
  return val;
};

// Helper to cast LanguageTag to access protected fields
interface FakeLanguageTag {
  core: (string | number)[];
  _extensions?: string[];
  _privateUse?: string;
}

/**
 * Since a lot of comparisons will be done, we need fast access to
 * core fields of LanguageTag without exposing the raw fields.
 */
const fastTag = (real: LanguageTag): FastTag => {
  // Hack to get fast access to internal core fields without exposing them.
  const fake = (real as any) as FakeLanguageTag;

  // The fast tag is used for indexing purposes. Since a field may be
  // undefined, and we don't want to use its string representation of
  // the undefined value (e.g. 'und', 'Zzzz', etc), we use the field's
  // index number to represent undefined.
  const language = fake.core[LANGUAGE];
  const script = fake.core[SCRIPT];
  const region = fake.core[REGION];
  return [
    language || LANGUAGE,
    script || SCRIPT,
    region || REGION
  ];
};

const parseFastTag = (raw: string): FastTag => {
  return fastTag(parseLanguageTag(raw));
};

/**
 * Index holding likely subtags matches.
 */
class LikelySubtagsMap {

  // Hack to be able to index using numbers and strings.
  readonly index: any = [];

  constructor(likely: { [x: string]: string }) {
    Object.keys(likely).forEach(k => {
      const key = parseFastTag(k);
      const val = parseFastTag(likely[k]);

      // Add the fast tag into the index.
      const map = putMap(putMap(this.index, key[LANGUAGE]), key[SCRIPT]);
      map[key[REGION]] = val;
    });
  }

  /**
   * Lookup the FastTag in the index.
   */
  get(query: FastTag): FastTag | undefined {
    const language = query[LANGUAGE];
    const node1 = this.index[language];
    if (node1 !== undefined) {
      const script = query[SCRIPT];
      const node2 = node1[script];
      if (node2 !== undefined) {
        const region = query[REGION];
        return node2[region] || undefined;
      }
    }
    return undefined;
  }
}

// Flags for subtag permutations
const F_LANGUAGE = 1;
const F_SCRIPT = 2;
const F_REGION = 4;

const MATCH_ORDER = [
  F_LANGUAGE | F_SCRIPT | F_REGION,
  F_LANGUAGE | F_REGION,
  F_LANGUAGE | F_SCRIPT,
  F_LANGUAGE,
  F_SCRIPT
];

/**
 * Clear or copy fields from src to dst depending on flags.
 */
const setFields = (src: FastTag, dst: FastTag, flags: number): void => {
  dst[LANGUAGE] = (flags & F_LANGUAGE) === 0 ? LANGUAGE : src[LANGUAGE];
  dst[SCRIPT] = (flags & F_SCRIPT) === 0 ? SCRIPT : src[SCRIPT];
  dst[REGION] = (flags & F_REGION) === 0 ? REGION : src[REGION];
};

/**
 * Lookup any aliases that match this tag, and replace any undefined subtags.
 */
const substituteLanguageAliases = (dst: FastTag): void => {
  const aliases = LANGUAGE_ALIAS_MAP[dst[LANGUAGE]];
  if (aliases === undefined) {
    return;
  }
  for (let i = 0; i < aliases.length; i++) {
    const { type, repl } = aliases[i];
    const exact = (type[LANGUAGE] === dst[LANGUAGE] &&
    type[SCRIPT] === dst[SCRIPT] &&
    type[REGION] === dst[REGION]);

    if ((type[SCRIPT] === SCRIPT && type[REGION] === REGION) || exact) {
      dst[LANGUAGE] = repl[LANGUAGE];
      if (dst[SCRIPT] === SCRIPT) {
        dst[SCRIPT] = repl[SCRIPT];
      }
      if (dst[REGION] === REGION) {
        dst[REGION] = repl[REGION];
      }
      break;
    }
  }
};

/**
 * Add any missing subtags using the likely subtags mapping. For example,
 * this would convert "en" to "en-Latn-US".
 */
const addLikelySubtags = (dst: FastTag): void => {
  const tmp = dst.slice(0);
  for (let i = 0; i < MATCH_ORDER.length; i++) {
    const flags = MATCH_ORDER[i];
    setFields(dst, tmp, flags);
    const match = LIKELY_SUBTAGS_MAP.get(tmp);
    if (match !== undefined) {
      if (dst[LANGUAGE] === LANGUAGE) {
        dst[LANGUAGE] = match[LANGUAGE];
      }
      if (dst[SCRIPT] === SCRIPT) {
        dst[SCRIPT] = match[SCRIPT];
      }
      if (dst[REGION] === REGION) {
        dst[REGION] = match[REGION];
      }
      break;
    }
  }
};

/**
 * Return a language tag, combining the fast tag's core subtags with the
 * original's additional subtags.
 */
const returnTag = (real: LanguageTag, fast: FastTag): LanguageTag => {
  const language = fast[LANGUAGE];
  const script = fast[SCRIPT];
  const region = fast[REGION];

  return new LanguageTag(
    typeof language === 'number' ? undefined : language,
    typeof script === 'number' ? undefined : script,
    typeof region === 'number' ? undefined : region,
    real.variant(),
    real.extensions(),
    real.privateUse()
  );
};

// Undefined tag to be copied for use in resolution below.
const UNDEFINED: FastTag = [LANGUAGE, SCRIPT, REGION];

/**
 * Compare two fast tags for equality. These always have identical length.
 */
const fastTagEquals = (a: FastTag, b: FastTag): boolean => {
  const len = a.length;
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

const languageAlias = stringToObject(languageAliasRaw, '|', ':');

const buildLanguageAliasMap = (): LanguageAliasMap => {
  return Object.keys(languageAlias).reduce((o: LanguageAliasMap, k) => {
    const type = parseFastTag(k);
    const repl = parseFastTag(languageAlias[k]);
    const language = type[LANGUAGE];
    let aliases = o[language];
    if (aliases === undefined) {
      aliases = [];
      o[language] = aliases;
    }
    aliases.push({ type, repl });
    return o;
  }, {});
};

const likelySubtags = stringToObject(subtags.likelyRaw, '|', ':');

// Singleton maps.
const LANGUAGE_ALIAS_MAP: LanguageAliasMap = buildLanguageAliasMap();
const LIKELY_SUBTAGS_MAP: LikelySubtagsMap = new LikelySubtagsMap(likelySubtags);

/**
 * Methods for substituting language and region aliases, adding likely subtags, etc.
 */
export class LanguageResolver {

  /**
   * Substitute all relevant aliases, and then add likely subtags.
   */
  static resolve(real: string | LanguageTag): LanguageTag {
    const tag = typeof real === 'string' ? parseLanguageTag(real) : real;
    const fast = fastTag(tag);
    substituteLanguageAliases(fast);
    substituteRegionAliases(fast);
    addLikelySubtags(fast);
    return returnTag(tag, fast);
  }

  /**
   * Add any missing subtags using the likely subtags mapping. For example,
   * this would convert "en" to "en-Latn-US".
   */
  static addLikelySubtags(real: string | LanguageTag): LanguageTag {
    const tag = typeof real === 'string' ? parseLanguageTag(real) : real;
    const fast = fastTag(tag);
    addLikelySubtags(fast);
    return returnTag(tag, fast);
  }

  /**
   * Remove any subtags that would be added by addLikelySubtags() above. For example,
   * this would convert "en-Latn-US" to "en".
   */
  static removeLikelySubtags(real: string | LanguageTag): LanguageTag {
    const tag = typeof real === 'string' ? parseLanguageTag(real) : real;
    const max = fastTag(tag);
    if (max[LANGUAGE] === LANGUAGE || max[SCRIPT] === SCRIPT || max[REGION] === REGION) {
      addLikelySubtags(max);
    }
    const tmp = UNDEFINED.slice(0);

    // Using "en-Latn-US" as an example...
    // 1. Match "en-Zzzz-ZZ"
    tmp[LANGUAGE] = max[LANGUAGE];
    let match = tmp.slice(0);
    addLikelySubtags(match);
    if (fastTagEquals(match, max)) {
      return returnTag(tag, tmp);
    }

    // 2. Match "en-Zzzz-US"
    tmp[REGION] = max[REGION];
    match = tmp.slice(0);
    addLikelySubtags(match);
    if (fastTagEquals(match, max)) {
      tmp[LANGUAGE] = max[LANGUAGE];
      return returnTag(tag, tmp);
    }

    // 3. Match "en-Latn-ZZ"
    tmp[REGION] = REGION;
    tmp[SCRIPT] = max[SCRIPT];
    match = tmp.slice(0);
    addLikelySubtags(match);
    if (fastTagEquals(match, max)) {
      return returnTag(tag, tmp);
    }

    // 4. Nothing matched, so return a copy of the original tag.
    return returnTag(tag, max);
  }

}
