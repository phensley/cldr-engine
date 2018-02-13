import { parseNumberPattern as parse, NumberField, NumberPattern } from '../../../src/parsing/patterns/number';

test('parse', () => {
  expect(parse('(¤#,##0.00)')).toEqual({
    nodes: ['(', NumberField.CURRENCY, NumberField.NUMBER, ')'],
    minInt: 1,
    maxFrac: 2,
    minFrac: 2,
    priGroup: 3,
    secGroup: 0
  });

  expect(parse('#,##0%')).toEqual({
    nodes: [NumberField.NUMBER, NumberField.PERCENT],
    minInt: 1,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 3,
    secGroup: 0
  });

  expect(parse('-#0.######')).toEqual({
    nodes: [NumberField.MINUS, NumberField.NUMBER],
    minInt: 1,
    maxFrac: 6,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  });

  // "ml" decimal standard. grouping is pri=3 sec=2
  expect(parse('#,##,##0.###')).toEqual({
    nodes: [NumberField.NUMBER],
    minInt: 1,
    maxFrac: 3,
    minFrac: 0,
    priGroup: 3,
    secGroup: 2
  });

  // "mk" short standard 12-digit
  expect(parse("¤ 000 милј'.'")).toEqual({
    nodes: [NumberField.CURRENCY, '\u00a0', NumberField.NUMBER, '\u00a0милј.'],
    minInt: 3,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  });

  const pattern = parse('¤000K');
  expect(pattern.format()).toEqual([NumberField.CURRENCY, NumberField.NUMBER, 'K']);
  expect(pattern.primaryGroupingSize()).toEqual(3);
  expect(pattern.secondaryGroupingSize()).toEqual(3);
  expect(pattern.minIntegerDigits()).toEqual(3);
  expect(pattern.maxFractionDigits()).toEqual(0);
  expect(pattern.minFractionDigits()).toEqual(0);
});
