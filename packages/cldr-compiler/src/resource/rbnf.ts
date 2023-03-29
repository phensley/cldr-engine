import { JSONRoot, RBNFCollector, RBNFEncoder, RBNFSymbolExtractor } from '../rbnf';
import { FrequencySet } from '../utils';
import { parseLanguageTag } from '@phensley/cldr-core';

/**
 * Collect and pack rules for the given locales.
 */
export class RBNFPacker {
  constructor(private collector: RBNFCollector) {}

  /**
   * Pack the RBNF rulesets into JSON form.
   */
  pack(lang: string): string {
    const locales: any = {};
    const symbols = new FrequencySet<string>();
    const numbers = new FrequencySet<string>();

    const ids = this.collector.langs.get(lang);
    if (ids === undefined) {
      return JSON.stringify({ locales, symbols: '', numbers: '' });
    }

    // Extract and populate the frequency sets.
    ids.forEach((id) => {
      const raw = this.collector.locales.get(id)!;
      const extractor = new RBNFSymbolExtractor(symbols, numbers);
      extractor.extract(raw);
    });

    ids.sort().forEach((id) => {
      const raw = this.collector.locales.get(id)!;

      // Encode final JSON representation
      const enc = new RBNFEncoder(symbols, numbers);
      const r = enc.encode(raw);
      locales[id] = r;
    });

    const out = {
      locales,
      symbols: symbols.sort().join('_'),
      numbers: numbers.sort().join('_'),
    };
    return JSON.stringify(out);
  }

  report(): string {
    let r = '';

    let allids: string[] = [];
    this.collector.locales.forEach((_, id) => allids.push(id));

    const seen: Set<string> = new Set();
    allids = ['root'].concat(allids.filter((i) => i !== 'root').sort());
    for (const id of allids) {
      // Same rule are defined for each script and region of a language, so only
      // list rules at the language level.
      const lang = id === 'root' ? 'root' : parseLanguageTag(id).language();
      if (seen.has(lang)) {
        continue;
      }

      seen.add(lang);

      const name = id === 'root' ? 'Global' : lang;
      r += `${name}:\n`;
      const raw = this.collector.locales.get(id);
      if (!raw) {
        console.log(`rbnf ${id} skipping`);
        continue;
      }

      const names: string[] = [];

      // Only show numbering systems at the root level
      const keys: (keyof JSONRoot)[] = id === 'root' ? ['NumberingSystemRules'] : ['OrdinalRules', 'SpelloutRules'];

      for (const key of keys) {
        const rules = raw[key];
        if (rules) {
          Object.keys(rules)
            .filter((k) => !rules[k].private)
            .forEach((n) => names.push(n));
        }
      }
      r +=
        names
          .sort()
          .map((n) => `   ${n}`)
          .join('\n') + '\n\n';
    }
    return r;
  }
}
