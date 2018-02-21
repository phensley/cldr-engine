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

  const neg1 = {
    nodes: [NumberField.MINUS, NumberField.NUMBER, NumberField.PERCENT],
    minInt: 1,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 3,
    secGroup: 0
  };

  expect(parse('#,##0%')).toEqual([pos1, neg1]);

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

  const neg3 = {
    nodes: [NumberField.MINUS, NumberField.NUMBER],
    minInt: 1,
    maxFrac: 3,
    minFrac: 0,
    priGroup: 3,
    secGroup: 2
  };

  expect(parse('#,##,##0.###')).toEqual([pos3, neg3]);

  // "mk" short standard 12-digit
  const pos4 = {
    nodes: [NumberField.CURRENCY, '\u00a0', NumberField.NUMBER, '\u00a0милј.'],
    minInt: 3,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  };

  const neg4 = {
    nodes: [NumberField.MINUS, NumberField.CURRENCY, '\u00a0', NumberField.NUMBER, '\u00a0милј.'],
    minInt: 3,
    maxFrac: 0,
    minFrac: 0,
    priGroup: 0,
    secGroup: 0
  };

  expect(parse("¤ 000 милј'.'")).toEqual([pos4, neg4]);

  const pos5 = parse('¤000K')[0];
  expect(pos5.nodes).toEqual([NumberField.CURRENCY, NumberField.NUMBER, 'K']);
  expect(pos5.priGroup).toEqual(0);
  expect(pos5.secGroup).toEqual(0);
  expect(pos5.minInt).toEqual(3);
  expect(pos5.maxFrac).toEqual(0);
  expect(pos5.minFrac).toEqual(0);
});
