import {
  parseNumberPattern as parse,
  NumberField,
  NumberPattern
} from '../../../src/parsing/patterns/number';

test('parse', () => {
  const pos0 = {
    nodes: [NumberField.CURRENCY, NumberField.NUMBER],
    minInt: 1,
    maxFrac: 2,
    minFrac: 2,
    priGroup: 3,
    secGroup: 0
  };

  const neg0 = {
    nodes: ['(', NumberField.CURRENCY, NumberField.NUMBER, ')'],
    minInt: 1,
    maxFrac: 2,
    minFrac: 2,
    priGroup: 3,
    secGroup: 0
  };

  expect(parse('¤#,##0.00;(¤#,##0.00)')).toEqual([pos0, neg0]);

  const pos1 = {
    nodes: [NumberField.NUMBER, NumberField.PERCENT],
    minInt: 1,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 3,
    secGroup: 0
  };

  expect(parse('#,##0%')).toEqual([pos1, pos1]);

  const pos2 = {
    nodes: [NumberField.NUMBER],
    minInt: 1,
    maxFrac: 6,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  };

  const neg2 = {
    nodes: [NumberField.MINUS, NumberField.NUMBER],
    minInt: 1,
    maxFrac: 6,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  };

  expect(parse('#0.######;-#0.######')).toEqual([pos2, neg2]);

  // "ml" decimal standard. grouping is pri=3 sec=2
  const pos3 = {
    nodes: [NumberField.NUMBER],
    minInt: 1,
    maxFrac: 3,
    minFrac: 0,
    priGroup: 3,
    secGroup: 2
  };

  expect(parse('#,##,##0.###')).toEqual([pos3, pos3]);

  // "mk" short standard 12-digit
  const pos4 = {
    nodes: [NumberField.CURRENCY, '\u00a0', NumberField.NUMBER, '\u00a0милј.'],
    minInt: 3,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  };

  expect(parse("¤ 000 милј'.'")).toEqual([pos4, pos4]);

  const pos5 = parse('¤000K')[0];
  expect(pos5.format()).toEqual([NumberField.CURRENCY, NumberField.NUMBER, 'K']);
  expect(pos5.primaryGroupingSize()).toEqual(3);
  expect(pos5.secondaryGroupingSize()).toEqual(3);
  expect(pos5.minIntegerDigits()).toEqual(3);
  expect(pos5.maxFractionDigits()).toEqual(0);
  expect(pos5.minFractionDigits()).toEqual(0);
});
