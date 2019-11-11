import {
  formatDateSuite,
  gregorianSuite
} from './calendars';

import {
  numberEngineSuite,
  numberFormatBaselineSuite,
  numberFormatSuite,
  numberParseSuite
} from './numbers';

import {
  messageSuite
} from './messages';

const options = { async: false, delay: 0.5 };

messageSuite.run(options);

formatDateSuite.run(options);
gregorianSuite.run(options);

numberEngineSuite.run(options);
numberFormatBaselineSuite.run(options);
numberFormatSuite.run(options);
numberParseSuite.run(options);
