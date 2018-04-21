import {
  CalendarInfo,
  CalendarSchema,
} from '.';

export const BuddhistInfo: CalendarInfo = {
  eras: ['0'],
  months: '1 2 3 4 5 6 7 8 9 10 11 12'.split(' '),
  availableFormats: ('Bh Bhm Bhms E EBhm EBhms EEEEd EHm EHms Ed Ehm Ehms Gy GyM GyMMM GyMMMEEEEd ' +
    'GyMMMEd GyMMMM GyMMMMEd GyMMMMd GyMMMd GyMd H HHmm HHmmZ HHmmss Hm Hms Hmsv Hmv M MEEEEd MEd ' +
    'MMM MMMEEEEd MMMEd MMMM MMMMEEEEd MMMMEd MMMMd MMMMdd MMMd MMMdd MMd MMdd Md d h hm hms hmsv ' +
    'hmv mmss ms y yM yMEd yMM yMMM yMMMEd yMMMM yMMMd yMd yQQQ yQQQQ yyyy yyyyM yyyyMEEEEd yyyyMEd ' +
    'yyyyMM yyyyMMM yyyyMMMEEEEd yyyyMMMEd yyyyMMMM yyyyMMMMEd yyyyMMMMccccd yyyyMMMMd yyyyMMMd ' +
    'yyyyMMdd yyyyMd yyyyQQQ yyyyQQQQ').split(' '),
  intervalFormats: ('H Hm Hmv Hv M MEd MMM MMMEEEEd MMMEd MMMM MMMMEd MMMMd MMMd Md d h hm hmv hv ' +
    'y yM yMEd yMMM yMMMEEEEd yMMMEd yMMMM yMMMMEd yMMMMd yMMMd yMd').split(' ')
};

export interface BuddhistSchema extends CalendarSchema {

}
