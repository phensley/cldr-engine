import { KeyIndex } from '../../types';
import {
  CalendarInfo,
  CalendarSchema,
} from './types';
import { GregorianInfo } from './gregorian';

export const PersianInfo: CalendarInfo = {
  eras: ['0'],
  months: GregorianInfo.months,
  availableFormats: ('Bh Bhm Bhms E EBhm EBhms EEEEd EHm EHms Ed Ehm Ehms Gy GyM GyMMM ' +
    'GyMMMEEEEd GyMMMEd GyMMMM GyMMMMEd GyMMMMd GyMMMd H HHmm HHmmZ HHmmss Hm Hms M MEEEEd ' +
    'MEd MMM MMMEEEEd MMMEd MMMM MMMMEd MMMMd MMMMdd MMMd MMMdd MMd MMdd Md d h hm hms mmss ' +
    'ms y yM yMEd yMM yMMM yMMMEd yMMMM yMMMd yMd yQQQ yQQQQ yyyy yyyyM yyyyMEEEEd yyyyMEd ' +
    'yyyyMM yyyyMMM yyyyMMMEEEEd yyyyMMMEd yyyyMMMM yyyyMMMMEd yyyyMMMMccccd yyyyMMMMd yyyyMMMd ' +
    'yyyyMMdd yyyyMd yyyyQQQ yyyyQQQQ').split(' '),
  intervalFormats: ('H Hm Hmv Hv M MEd MMM MMMEEEEd MMMEd MMMM MMMMEd MMMMd MMMd Md d h hm ' +
    'hmv hv y yM yMEd yMMM yMMMEEEEd yMMMEd yMMMM yMMMMEd yMMMMd yMMMd yMd').split(' ')
};

export interface PersianSchema extends CalendarSchema {

}

export const PersianAvailableFormatIndex = new KeyIndex(PersianInfo.availableFormats);
export const PersianEraIndex = new KeyIndex(PersianInfo.eras);
export const PersianIntervalFormatIndex = new KeyIndex(PersianInfo.intervalFormats);
