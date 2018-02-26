import { numberEngineSuite, numberFormatSuite, numberParseSuite } from './numbers';

const options = { async: false, delay: 0.5 };

numberEngineSuite.run(options);
numberFormatSuite.run(options);
numberParseSuite.run(options);
