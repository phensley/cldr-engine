import { NumberParams } from './options';
import { Decimal, Part } from '../../types';
import { NumberPattern, NumberField } from '../../parsing/patterns/number';
import { WrapperInternal } from '../wrapper';

export interface Renderer<T> {
  render(n: Decimal, pattern: NumberPattern,
    params: NumberParams,
    currency: string, percent: string, group: boolean | undefined, minInt: number): T;
  wrap(internal: WrapperInternal, pattern: string, ...args: T[]): T;
  part(type: string, value: string): T;
  empty(): T;
}

/**
 * Renders each node in the NumberPattern to a string.
 */
export class StringRenderer implements Renderer<string> {
  render(n: Decimal, pattern: NumberPattern,
    params: NumberParams,
    currency: string, percent: string, group: boolean | undefined, minInt: number): string {

    let s = '';
    for (const node of pattern.nodes) {
      if (typeof node === 'string') {
        s += node;
      } else {
        switch (node) {
        case NumberField.CURRENCY:
          s += currency;
          break;

        case NumberField.MINUS:
          s += params.symbols.minusSign;
          break;

        case NumberField.NUMBER:
          s += n.format(
            params.symbols.decimal,
            group ? params.symbols.group : '',
            minInt,
            params.minimumGroupingDigits,
            pattern.priGroup,
            pattern.secGroup
          );
          break;

        case NumberField.PERCENT:
          s += percent;
          break;
        }
      }
    }
    return s;
  }

  wrap(internal: WrapperInternal, pattern: string, ...args: string[]): string {
    return internal.format(pattern, args);
  }

  part(type: string, value: string): string {
    return value;
  }

  empty(): string {
    return '';
  }
}

export class PartsRenderer implements Renderer<Part[]> {
  render(n: Decimal, pattern: NumberPattern,
    params: NumberParams,
    currency: string, percent: string, group: boolean | undefined, minInt: number): Part[] {

    let r: Part[] = [];
      for (const node of pattern.nodes) {
        if (typeof node === 'string') {
          r.push({ type: 'literal', value: node });
        } else {
          switch (node) {
          case NumberField.CURRENCY:
            r.push({ type: 'currency', value: currency });
            break;

          case NumberField.MINUS:
            r.push({ type: 'minus', value: params.symbols.minusSign });
            break;

          case NumberField.NUMBER:
            r = r.concat(n.formatParts(
              params.symbols.decimal,
              group ? params.symbols.group : '',
              minInt,
              params.minimumGroupingDigits,
              pattern.priGroup,
              pattern.secGroup
            ));
            break;

          case NumberField.PERCENT:
            r.push({ type: 'percent', value: percent });
            break;
          }
        }
      }
    return r;
  }

  wrap(internal: WrapperInternal, pattern: string, ...args: Part[][]): Part[] {
    return internal.formatParts(pattern, args);
  }

  part(type: string, value: string): Part[] {
    return [{ type, value }];
  }

  empty(): Part[] {
    return [];
  }
}

export const STRING_RENDERER = new StringRenderer();

export const PARTS_RENDERER = new PartsRenderer();
