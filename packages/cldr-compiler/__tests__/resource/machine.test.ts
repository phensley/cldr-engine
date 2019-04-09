import {
  digits,
  field,
  origin,
  scope,
  scopemap,
  vector1,
  vector2,
  KeyIndex,
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
const NumberSymbolIndex = new KeyIndex(NumberSymbolValues);

const PluralIndex = new KeyIndex(['other', 'one']);
const DigitValues = [4, 5, 6];
const FooIndex = new KeyIndex(['foo', 'bar']);

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

  pack.push(EN_US);
  machine.encode(SOURCE_EN_US, ORIGIN);

  pack.push(EN_DE);
  machine.encode(SOURCE_EN_DE, ORIGIN);

  pack.push(EN_CA);
  machine.encode(SOURCE_EN_CA, ORIGIN);

  const raw = pack.render();
  const p = JSON.parse(raw);

  expect(Object.keys(p.scripts)).toEqual(['Latn']);
  const { strings, exceptions } = p.scripts.Latn;

  expect(strings).toEqual(
    // vector1 symbols
    'E\t.\t,\t' +
    // scope currency
    '¤#,##0.00\t' +
    // digits short
    '0K\t3\t00K\t3\t000K\t3\t0R\t3\t00R\t3\t000R\t3\t' +
    // scopemap plus undefined
    'Foo\tBar 2\t\t' +
    // vector2 plurals
    'E\tFoos\tBars\tFoo\tBar');

  expect(exceptions).toEqual(
    '0K\t00K\t000K\tBar\t,\t.\t#,##0.00 ¤\t0Q\t00Q\t000Q\tFoo 2');
});
