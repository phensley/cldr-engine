import { RBNFCollector, RBNFEncoder, RBNFSymbolExtractor } from '../rbnf';
import { FrequencySet } from '../utils';

/**
 * Collect and pack rules for the given locales.
 */
export class RBNFPacker {

  constructor(private collector: RBNFCollector) { }

  /**
   * Pack the RBNF rulesets into JSON form.
   */
  pack(lang: string): string {
    const symbols = new FrequencySet<string>();
    const numbers = new FrequencySet<string>();

    let ids = this.collector.langs.get(lang);
    if (ids === undefined) {
      ids = this.collector.langs.get('en')!;
    }

    // Extract and populate the frequency sets.
    ids.forEach(id => {
      const raw = this.collector.locales.get(id)!;
      const extractor = new RBNFSymbolExtractor(symbols, numbers);
      extractor.extract(raw);
    });

    const locales: any = {};
    ids.forEach(id => {
      const raw = this.collector.locales.get(id)!;

      // Encode final JSON representation
      const enc = new RBNFEncoder(symbols, numbers);
      const r = enc.encode(raw);
      locales[id] = r;
    });

    const out = {
      locales,
      symbols: symbols.sort().join('\t'),
      numbers: numbers.sort().join('\t')
    };
    return JSON.stringify(out);
  }

}
