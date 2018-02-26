import { numberFormatSuite, numberParseSuite } from './numbers';

const options = { async: false, delay: 1 };

numberFormatSuite.run(options);
numberParseSuite.run(options);
