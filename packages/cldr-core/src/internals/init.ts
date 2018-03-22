import { Schema } from '@phensley/cldr-schema';
import { buildSchema } from '../schema';
import {
  CalendarInternals,
  DateFieldInternals,
  GeneralInternals,
  Internals,
  NumberInternals,
  PluralInternals,
  UnitInternals,
  WrapperInternals
} from './internals';

import { CalendarInternalsImpl } from './calendars';
import { DateFieldInternalsImpl } from './datefields';
import { GeneralInternalsImpl } from './general';
import { NumberInternalsImpl } from './numbers';
import { PluralInternalsImpl } from './plurals';
import { UnitsInternalImpl } from './units';
import { WrapperInternalsImpl } from './wrapper';

export class InternalsImpl implements Internals {

  readonly schema: Schema;

  readonly calendars: CalendarInternals;
  readonly dateFields: DateFieldInternals;
  readonly general: GeneralInternals;
  readonly numbers: NumberInternals;
  readonly plurals: PluralInternals;
  readonly units: UnitInternals;
  readonly wrapper: WrapperInternals;

  constructor(patternCacheSize: number = 50) {
    this.schema = buildSchema();

    this.plurals = new PluralInternalsImpl();
    this.wrapper = new WrapperInternalsImpl();

    this.calendars = new CalendarInternalsImpl(this.schema, this.wrapper, patternCacheSize);
    this.dateFields = new DateFieldInternalsImpl(this.schema, this.plurals, this.wrapper);
    this.general = new GeneralInternalsImpl(this.schema, patternCacheSize);
    this.numbers = new NumberInternalsImpl(this.schema, this.plurals, this.wrapper);
    this.units = new UnitsInternalImpl(this.schema, this.numbers, this.wrapper, patternCacheSize);
  }

}
