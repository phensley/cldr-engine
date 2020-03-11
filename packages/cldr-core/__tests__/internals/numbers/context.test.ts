import { Decimal } from '@phensley/decimal';
import { NumberContext } from '../../../src/internals/numbers/context';
import { parseNumberPattern } from '../../../src/parsing/number';

test('standard', () => {
  const pat = parseNumberPattern('#,##0.00#')[0];
  const ctx = new NumberContext({ minimumSignificantDigits: 1 }, 'half-even', false, false);
  ctx.setPattern(pat, false);

  expect(ctx.minInt).toEqual(1);
  expect(ctx.minFrac).toEqual(2);
  expect(ctx.maxFrac).toEqual(3);
  expect(ctx.minSig).toEqual(1);
  expect(ctx.maxSig).toEqual(-1);
  expect(ctx.useSignificant).toEqual(true);

  let n: Decimal;

  n = ctx.adjust(new Decimal('0.1000'));
  expect(n).toEqual(new Decimal('0.1'));

  n = ctx.adjust(new Decimal('0.00000'));
  expect(n).toEqual(new Decimal('0'));
});

test('standard min/max significant', () => {
  const pat = parseNumberPattern('#,##0.00#')[0];
  const ctx = new NumberContext({
    minimumSignificantDigits: 2,
    maximumSignificantDigits: 1
  }, 'half-even', false, false);
  ctx.setPattern(pat, false);

  expect(ctx.minInt).toEqual(1);
  expect(ctx.minFrac).toEqual(2);
  expect(ctx.maxFrac).toEqual(3);
  expect(ctx.minSig).toEqual(2);
  expect(ctx.maxSig).toEqual(2);
  expect(ctx.useSignificant).toEqual(true);
});

test('compact', () => {
  const pat = parseNumberPattern('#,##0.00#')[0];
  const ctx = new NumberContext({ minimumSignificantDigits: 2 }, 'half-even', true, false);
  ctx.setCompact(pat, 1, -1, 0);

  expect(ctx.minFrac).toEqual(0);
  expect(ctx.maxFrac).toEqual(0);
  expect(ctx.maxSig).toEqual(2);
  expect(ctx.minSig).toEqual(2);
  expect(ctx.useSignificant).toEqual(true);
});
