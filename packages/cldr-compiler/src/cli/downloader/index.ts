const pkg = require('../../../package.json');
import { Downloader } from './downloader';

export const main = async () => {
  const downloader = new Downloader(pkg.cldrversion);
  try {
    await downloader.run();
  } catch (e) {
    console.log(`Download failed: ${e}`);
  }
};
