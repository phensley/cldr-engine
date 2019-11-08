import { getSupplemental } from '../../../cldr';
import { parsePluralRule } from '../../../parsing/parser.plural';

// Single-character ids for the plural categories.
const categories: any = {
  zero: 'A',
  one: 'B',
  two: 'C',
  few: 'D',
  many: 'E',
  other: 'F',
};

type StringMap = { [x: string]: string };

// Sequence for generating expression identifiers.
let sequence = 0;

// Expressions mapped to unique identifiers.
const expressions: { [x: string]: number } = {};

const exprId = (e: string): number => {
  let id = expressions[e];
  if (id === undefined) {
    id = sequence++;
    expressions[e] = id;
  }
  return id;
};

const parseRule = (lang: string, category: string, raw: string): string => {
  const result = parsePluralRule(raw);
  if (result.isNothing()) {
    throw new Error(`Failure to parse plural rule for ${lang} key ${category}: ${raw}`);
  }
  const rule = result.get()._1;
  return rule.compact();
};

const parseRules = (pluralSet: any): StringMap => {
  const map: StringMap = {};
  Object.keys(pluralSet).forEach(lang => {
    const obj = pluralSet[lang];
    map[lang] = Object.keys(obj).map(k => {
      const code = categories[k.split('-')[2]];
      const json = parseRule(lang, k, obj[k]);
      return code + '|' + json.split('|').map(c => {
        // Replace expression with its unique id.
        return c.split('&').map(exprId).join('&');
      }).join('|');
    }).sort().join('_');
  });
  return map;
};

const SPACER = /[\s,]+/;
const IGNORE = new Set(['@integer', '@decimal', '…']);

const parseSamples = (pluralSet: any): StringMap => {
  const map: any = {};
  Object.keys(pluralSet).forEach(lang => {
    const obj = pluralSet[lang];
    map[lang] = Object.keys(obj).map(k => {
      const code = k.split('-')[2];
      const rule = parsePluralRule(obj[k]).get()._1;
      const samples = rule.samples.split(SPACER).filter(s => !IGNORE.has(s));
      return [code, samples];
    });
  });
  return map;
};

export const getPlurals = (): any => {
  const tree = getSupplemental();
  const { Cardinals, Ordinals } = tree;

  const cardinals = parseRules(Cardinals);
  const ordinals = parseRules(Ordinals);
  const exprs = Object.keys(expressions)
    .sort((a, b) => expressions[a] < expressions[b] ? -1 : 1);

  const samples = {
    cardinals: parseSamples(Cardinals),
    ordinals: parseSamples(Ordinals)
  };

  return {
    cardinals,
    ordinals,
    expressions: exprs,
    samples
  };
};
