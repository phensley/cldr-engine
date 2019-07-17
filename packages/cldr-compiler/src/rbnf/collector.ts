import * as fs from 'fs';
import * as path from 'path';

import { getSupplemental } from '../cldr';
import { availableLocales, parseLanguageTag, LanguageResolver } from '@phensley/cldr-core';
import { JSONRoot, JSONRootKey } from './json';

// collect and organize rbnf rules

const RE_FILE = /^[^\.].+\.json/;

const KEYS: JSONRootKey[] = ['OrdinalRules', 'SpelloutRules'];

/**
 * Load all RBNF rulesets, filling in missing pieces, and separating them
 * into global and locale-specific groups.
 */
export class RBNFCollector {

  /**
   * Mapping of language to locale ids
   * RBNF rules that are mapped to a global name ('hansfin', 'jpanyear', etc)
   * will be mapped to the 'root' language and stored in the core library.
   * We do this to simplify access when a numbering system is used by more than
   * one language, e.g. 'zh-Hant' and 'yue' both use 'hantfin' which is mapped to
   * 'zh/SpelloutRules/spellout-cardinal-financial'
   */
  readonly langs: Map<string, string[]> = new Map();

  /**
   * Additional algorithmic numbering systems available in a given locale.
   */
  readonly systems: Map<string, string[]> = new Map();

  /**
   * RBNF rules broken out by locale
   */
  readonly locales: Map<string, JSONRoot> = new Map();

  /**
   * Locales that are part of the core library.
   */
  readonly core: string[] = [];

  /**
   * Load all RBNF rulesets.
   */
  load(): void {
    const dir = path.join(__dirname, '../../data/patches/rbnf');
    const files = fs.readdirSync(dir).filter(f => RE_FILE.test(f));
    const res: Map<string, JSONRoot> = new Map<string, JSONRoot>();

    const ids: string[] = [];
    for (const file of files) {
      const p = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(p, { encoding: 'utf-8' })) as JSONRoot;
      if (!data.SpelloutRules && !data.OrdinalRules) {
        continue;
      }

      const { name } = path.parse(file);
      let id = name;
      if (name !== 'root') {
        // compact each tag to language-script with region if specified
        const tag = parseLanguageTag(name);
        const max = LanguageResolver.resolve(name);
        id = `${max.language()}-${max.script()}`;
        if (tag.hasRegion()) {
          id = `${id}-${max.region()}`;
        }
      }
      res.set(id, data);
      ids.push(id);
    }

    res.forEach((_, id) => this.populate(res, id));

    // Fill in the locales that have no RBNF mapping.
    for (const locale of availableLocales()) {
      const { tag } = locale;
      const id = `${tag.language()}-${tag.script()}`;
      if (res.has(id)) {
        continue;
      }
      // Default to 'en-Latn' spellout
      res.set(id, res.get('en-Latn')!);
      ids.push(id);
    }

    this.core.push('root');

    // Identify the rbnf rulesets that are globally-accessible. We need to
    // ensure that each locale that requires one of these has the correct
    // set of rbnf rulesets in its resource bundle.
    const { NumberingSystems } = getSupplemental();

    Object.keys(NumberingSystems).forEach(k => {
      const sys = NumberingSystems[k];
      if (sys._type !== 'algorithmic') {
        return;
      }
      if (sys._rules.indexOf('/SpelloutRules') === -1) {
        return;
      }
      const parts = sys._rules.split('/');
      const tag = LanguageResolver.resolve(parts[0]);
      const id = `${tag.language()}-${tag.script()}`;

      if (!this.core.includes(id)) {
        this.core.push(id);
      }

      // Map numbering systems to a spellout locale id
      const set = this.systems.get(id) || [];
      set.push(k);
      this.systems.set(id, set);
    });

    // Map each spellout id to the language bundle that should contain it
    for (const id of ids) {
      this.locales.set(id, res.get(id)!);

      this.locales.set(id, res.get(id)!);
      const lang = id === 'root' || this.core.includes(id) ? 'root' : parseLanguageTag(id).language();
      const map = this.langs.get(lang) || [];
      map.push(id);
      this.langs.set(lang, map);
    }
  }

  /**
   * Fill in missing rulesets from parent locales. We do this here
   * to simplify lookups at runtime.
   */
  populate(groups: Map<string, JSONRoot>, id: string): void {
    const group = groups.get(id);
    if (!group) {
      return;
    }
    const tag = parseLanguageTag(id);
    for (const key of KEYS) {
      const parents = ['root'];
      const rulesets = group[key];
      if (rulesets === undefined) {
        if (tag.hasRegion()) {
          parents.unshift(`${tag.language()}-${tag.script()}`);
        }

        // Patch in the rulesets from a parent
        for (const parent of parents) {
          const tmp = groups.get(parent);
          if (tmp && tmp[key]) {
            group[key] = tmp[key];
            break;
          }
        }
      }
    }
  }

}
