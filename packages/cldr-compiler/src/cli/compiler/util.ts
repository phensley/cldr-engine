import * as fs from 'fs';
import { join } from 'path';
import { availableLocales } from '../../cldr';
import { LanguageResolver, Locale } from '@phensley/cldr-core';

/**
 * Write data to a file.
 */
export const writeData = (path: string, data: string) => {
  console.warn(`writing '${path}'`);
  fs.writeFileSync(path, data, { encoding: 'binary' });
};

/**
 * Write JSON-encoded data to a file.
 */
export const writeJSON = (path: string, obj: any) => {
  const data = JSON.stringify(obj, undefined, 2);
  fs.writeFileSync(path, data, { encoding: 'utf-8' });
};

export interface ProjectInfo {
  version: string;
  cldrVersion: string;
}

export const getPackageInfo = (): ProjectInfo => {
  const path = join(__dirname, '..', '..', '..', 'package.json');
  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  const { version, cldrversion } = JSON.parse(raw);
  const cldrVersion = cldrversion.replace(/[^\d.]+/, '');
  return { version, cldrVersion };
};

/**
 * Convert a string into a locale object.
 */
const getLocale = (id: string): Locale => ({ id, tag: LanguageResolver.resolve(id) });

export type LocaleMap = { [x: string]: Locale[] };

/**
 * Build a mapping of language -> Locale[].
 */
export const localeMap: LocaleMap = availableLocales().map(getLocale).reduce((o: LocaleMap, c) => {
  const lang = c.tag.language();
  const values = o[lang] || [];
  values.push(c);
  o[lang] = values;
  return o;
}, {});

/**
 * Ensure any languages passed on the command line are valid / known.
 */
export const checkLanguages = (languages: string[]): string[] => {
  languages.forEach(k => {
    if (localeMap[k] === undefined) {
      throw new Error(`Unknown or unsupported language '${k}'`);
    }
  });
  return languages;
};
