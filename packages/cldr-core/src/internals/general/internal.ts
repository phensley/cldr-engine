import {
  ContextTransformFieldType,
  ContextType,
  LayoutSchema,
  ListPatternsSchema,
  ListPatternPositionType,
  Vector1Arrow,
} from '@phensley/cldr-types';

import { Part } from '@phensley/decimal';
import { Cache } from '@phensley/cldr-utils';

import { GeneralInternals, Internals } from '../../internals/internals';
import { Bundle } from '../../resource';
import { ListPatternType } from '../../common';
import { ContextTransformInfo } from '../../common/private';
import { AbstractValue, PartsValue, StringValue } from '../../utils/render';
import { parseWrapperPattern, WrapperNode } from '../../parsing/wrapper';

export class GeneralInternalsImpl implements GeneralInternals {

  private layout: LayoutSchema;
  private listPatterns: ListPatternsSchema;

  private wrapperPatternCache: Cache<WrapperNode[]>;

  constructor(private internals: Internals, cacheSize: number = 50) {
    const schema = internals.schema;
    this.layout = schema.Layout;
    this.listPatterns = schema.ListPatterns;
    this.wrapperPatternCache = new Cache(parseWrapperPattern, cacheSize);
  }

  characterOrder(bundle: Bundle): string {
    return this.layout.characterOrder.get(bundle);
  }

  lineOrder(bundle: Bundle): string {
    return this.layout.lineOrder.get(bundle);
  }

  /**
   * Contextually transform a string,
   */
  contextTransform(value: string, info: ContextTransformInfo,
    context?: ContextType, field?: ContextTransformFieldType): string {

    if (!value) {
      return value;
    }

    const flag = field ? info[field] : '';
    let title = false;
    switch (context) {
      case 'begin-sentence':
        title = true;
        break;
      case 'standalone':
        title = flag !== undefined && (flag[0] === 'T');
        break;
      case 'ui-list-or-menu':
        title = flag !== undefined && flag[1] === 'T';
        break;
    }

    // TODO: in Unicode "title case" is slightly different than "upper case"
    // but for now we use `toUpperCase` the first character.
    return title ? value[0].toUpperCase() + value.slice(1) : value;
  }

  formatList(bundle: Bundle, items: string[], type: ListPatternType): string {
    return this.formatListImpl(bundle, new StringValue(), items, type);
  }

  formatListToParts(bundle: Bundle, items: string[], type: ListPatternType): Part[] {
    const parts: Part[][] = items.map(i => ([{ type: 'item', value: i }]));
    return this.formatListImpl(bundle, new PartsValue(), parts, type);
  }

  formatListImpl<R>(bundle: Bundle, value: AbstractValue<R>, items: R[], type: ListPatternType): R {
    const pattern = this.selectListPattern(type).mapping(bundle);
    let len = items.length;
    if (len < 2) {
      return len === 1 ? items[0] : value.empty();
    }

    if (len === 2) {
      return this._wrap(pattern.two, value, [items[0], items[1]]);
    }

    let res = this._wrap(pattern.end, value, [items[len - 2], items[len - 1]]);
    len -= 2;
    while (len-- > 1) {
      res = this._wrap(pattern.middle, value, [items[len], res]);
    }
    return this._wrap(pattern.start, value, [items[0], res]);
  }

  formatWrapper(format: string, args: string[]): string {
    const pattern = this.wrapperPatternCache.get(format);
    let res = '';
    for (const node of pattern) {
      if (typeof node === 'string') {
        res += node;
      } else {
        const s = args[node];
        if (s) {
          res += s;
        }
      }
    }
    return res;
  }

  parseWrapper(raw: string): WrapperNode[] {
    return this.wrapperPatternCache.get(raw);
  }

  private _wrap<R>(pattern: string, value: AbstractValue<R>, args: R[]): R {
    const wrapper = this.internals.general.parseWrapper(pattern);
    value.wrap(wrapper, args);
    return value.render();
  }

  private selectListPattern(type: ListPatternType): Vector1Arrow<ListPatternPositionType> {
    const p = this.listPatterns;
    switch (type) {
      case 'unit-long':
        return p.unitLong;
      case 'unit-narrow':
        return p.unitNarrow;
      case 'unit-short':
        return p.unitShort;
      case 'or':
        return p.or;
      case 'and-short':
        return p.andShort;
      case 'and':
      default:
        return p.and;
    }
  }

}
