import {
  Choice,
  Origin,
  Scope,
  digits,
  field,
  objectmap,
  origin,
  scope,
  scopemap
} from '@phensley/cldr-schema';

import { Locale, LanguageResolver } from '@phensley/cldr-core';
import { Encoder, EncoderMachine } from '../../src/resource/machine';
import { ResourcePack } from '../../src/resource/pack';

const parseLocale = (id: string) => ({ id, tag: LanguageResolver.resolve(id) });

const EN_US = parseLocale('en');
const EN_DE = parseLocale('en-DE');
const EN_CA = parseLocale('en-CA');

const NumberSymbolValues = ['decimal', 'group'];

const NUMBERS: Scope = scope('Numbers', 'Numbers', [
  objectmap('symbols', NumberSymbolValues),

  scope('currencyFormats', 'currencyFormats', [
    field('standard', 'standard')
  ])
]);

const ORIGIN: Origin = origin([
  NUMBERS
]);

const SOURCE_EN_US = {
  Numbers: {
    currencyFormats: {
      standard: '¤#,##0.00'
    },
    symbols: {
      decimal: '.',
      group: ','
    },
  }
};

const SOURCE_EN_DE = {
  Numbers: {
    currencyFormats: {
      standard: '#,##0.00 ¤'
    },
    symbols: {
      decimal: ',',
      group: '.'
    }
  }
};

const SOURCE_EN_CA = {
  Numbers: {
    currencyFormats: {
      standard: '¤#,##0.00'
    },
    symbols: {
      decimal: '.',
      group: ','
    }
  }
};

class PackEncoder implements Encoder {

  constructor(private pack: ResourcePack) { }

  encode(f: string | undefined): number {
    return this.pack.add(f === undefined ? '' : f);
  }
}

test('encoding', () => {
  const pack = new ResourcePack('en', '0.1.0', '32.0.1');
  const encoder = new PackEncoder(pack);
  const machine = new EncoderMachine(encoder);

  pack.push(EN_US);
  machine.encode(SOURCE_EN_US, ORIGIN);

  pack.push(EN_DE);
  machine.encode(SOURCE_EN_DE, ORIGIN);

  pack.push(EN_CA);
  machine.encode(SOURCE_EN_CA, ORIGIN);

  const raw = pack.render();
  const p = JSON.parse(raw);

  expect(Object.keys(p.scripts)).toEqual(['Latn']);
  const { strings, exceptions, regions } = p.scripts.Latn;
  expect(strings).toEqual('.\t,\t¤#,##0.00');
  expect(exceptions).toEqual(',\t.\t#,##0.00 ¤');
});
