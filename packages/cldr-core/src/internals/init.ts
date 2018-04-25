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

  constructor(debug: boolean = false, patternCacheSize: number = 50) {
    this.schema = buildSchema(debug);

    this.plurals = new PluralInternalsImpl();
    this.wrapper = new WrapperInternalsImpl();

    this.calendars = new CalendarInternalsImpl(this, patternCacheSize);
    this.dateFields = new DateFieldInternalsImpl(this);
    this.general = new GeneralInternalsImpl(this);
    this.numbers = new NumberInternalsImpl(this, patternCacheSize);
    this.units = new UnitsInternalImpl(this);
  }

}
