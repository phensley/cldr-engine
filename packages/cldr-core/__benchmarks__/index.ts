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

const options = { async: false, delay: 0.5 };

formatDateSuite.run(options);
gregorianSuite.run(options);

numberEngineSuite.run(options);
numberFormatBaselineSuite.run(options);
numberFormatSuite.run(options);
numberParseSuite.run(options);
