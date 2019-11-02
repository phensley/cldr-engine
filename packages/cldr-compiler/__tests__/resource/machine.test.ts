import {
  digits,
  field,
  origin,
  scope,
  scopemap,
  vector1,
  vector2,
  KeyIndexImpl,
  Origin,
  Scope
} from '@phensley/cldr-schema';

import { LanguageResolver } from '@phensley/cldr-core';
import { Encoder, EncoderMachine } from '../../src/resource/machine';
import { ResourcePack } from '../../src/resource/pack';

const parseLocale = (id: string) => ({ id, tag: LanguageResolver.resolve(id) });

const EN_US = parseLocale('en');
const EN_DE = parseLocale('en-DE');
const EN_CA = parseLocale('en-CA');

const NumberSymbolValues = ['decimal', 'group'];
const NumberSymbolIndex = new KeyIndexImpl(NumberSymbolValues);

const PluralIndex = new KeyIndexImpl(['other', 'one']);
const DigitValues = [4, 5, 6];
const FooIndex = new KeyIndexImpl(['foo', 'bar']);

const INDICES = {
  'foo': FooIndex,
  'foo-bar': FooIndex,
  'plural-key': PluralIndex,
  'number-symbol': NumberSymbolIndex,
};

const NUMBERS: Scope = scope('Numbers', 'Numbers', [
  vector1('symbols', 'number-symbol'),
  scope('currencyFormats', 'currencyFormats', [
    field('standard')
  ]),
  digits('short', 'plural-key', DigitValues),
  scopemap('group', 'foo-bar', [
    field('name')
  ]),
  vector2('plurals', 'plural-key', 'foo')
]);

const CODE = [NUMBERS];

const ORIGIN: Origin = origin(CODE, INDICES);

const SOURCE_EN_US = {
  Numbers: {
    currencyFormats: {
      standard: '¤#,##0.00'
    },
    symbols: {
      decimal: '.',
      group: ','
    },
    short: {
      other: {
        4: '0K',
        5: '00K',
        6: '000K',
      },
      one: {
        4: '0K',
        5: '00K',
        6: '000K',
      }
    },
    group: {
      foo: {
        name: 'Foo'
      },
      bar: {
        name: 'Bar'
      }
    },
    plurals: {
      other: {
        foo: 'Foos',
        bar: 'Bars'
      },
      one: {
        foo: 'Foo',
        bar: 'Bar'
      }
    }
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
    },
    short: {
      other: {
        4: '0Q',
        5: '00Q',
        6: '000Q',
      },
      one: {
        4: '0R',
        5: '00R',
        6: '000R',
      }
    },
    group: {
      foo: {
        name: 'Foo 2'
      },
      bar: {
        name: 'Bar'
      }
    },
    plurals: {
      other: {
        foo: 'Foos',
        bar: 'Bars'
      },
      one: {
        foo: 'Foo',
        bar: 'Bar'
      }
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
    },
    short: {
      other: {
        4: '0K',
        5: '00K',
        6: '000K',
      },
      one: {
        4: '0R',
        5: '00R',
        6: '000R',
      }
    },
    group: {
      foo: {
        name: 'Foo'
      },
      bar: {
        name: 'Bar 2'
      }
    },
    plurals: {
      other: {
        foo: 'Foos',
        bar: 'Bars'
      },
      one: {
        foo: 'Foo',
        bar: 'Bar'
      }
    }
  }
};

class PackEncoder implements Encoder {

  _distinct: { [x: string]: number } = {};
  _count: number = 0;
  _size: number = 0;

  constructor(private pack: ResourcePack) { }

  encode(f: string | undefined): number {
    this._count++;
    if (f !== undefined) {
      const c = this._distinct[f] || 0;
      this._distinct[f] = c + 1;
      this._size += f.length;
    }
    return this.pack.add(f === undefined ? '' : f);
  }

  count(): number {
    return this._count;
  }

  size(): number {
    return this._size;
  }

  distinct(): number {
    return Object.keys(this._distinct).length;
  }
}

test('encoding', () => {
  const pack = new ResourcePack('en', '0.1.0', '32.0.1');
  const encoder = new PackEncoder(pack);
  const machine = new EncoderMachine(encoder, true);
  const checksum = '12345';

  pack.push(EN_US);
  machine.encode(SOURCE_EN_US, ORIGIN);

  pack.push(EN_DE);
  machine.encode(SOURCE_EN_DE, ORIGIN);

  pack.push(EN_CA);
  machine.encode(SOURCE_EN_CA, ORIGIN);

  const raw = pack.render(checksum);
  const p = JSON.parse(raw);

  expect(Object.keys(p.scripts)).toEqual(['Latn']);
  const { strings, exceptions } = p.scripts.Latn;

  expect(strings).toEqual(
    // vector1 symbols
    'E_._,_' +
    // scope currency
    '¤#,##0.00_' +
    // digits short
    '0K_3_00K_3_000K_3_0R_3_00R_3_000R_3_' +
    // scopemap
    'Foo_Bar 2_' +
    // vector2 plurals
    'E_Foos_Bars_Foo_Bar');

  expect(exceptions).toEqual(
    '0K_00K_000K_Bar_,_._#,##0.00 ¤_0Q_00Q_000Q_Foo 2');
});
