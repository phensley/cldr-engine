import { KeyIndexMap, Schema } from '@phensley/cldr-types';
import { CodeBuilder, SchemaConfig } from '@phensley/cldr-schema';
import { buildSchema } from './schema';
import {
  CalendarInternals,
  DateFieldInternals,
  GeneralInternals,
  Internals,
  NumberInternals,
  UnitInternals,
} from './internals';

import { CalendarInternalsImpl } from './calendars';
import { DateFieldInternalsImpl } from './datefields';
import { GeneralInternalsImpl } from './general';
import { NumberInternalsImpl } from './numbers';
import { UnitsInternalImpl } from './units';
import { checksumIndices } from '../resource/checksum';

/**
 * @internal
 */
export class InternalsImpl implements Internals {

  readonly schema: Schema;
  readonly config: SchemaConfig;
  readonly indices: KeyIndexMap;
  readonly checksum: string;

  readonly calendars: CalendarInternals;
  readonly dateFields: DateFieldInternals;
  readonly general: GeneralInternals;
  readonly numbers: NumberInternals;
  readonly units: UnitInternals;

  constructor(config: SchemaConfig, version: string, debug: boolean = false, patternCacheSize: number = 50) {
    // TODO: may move this up depending on how integration evolves
    this.config = config;
    const code = new CodeBuilder(config);
    const origin = code.origin();
    this.indices = origin.indices;
    this.schema = buildSchema(origin, debug);
    this.checksum = checksumIndices(version, origin.indices);

    this.calendars = new CalendarInternalsImpl(this, patternCacheSize);
    this.dateFields = new DateFieldInternalsImpl(this);
    this.general = new GeneralInternalsImpl(this, patternCacheSize);
    this.numbers = new NumberInternalsImpl(this, patternCacheSize);
    this.units = new UnitsInternalImpl(this);
  }

}
