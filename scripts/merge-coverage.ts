import * as fs from 'fs';
import * as glob from 'glob';
import { basename, join } from 'path';

// Script to merge coverage files into a single directory for reporting.
// Running coverage in each package separately to work around a
// jest / ts-jest issue causing inaccurate reporting.

const main = () => {
  const root = join(__dirname, '..');
  const dstdir = join(root, '.nyc_output');
  if (!fs.existsSync(dstdir)) {
    fs.mkdirSync(dstdir);
  }
  const pattern = join(root, 'packages', 'cldr*');
  glob.sync(pattern).forEach(d => {
    const pkg = basename(d);
    const path = join(d, 'coverage', 'coverage-final.json');
    if (!fs.existsSync(path)) {
      return;
    }
    const dest = join(dstdir, `${pkg}.json`);
    console.warn(`copying ${dest}`);
    fs.copyFileSync(path, dest);
  });
};

main();
