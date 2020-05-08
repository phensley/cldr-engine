import { LanguageTag } from '@phensley/language-tag';
import { Locale } from '@phensley/locale';
import { rawLocales } from './autogen.locales';

const enum Flags {
  LANG = 1,
  SCRIPT = 2,
  REGION = 4,
  VARIANT = 8,
}

const allLocales: Locale[] = [];

/**
 * @public
 */
export const availableLocales = (): Locale[] => {
  if (!allLocales.length) {
    const k = Object.keys;
    const a: any = rawLocales;
    k(a).forEach((l) => {
      const b = a[l];
      k(b).forEach((s) => {
        const c = b[s];
        const e = c.length - 1;
        const re = c[e].split(' ');
        for (let i = 0; i < re.length; i++) {
          const f = c[i] as number;
          const x: string[] = [];
          /* istanbul ignore else */
          if (f & Flags.LANG) {
            x.push(l);
          }
          if (f & Flags.SCRIPT) {
            x.push(s);
          }
          let r = re[i];
          let v: string | undefined;
          const _v = f & Flags.VARIANT;
          if (_v) {
            const p = r.split('-');
            r = p[0];
            v = p[1];
          }
          if (f & Flags.REGION) {
            x.push(r);
          }
          if (_v) {
            x.push(v!);
          }
          allLocales.push({
            id: x.join('-'),
            tag: new LanguageTag(l, s, r, v),
          });
        }
      });
    });
  }
  return allLocales;
};
