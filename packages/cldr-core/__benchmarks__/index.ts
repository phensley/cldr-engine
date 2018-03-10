import {
  datetimeSuite
} from './datetime';

import {
  numberEngineSuite,
  numberFormatSuite,
  numberFormatBaselineSuite,
  numberParseSuite
} from './numbers';

const options = { async: false, delay: 0.5 };

datetimeSuite.run(options);
numberEngineSuite.run(options);
numberFormatBaselineSuite.run(options);
numberFormatSuite.run(options);
numberParseSuite.run(options);
