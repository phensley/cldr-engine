import { unitsApi } from '../../_helpers';
import { coerceDecimal, Decimal, DecimalArg, MathContext } from '../../../lib';

const dec = (n: DecimalArg) => coerceDecimal(n);

test('available units', () => {
  const api = unitsApi('en');
  let d: Decimal | undefined;
  let ctx: MathContext;

  ctx = { precision: 5 };
  d = api.convertDecimal(1, 'foot', 'yard', { ctx });
  expect(d).toEqual(dec('0.33333'));

  d = api.convertDecimal(1, 'yard', 'foot', { ctx });
  expect(d).toEqual(dec('3'));

  d = api.convertDecimal(2, 'foot', 'yard', { ctx });
  expect(d).toEqual(dec('0.66667'));

  d = api.convertDecimal(2, 'yard', 'foot', { ctx });
  expect(d).toEqual(dec('6'));
});
