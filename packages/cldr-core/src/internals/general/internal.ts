import {
  AltType,
  LayoutSchema,
  ListPatternsSchema,
  ListPatternPositionType,
  NamesSchema,
  RegionIdType,
  ScriptIdType,
  Vector1Arrow,
} from '@phensley/cldr-schema';

import { Internals } from '../../internals';
import { Bundle } from '../../resource';
import { ListPatternType } from '../../common';
import { Part } from '../../types';
import { GeneralInternals } from '..';

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
    return this.layout.characterOrder.get(bundle);
  }

  lineOrder(bundle: Bundle): string {
    return this.layout.lineOrder.get(bundle);
  }

  formatList(bundle: Bundle, items: string[], type: ListPatternType): string {
    const arrow = this.selectListPattern(type);
    const pattern = arrow.mapping(bundle);
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
    const arrow = this.selectListPattern(type);
    const pattern = arrow.mapping(bundle);
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

  protected selectListPattern(type: ListPatternType): Vector1Arrow<ListPatternPositionType> {
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
