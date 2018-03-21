import { Suite } from 'benchmark';
import { join } from 'path';
import { makeSuite, readLines } from '../util';
import { buildSchema, DecimalFormatStyleType, NumbersEngine, NumbersInternal, WrapperInternal } from '../../src';
import { EN, ES } from '../bundles';
import { ResourceBundle } from '../../src/resource/pack';

export const numberEngineSuite = makeSuite('Number Engine');

const CASES = ['1.2', '123.45', '12345.678', '69900.12', '9876543210.12345', '100000000000000'];

const STYLES: DecimalFormatStyleType[] = ['decimal', 'percent', 'short', 'long'];
const SCHEMA = buildSchema();
const INTERNAL = new NumbersInternal(SCHEMA, new WrapperInternal());
const ENGINES: { [x: string]: ResourceBundle} = {
  'en': EN,
  'es': ES
};

Object.keys(ENGINES).forEach(k => {
  CASES.forEach(n => {
    STYLES.forEach(style => {
      const opts = { style: style, group: true };
      const engine = new NumbersEngine(INTERNAL, ENGINES[k]);
      let s = engine.formatDecimal(n, opts);
      numberEngineSuite.add(`engine ${k} format decimal ${style} ${n}: ${s}`, () => {
        s = engine.formatDecimal(n, opts);
      });
    });
  });
});
