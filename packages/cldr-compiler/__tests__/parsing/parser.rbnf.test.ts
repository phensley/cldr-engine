import { parseRBNF } from '../../src/parsing';

const parse = (s: string) => parseRBNF(s).get()._1;

test('literals', () => {
  expect(parse('million;')).toEqual([
    { kind: 'literal', n: 'million' }
  ]);

  expect(parse(' million;')).toEqual([
    { kind: 'literal', n: ' million' }
  ]);

  expect(parse('\' million;')).toEqual([
    { kind: 'literal', n: ' million' }
  ]);
});

test('plurals', () => {
  let s: string;

  s = '$(cardinal,one{Millioun}other{Milliounen})$;';
  expect(parse(s)).toEqual([
    { kind: 'cardinal', n: [
        { category: 'one', n: 'Millioun' },
        { category: 'other', n: 'Milliounen' }
      ]
    }
  ]);
});

test('subs', () => {
  let s: string;

  s = '←← point →→;';
  expect(parse(s)).toEqual([
    { kind: 'sub-left' },
    { kind: 'literal', n: ' point '},
    { kind: 'sub-right' }
  ]);

  s = '←%spellout-cardinal←點→→→;';
  expect(parse(s)).toEqual([
    { kind: 'apply-left-rule', n: '%spellout-cardinal' },
    { kind: 'literal', n: '點' },
    { kind: 'sub-right-3' }
  ]);

  s = '←%%spellout-fraction-digits←←;';
  expect(parse(s)).toEqual([
    { kind: 'apply-left-2-rule', n: '%%spellout-fraction-digits' }
  ]);
});

test('unch', () => {
  let s: string;

  s = '=%%rule-name=;';
  expect(parse(s)).toEqual([
    { kind: 'apply-unch-rule', n: '%%rule-name' }
  ]);
});

test('number format', () => {
  let s: string;

  s = '=#,##0.#=;';
  expect(parse(s)).toEqual([
    { kind: 'apply-unch-numfmt', n: '#,##0.#' }
  ]);

  s = '0* ←#,##0←;';
  expect(parse(s)).toEqual([
    { kind: 'literal', n: '0* ' },
    { kind: 'apply-left-numfmt', n: '#,##0' }
  ]);

  s = '0* ←#,##0←←;';
  expect(parse(s)).toEqual([
    { kind: 'literal', n: '0* ' },
    { kind: 'apply-left-2-numfmt', n: '#,##0' }
  ]);

  s = '−ke-→#,##0→;';
  expect(parse(s)).toEqual([
    { kind: 'literal', n: '−ke-' },
    { kind: 'apply-right-numfmt', n: '#,##0' }
  ]);

  s = '0* ←#,##0←←;';
  expect(parse(s)).toEqual([
    { kind: 'literal', n: '0* ' },
    { kind: 'apply-left-2-numfmt', n: '#,##0' }
  ]);
});

test('rules', () => {
  let s: string;

  s = '[←%spellout-cardinal-feminine-ablative← $(cardinal,one{целой}other{целыми})$ ]→%%fractions-feminine-ablative→;';
  expect(parse(s)).toEqual([
    { kind: 'optional', n: [
      { kind: 'apply-left-rule', n: '%spellout-cardinal-feminine-ablative' },
      { kind: 'literal', n: ' '},
      { kind: 'cardinal', n: [
        { category: 'one', n: 'целой' },
        { category: 'other', n: 'целыми' }
      ]},
      { kind: 'literal', n: ' '},
    ] },
    { kind: 'apply-right-rule', n: '%%fractions-feminine-ablative' }
  ]);
});
