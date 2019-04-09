import { languageBundle, INTERNALS } from '../../_helpers';
import { NumberParams } from '../../../src/common/private';
import { NumberParamsCache } from '../../../src/api/private';

const LATN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const getCache = (tag: string) =>
  new NumberParamsCache(languageBundle(tag), INTERNALS);

test('number systems', () => {
  const bundle = languageBundle('zh');
  const res = INTERNALS.schema.Numbers.numberSystems.mapping(bundle);
  expect(res.finance).toEqual('hansfin');
});

test('number params cache', () => {
  let cache: NumberParamsCache;
  let params: NumberParams;

  cache = getCache('en');
  params = cache.getNumberParams('finance');
  expect(params.digits).toEqual(LATN_DIGITS);
  expect(params.primaryGroupingSize).toEqual(3);

  // NOTE: hansfin not implemented, so falls back to 'latn'
  cache = getCache('zh');
  params = cache.getNumberParams('finance');
  expect(params.digits).toEqual(LATN_DIGITS);
  expect(params.primaryGroupingSize).toEqual(3);

  cache = getCache('fa-AF');
  params = cache.getNumberParams('finance');
  expect(params.digits).toEqual(
    [ '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹' ]);
  expect(params.primaryGroupingSize).toEqual(3);
});
