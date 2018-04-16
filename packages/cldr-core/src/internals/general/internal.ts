import {
  AltType,
  CharacterOrderType,
  LayoutSchema,
  LineOrderType,
  ListPattern,
  ListPatternsSchema,
  NamesSchema,
  Schema,
  ScriptIdType,
  RegionIdType
} from '@phensley/cldr-schema';

import { Internals } from '../../internals';
import { Bundle } from '../../resource';
import { ListPatternType } from '../../common';
import { Part } from '../../types';
import { GeneralInternals, WrapperInternals } from '..';

export class GeneralInternalsImpl implements GeneralInternals {

  protected layout: LayoutSchema;
  protected listPatterns: ListPatternsSchema;
  protected names: NamesSchema;

  constructor(readonly internals: Internals) {
    const schema = internals.schema;
    this.layout = schema.Layout;
    this.names = schema.Names;
    this.listPatterns = schema.ListPatterns;
  }

  characterOrder(bundle: Bundle): string {
    return this.layout.characterOrder(bundle);
  }

  lineOrder(bundle: Bundle): string {
    return this.layout.lineOrder(bundle);
  }

  formatList(bundle: Bundle, items: string[], type: ListPatternType): string {
    const pattern = this.selectListPattern(bundle, type);
    let len = items.length;
    if (len < 2) {
      return len === 1 ? items[0] : '';
    }
    const wrapper = this.internals.wrapper;
    if (len === 2) {
      return wrapper.format(pattern.two, items);
    }
    // We have at least 3 items. Format from tail to head.
    let res = wrapper.format(pattern.end, [items[len - 2], items[len - 1]]);
    len -= 2;
    while (len-- > 1) {
      res = wrapper.format(pattern.middle, [items[len], res]);
    }
    return wrapper.format(pattern.start, [items[0], res]);
  }

  formatListToParts(bundle: Bundle, items: string[], type: ListPatternType): Part[] {
    const parts: Part[][] = items.map(i => ([{ type: 'item', value: i }]));
    return this.formatListToPartsImpl(bundle, parts, type);
  }

  getScriptDisplayName(bundle: Bundle, code: string): string {
    const id = code as ScriptIdType;
    return this.names.scripts.displayName.get(bundle, id);
  }

  getRegionDisplayName(bundle: Bundle, code: string, alt: AltType = 'none'): string {
    const id = code as RegionIdType;
    const name = this.names.regions.displayName.get(bundle, alt, id);
    // Fall back if preferred form is not available
    return name === '' ? this.names.regions.displayName.get(bundle, 'none', id) : name;
  }

  formatListToPartsImpl(bundle: Bundle, items: Part[][], type: ListPatternType): Part[] {
    const pattern = this.selectListPattern(bundle, type);
    let len = items.length;
    if (len < 2) {
      return len === 1 ? items[0] : [];
    }

    const wrapper = this.internals.wrapper;
    if (len === 2) {
      return wrapper.formatParts(pattern.two, [items[0], items[1]]);
    }

    // We have at least 3 items. Format from tail to head.
    let res = wrapper.formatParts(pattern.end, [items[len - 2], items[len - 1]]);
    len -= 2;
    while (len-- > 1) {
      res = wrapper.formatParts(pattern.middle, [items[len], res]);
    }
    return wrapper.formatParts(pattern.start, [items[0], res]);
  }

  protected selectListPattern(bundle: Bundle, type: ListPatternType): ListPattern {
    switch (type) {
      case 'unit-long':
        return this.listPatterns.unitLong(bundle);
      case 'unit-narrow':
        return this.listPatterns.unitNarrow(bundle);
      case 'unit-short':
        return this.listPatterns.unitShort(bundle);
      case 'or':
        return this.listPatterns.or(bundle);
      case 'and-short':
        return this.listPatterns.andShort(bundle);
      case 'and':
      default:
        return this.listPatterns.and(bundle);
    }
  }

}
