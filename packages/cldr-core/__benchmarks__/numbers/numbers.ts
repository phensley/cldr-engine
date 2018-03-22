import { Suite } from 'benchmark';
import { join } from 'path';
import { makeSuite, readLines } from '../util';
import { DecimalFormatStyleType, InternalsImpl, NumbersImpl, PrivateApiImpl } from '../../src';
import { EN, ES } from '../bundles';
import { Bundle } from '../../src/resource';

export const numberEngineSuite = makeSuite('Number Engine');

const CASES = ['1.2', '123.45', '12345.678', '69900.12', '9876543210.12345', '100000000000000'];
const STYLES: DecimalFormatStyleType[] = ['decimal', 'percent', 'short', 'long'];
const INTERNALS = new InternalsImpl();
const BUNDLES: { [x: string]: Bundle} = {
  'en': EN,
  'es': ES
};

Object.keys(BUNDLES).forEach(k => {
  CASES.forEach(n => {
    STYLES.forEach(style => {
      const opts = { style: style, group: true };
      const privateApi = new PrivateApiImpl(BUNDLES[k], INTERNALS);
      const engine = new NumbersImpl(BUNDLES[k], INTERNALS, privateApi);
      let s = engine.formatDecimal(n, opts);
      numberEngineSuite.add(`engine ${k} format decimal ${style} ${n}: ${s}`, () => {
        s = engine.formatDecimal(n, opts);
      });
    });
  });
});
