import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';
import { availableLocales, getSupplemental } from '../../../cldr';
import { objectToString, Code, HEADER, NOLINT_MAXLINE } from './util';
import { parseLanguageTag, LanguageTag } from '@phensley/cldr-core';
import { inspect } from 'util';

const enum Tag {
  LANGUAGE = 0,
  SCRIPT = 1,
  REGION = 2,
}

/**
 * Split string into lines and split each line into a colon-delimited
 * key / value pair, and convert each group into an object.
 */
const parseSubtagBlock = (raw: string): { [x: string]: string } => {
  return raw
    .trim()
    .split('\n')
    .map((s) => {
      const i = s.indexOf(':');
      return [s.substring(0, i), s.substring(i + 1)];
    })
    .reduce((o: { [x: string]: string }, [k, v]) => {
      o[k.trim()] = v.trim();
      return o;
    }, {});
};

const getIanaSubtags = () => {
  const path = join(__dirname, '..', '..', '..', '..', 'data', 'raw-iana-subtags.txt.gz');
  const raw = fs.readFileSync(path);
  const data = zlib.gunzipSync(raw).toString('utf-8');
  return data
    .split('%%')
    .map(parseSubtagBlock)
    .filter((r) => r.Type);
};

const pruneRegion = (m: { [x: string]: string }): void =>
  Object.keys(m).forEach((k) => {
    const v = m[k];
    if (v.endsWith('-ZZ')) {
      m[k] = v.substring(0, -3);
    }
  });

// Helper to cast LanguageTag to access protected fields
interface FakeLanguageTag {
  core: (string | number)[];
  _extensions?: string[];
  _privateUse?: string;
}

/**
 * Omit keys whose value is empty.
 */
const filterSubtags = (likely: any) => {
  return Object.keys(likely).reduce((p, key) => {
    const val = likely[key];
    if (val) {
      p[key] = val;
    }
    return p;
  }, {} as any);
};

export type FastTag = (string | number)[];

export const fastTag = (real: LanguageTag): FastTag => {
  // Hack to get fast access to internal core fields without exposing them.
  const fake = real as any as FakeLanguageTag;

  // The fast tag is used for indexing purposes. Since a field may be
  // undefined, and we don't want to use its string representation of
  // the undefined value (e.g. 'und', 'Zzzz', etc), we use the field's
  // index number to represent undefined.
  const language = fake.core[Tag.LANGUAGE];
  const script = fake.core[Tag.SCRIPT];
  const region = fake.core[Tag.REGION];
  return [language || Tag.LANGUAGE, script || Tag.SCRIPT, region || Tag.REGION];
};

const putMap = (map: any, key: string | number) => {
  let val: any = map[key];
  if (val === undefined) {
    val = {};
    map[key] = val;
  }
  return val;
};

const buildSubtags = (likely: any, languages: Set<string>) => {
  likely = filterSubtags(likely);
  const index: any = {};
  const scripts: string[] = [];
  Object.keys(likely)
    .sort()
    .forEach((k) => {
      const dst = parseLanguageTag(likely[k]);
      // Skip all subtag patterns for unsupported languages. This prunes down
      // the mapping size.
      if (dst.hasLanguage() && !languages.has(dst.language())) {
        console.log(`skipping ${likely[k]}`);
        return;
      }

      const key = fastTag(parseLanguageTag(k));
      const val = fastTag(dst);

      const map = putMap(putMap(index, key[Tag.LANGUAGE]), key[Tag.SCRIPT]);
      const script = val[Tag.SCRIPT];
      let scriptid = scripts.indexOf(script as string);
      if (scriptid === -1) {
        scriptid = scripts.length;
        scripts.push(script as string);
      }
      val[Tag.SCRIPT] = scriptid;
      const _val = val
        .map((t, i) =>
          (i === Tag.LANGUAGE && t === key[Tag.LANGUAGE]) || (i === Tag.REGION && t === key[Tag.REGION]) ? '' : t,
        )
        .join('-');
      map[key[Tag.REGION]] = _val;
    });
  index._ = scripts;
  return index;
};

// TODO: hacks abound here. generalize some of this code

const encodekey = (s: string) => {
  if (/\d+/.test(s)) {
    const n = parseInt(s, 10);
    if (isFinite(n) && (s.length === 1 || s[0] !== '0')) {
      return s;
    }
    return `'${s}'`;
  }
  return s;
};

const encode = (o: any): string => {
  if (Array.isArray(o)) {
    return '[' + o.map(encode).join(',') + ']';
  } else if (typeof o === 'object') {
    return (
      '{' +
      Object.keys(o)
        .map((k) => encodekey(k) + ':' + encode(o[k]))
        .join(',') +
      '}'
    );
  } else if (typeof o === 'string' && o.length) {
    return `'${o}'`;
  } else if (typeof o === 'number') {
    return `${o}`;
  } else if (!o) {
    return ``;
  } else {
    throw new Error(`invalid type ${typeof o}: ${inspect(o)}`);
  }
  return '';
};

export const getSubtags = (data: any): Code[] => {
  const languages = new Set<string>();

  // Get list of supported languages and scripts
  for (const id of availableLocales()) {
    const tag = parseLanguageTag(id);
    if (tag.hasLanguage()) {
      languages.add(tag.language());
    }
  }

  for (const rule of data.matchRules) {
    languages.add(rule[0]);
    languages.add(rule[1]);
  }

  const supplemental = getSupplemental();
  const ianaSubtags = getIanaSubtags();

  const grandfathered = objectToString(
    ianaSubtags
      .filter((r) => r.Type === 'grandfathered')
      .reduce((o, r) => {
        const tag = r.Tag;
        o[tag] = r['Preferred-Value'];
        return o;
      }, {}),
  );

  pruneRegion(supplemental.LikelySubtags);
  const likely = buildSubtags(supplemental.LikelySubtags, languages);

  const result: Code[] = [];

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const grandfatheredRaw = '${grandfathered}';\n`;

  result.push(Code.languagetag(['autogen.subtags.ts'], code));

  code = HEADER + NOLINT_MAXLINE;
  code += `export const likelySubtags: any = ${encode(likely)};\n`;

  result.push(Code.locale(['autogen.subtags.ts'], code));
  return result;
};
