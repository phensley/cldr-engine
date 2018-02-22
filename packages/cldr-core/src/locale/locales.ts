import { Locale } from './locale';
import { LanguageResolver } from './resolver';
import { availableLocalesRaw } from './autogen.locales';

let allLocales: Locale[];

export const availableLocales = (): Locale[] => {
  if (allLocales === undefined) {
    allLocales = availableLocalesRaw.split('|').map(id => {
      const tag = LanguageResolver.resolve(id);
      return { id, tag } as Locale;
    });
  }
  return allLocales.slice();
};
