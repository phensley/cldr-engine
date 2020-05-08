import { Decimal, DecimalFormatter, Part, PartsDecimalFormatter, StringDecimalFormatter } from '@phensley/decimal';

import { CurrencySpacingPatterns, NumberParams } from '../../common/private';
import { NumberField, NumberPattern } from '../../parsing/number';
import { GeneralInternals, NumberRenderer } from '../internals';
import { fastFormatDecimal } from '../../systems/numbering';
import { AbstractValue, PartsValue, StringValue } from '../../utils/render';

/**
 * @internal
 */
export abstract class NumberFormatter<R> implements NumberRenderer<R> {
  constructor(private params: NumberParams) {}

  render(
    n: Decimal,
    pattern: NumberPattern,
    currencySymbol: string,
    percentSymbol: string,
    decimalSymbol: string,
    minInt: number,
    grouping: boolean = true,
    exponent?: number,
  ): R {
    const { symbols } = this.params;
    const currency: boolean = currencySymbol !== '';

    const decimal = decimalSymbol
      ? decimalSymbol
      : currency
      ? symbols.currencyDecimal || symbols.decimal
      : symbols.decimal;
    let group = '';
    if (grouping) {
      group = symbols.group;
      if (currency) {
        group = symbols.currencyGroup || group;
      }
    }

    let { priGroup, secGroup } = pattern;
    if (priGroup <= 0) {
      priGroup = this.params.primaryGroupingSize;
    }
    if (secGroup <= 0) {
      secGroup = this.params.secondaryGroupingSize;
    }

    const formatter = this.formatter(decimal, group);
    n.format(
      formatter,
      decimal,
      group,
      minInt,
      this.params.minimumGroupingDigits,
      priGroup,
      secGroup,
      true, // zeroScale
      this.params.digits,
    );
    const formatted = formatter.render();

    const res: AbstractValue<R> = this.value();

    let haveNumber = false;
    let currencyBefore = false;
    let currencyIdx = -1;
    for (const node of pattern.nodes) {
      if (typeof node === 'string') {
        res.add('literal', node);
      } else {
        switch (node) {
          case NumberField.CURRENCY: {
            // Save the offset to the segment before or after the currency symbol.
            currencyBefore = !haveNumber;
            const i = res.length();
            res.add('currency', currencySymbol);
            const j = res.length();
            currencyIdx = currencyBefore ? j : i - 1;
            break;
          }

          case NumberField.MINUS:
            res.add('minus', symbols.minusSign);
            break;

          case NumberField.PLUS:
            res.add('plus', symbols.plusSign);
            break;

          case NumberField.NUMBER:
            res.append(formatted);
            haveNumber = true;
            break;

          case NumberField.PERCENT:
            res.add('percent', percentSymbol);
            break;

          case NumberField.EXPONENT:
            // Don't emit the exponent if undefined or zero
            if (exponent) {
              res.add('exponent', symbols.exponential);
              if (exponent < 0) {
                res.add('minus', symbols.minusSign);
              } else {
                res.add('plus', symbols.plusSign);
              }
              const exp = fastFormatDecimal(`${exponent}`, this.params.digits, 1);
              res.add('integer', exp);
              break;
            }
        }
      }
    }

    // Adjust spacing between currency symbol based on surrounding characters.
    if (currencyIdx !== -1) {
      const spacing = this.params.currencySpacing;
      const curr = res.get(currencyIdx);
      if (currencyBefore) {
        if (insertBetween(spacing.after, currencySymbol[currencySymbol.length - 1], curr[0])) {
          res.insert(currencyIdx, 'spacer', spacing.after.insertBetween);
        }
      } else {
        if (insertBetween(spacing.before, currencySymbol[0], curr[curr.length - 1])) {
          res.insert(currencyIdx + 1, 'spacer', spacing.before.insertBetween);
        }
      }
    }

    return res.render();
  }

  empty(): R {
    return this.value().render();
  }

  make(type: string, value: string): R {
    const v = this.value();
    v.add(type, value);
    return v.render();
  }

  wrap(internal: GeneralInternals, raw: string, ...args: R[]): R {
    const res: AbstractValue<R> = this.value();
    const pattern = internal.parseWrapper(raw);
    for (const n of pattern) {
      if (typeof n === 'string') {
        res.add('literal', n);
      } else {
        const v = args[n];
        // The only way the else branch could be taken is if there
        // is a mismatch between the CLDR wrapper pattern and the
        // number of arguments passed in, e.g. "{0} {1} {2}" with
        // only 2 arguments.
        /* istanbul ignore else */
        if (v !== undefined) {
          res.append(v);
        }
      }
    }
    return res.render();
  }

  abstract value(): AbstractValue<R>;
  abstract formatter(decimal: string, group: string): DecimalFormatter<R>;
}

/**
 * @internal
 */
export class StringNumberFormatter extends NumberFormatter<string> {
  value(): AbstractValue<string> {
    return new StringValue();
  }
  formatter(_decimal: string, _group: string): DecimalFormatter<string> {
    return new StringDecimalFormatter();
  }
}

/**
 * @internal
 */
export class PartsNumberFormatter extends NumberFormatter<Part[]> {
  value(): AbstractValue<Part[]> {
    return new PartsValue();
  }
  formatter(decimal: string, group: string): DecimalFormatter<Part[]> {
    return new PartsDecimalFormatter(decimal, group);
  }
}

// Unicode ranges generated in Java from general categories, and translating the
// corresponding Unicode sets.
// https://www.unicode.org/reports/tr18/#General_Category_Property
// https://www.unicode.org/reports/tr44/#General_Category_Values
// https://www.unicode.org/reports/tr18/#digit
// https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt

// eslint-disable-next-line max-len
const MATH_SYMBOL = /\u002b\u003c-\u003e\u007c\u007e\u00ac\u00b1\u00d7\u00f7\u03f6\u0606-\u0608\u2044\u2052\u207a-\u207c\u208a-\u208c\u2118\u2140-\u2144\u214b\u2190-\u2194\u219a\u219b\u21a0\u21a3\u21a6\u21ae\u21ce\u21cf\u21d2\u21d4\u21f4-\u22ff\u2308-\u230b\u2320\u2321\u237c\u239b-\u23b3\u23dc-\u23e1\u25b7\u25c1\u25f8-\u25ff\u266f\u27c0-\u27c4\u27c7-\u27e5\u27f0-\u27ff\u2900-\u2982\u2999-\u29d7\u29dc-\u29fb\u29fe-\u2aff\u2b30-\u2b44\u2b47-\u2b4c\ufb29\ufe62\ufe64-\ufe66\uff0b\uff1c-\uff1e\uff5c\uff5e\uffe2\uffe9-\uffec/;

// eslint-disable-next-line max-len
const CURRENCY_SYMBOL = /\u0024\u00a2-\u00a5\u058f\u060b\u09f2\u09f3\u09fb\u0af1\u0bf9\u0e3f\u17db\u20a0-\u20ba\ua838\ufdfc\ufe69\uff04\uffe0\uffe1\uffe5\uffe6/;

// eslint-disable-next-line max-len
const MODIFIER_SYMBOL = /\u005e\u0060\u00a8\u00af\u00b4\u00b8\u02c2-\u02c5\u02d2-\u02df\u02e5-\u02eb\u02ed\u02ef-\u02ff\u0375\u0384\u0385\u1fbd\u1fbf-\u1fc1\u1fcd-\u1fcf\u1fdd-\u1fdf\u1fed-\u1fef\u1ffd\u1ffe\u309b\u309c\ua700-\ua716\ua720\ua721\ua789\ua78a\ufbb2-\ufbc1\uff3e\uff40\uffe3/;

// eslint-disable-next-line max-len
const OTHER_SYMBOL = /\u00a6\u00a9\u00ae\u00b0\u0482\u060e\u060f\u06de\u06e9\u06fd\u06fe\u07f6\u09fa\u0b70\u0bf3-\u0bf8\u0bfa\u0c7f\u0d79\u0f01-\u0f03\u0f13\u0f15-\u0f17\u0f1a-\u0f1f\u0f34\u0f36\u0f38\u0fbe-\u0fc5\u0fc7-\u0fcc\u0fce\u0fcf\u0fd5-\u0fd8\u109e\u109f\u1390-\u1399\u1940\u19de-\u19ff\u1b61-\u1b6a\u1b74-\u1b7c\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116\u2117\u211e-\u2123\u2125\u2127\u2129\u212e\u213a\u213b\u214a\u214c\u214d\u214f\u2195-\u2199\u219c-\u219f\u21a1\u21a2\u21a4\u21a5\u21a7-\u21ad\u21af-\u21cd\u21d0\u21d1\u21d3\u21d5-\u21f3\u2300-\u2307\u230c-\u231f\u2322-\u2328\u232b-\u237b\u237d-\u239a\u23b4-\u23db\u23e2-\u23f3\u2400-\u2426\u2440-\u244a\u249c-\u24e9\u2500-\u25b6\u25b8-\u25c0\u25c2-\u25f7\u2600-\u266e\u2670-\u26ff\u2701-\u2767\u2794-\u27bf\u2800-\u28ff\u2b00-\u2b2f\u2b45\u2b46\u2b50-\u2b59\u2ce5-\u2cea\u2e80-\u2e99\u2e9b-\u2ef3\u2f00-\u2fd5\u2ff0-\u2ffb\u3004\u3012\u3013\u3020\u3036\u3037\u303e\u303f\u3190\u3191\u3196-\u319f\u31c0-\u31e3\u3200-\u321e\u322a-\u3247\u3250\u3260-\u327f\u328a-\u32b0\u32c0-\u32fe\u3300-\u33ff\u4dc0-\u4dff\ua490-\ua4c6\ua828-\ua82b\ua836\ua837\ua839\uaa77-\uaa79\ufdfd\uffe4\uffe8\uffed\uffee\ufffc\ufffd/;

// See Nd general category here:
// https://www.unicode.org/Public/UCD/latest/ucd/extracted/DerivedNumericType.txt
// eslint-disable-next-line max-len
const DECIMAL_DIGIT_NUMBER = /\u0030-\u0039\u0660-\u0669\u06f0-\u06f9\u07c0-\u07c9\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef\u0b66-\u0b6f\u0be6-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef\u0d66-\u0d6f\u0e50-\u0e59\u0ed0-\u0ed9\u0f20-\u0f29\u1040-\u1049\u1090-\u1099\u17e0-\u17e9\u1810-\u1819\u1946-\u194f\u19d0-\u19d9\u1a80-\u1a89\u1a90-\u1a99\u1b50-\u1b59\u1bb0-\u1bb9\u1c40-\u1c49\u1c50-\u1c59\ua620-\ua629\ua8d0-\ua8d9\ua900-\ua909\ua9d0-\ua9d9\uaa50-\uaa59\uabf0-\uabf9\uff10-\uff19/;

/**
 * @internal
 */
export const RE_SYMBOL = new RegExp(
  `^[${MATH_SYMBOL.source}${CURRENCY_SYMBOL.source}${MODIFIER_SYMBOL.source}${OTHER_SYMBOL.source}]`,
);

/**
 * @internal
 */
export const RE_DIGIT = new RegExp(`^[${DECIMAL_DIGIT_NUMBER.source}]`);

/**
 * @internal
 */
export const CURRENCY_SPACING_MATCHERS: { [x: string]: (s: string) => boolean } = {
  // Exhaustive list of currency spacing matchers from scanning.
  // find cldr-data -name numbers.json -exec egrep -e '(currencyMatch|surroundingMatch)' {} \;|sort |uniq -c

  '[:digit:]': (s: string) => RE_DIGIT.test(s),
  '[:^S:]': (s: string) => !RE_SYMBOL.test(s),
};

const insertBetween = (spacing: CurrencySpacingPatterns, currency: string, surrounding: string): boolean => {
  return (
    CURRENCY_SPACING_MATCHERS[spacing.currencyMatch](currency) &&
    CURRENCY_SPACING_MATCHERS[spacing.surroundingMatch](surrounding)
  );
};
