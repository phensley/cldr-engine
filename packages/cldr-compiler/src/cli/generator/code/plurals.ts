import { getSupplemental } from '../../../cldr';
import { parsePluralRule } from '../../../parsing/parser.plural';
import { HEADER, Code, lineWrap, formatSource } from './util';

// Single-character names for the plural categories.
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
      const raw = obj[k];
      const json = parseRule(lang, k, raw);
      return code + '|' + json.split('|').map(c => {
        return c.split('&').map(exprId).join('&');
      }).join('|');
    }).sort().join('\t');
  });
  return map;
};

export const getPlurals = (data: any): Code[] => {
  const tree = getSupplemental();
  const { Cardinals, Ordinals } = tree;

  const cardinals = parseRules(Cardinals);
  const ordinals = parseRules(Ordinals);
  const expressionsSorted = Object.keys(expressions).sort((a, b) =>
    expressions[a] < expressions[b] ? -1 : 1);

  const type = '{ [x: string]: string }';

  let code = HEADER;
  code += formatSource(`export const cardinalRules: ${type} = ${JSON.stringify(cardinals)};\n\n`);
  code += formatSource(`export const ordinalRules: ${type} = ${JSON.stringify(ordinals)};\n\n`);
  code += formatSource(`export const expressions: string[] = ${JSON.stringify(expressionsSorted)};\n`);

  return [
    Code.core(['internals', 'plurals', 'autogen.rules.ts'], code)
  ];
};
