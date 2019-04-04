import * as fs from 'fs';
import * as tar from 'tar';
import * as zlib from 'zlib';
import * as filepath from 'path';

import * as request from 'request';
import chalk from 'chalk';

const pkg = require('../../../package.json');

/*
 * Replacement for 'cldr-data-downloader'
 */

const BASEURL = 'https://github.com/unicode-cldr';
const DATAROOT = filepath.resolve(filepath.join(__dirname, '../../../.cldr'));
const STATEFILE = 'state.json';

const ARCHIVES = [
  'cldr-core',

  'cldr-dates-modern',
  'cldr-cal-buddhist-modern',
    // 'cldr-cal-chinese-modern',
    // 'cldr-cal-coptic-modern',
    // 'cldr-cal-dangi-modern',
    // 'cldr-cal-ethiopic-modern',
    // 'cldr-cal-hebrew-modern',
    // 'cldr-cal-indian-modern',
    // 'cldr-cal-islamic-modern',
  'cldr-cal-japanese-modern',
  'cldr-cal-persian-modern',
    // 'cldr-cal-roc-modern',
  'cldr-localenames-modern',
  'cldr-misc-modern',
  'cldr-numbers-modern',
  'cldr-rbnf',
  'cldr-segments-modern',
  'cldr-units-modern'
];

const SUPPLEMENTAL = new Set([
  'availableLocales.json',
  'defaultContent.json',
  'scriptMetadata.json'
]);

type State = { [archive: string]: string };

const makedirs = (root: string, filename: string) => {
  const p = filename.split(filepath.sep);
  for (let i = 0; i < p.length; i++) {
    const dir = filepath.join(root, ...p.slice(0, i));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
};

const info = (m: string) => console.log(m);
const error = (m: string) => console.log(`${chalk.red('ERROR')} ${m}`);

class Downloader {

  private state: State;

  constructor(readonly version: string) {
    this.state = this.loadstate();
  }

  async run(): Promise<void> {
    for (const name of ARCHIVES) {
      try {
        if (this.state[name] !== this.version) {
          await this.extract(name, this.version);
          info(`${chalk.green('      ok')} ${name}`);
        }
      } catch (e) {
        error(e);
        process.exit(1);
      }
    }
  }

  private async extract(name: string, version: string): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
      info(`${chalk.yellow('fetching')} ${name}`);

      const url = `${BASEURL}/${name}/archive/${version}.tar.gz`;
      const desc = `${name} ${version} at ${url}`;

      request.get(url)

        // http get
        .on('response', (r: request.Response) => {
          if (r.statusCode !== 200) {
            console.log('failure', r.statusCode);
            reject(`unexpected status code ${r.statusCode} downloading ${desc}`);
          }
        })
        .on('error', (e: Error) => {
          console.log('failure', e);
          reject(`failure downloading ${desc}: ${e}`);
        })

        // un-gzip
        .pipe(zlib.createGunzip())
        .on('error', (e: Error) => {
          console.log('failure', e);
          reject(`failure un-gzipping ${desc}: ${e}`);
        })

        // untar
        .pipe(new tar.Parse({ strip: 1 }) as fs.WriteStream)
        .on('entry', (entry: any) => {
          this.save(version, entry);
        })
        .on('close', () => {
          this.state[name] = version;
          this.savestate();
          resolve(true);
        })
        .on('error', (e: Error) => {
          reject(`failure un-tarring ${desc}: ${e}`);
        });
    });
  }

  private save(version: string, entry: any): void {
    if (entry.type !== 'File') {
      entry.resume();
      return;
    }

    let parts = entry.path.split(filepath.sep).slice(1);
    const name = parts[parts.length - 1];

    // Some files live in the root of the cldr-core package. For simplicity
    // we want to move these under 'supplemental'
    if (SUPPLEMENTAL.has(name)) {
      parts = ['supplemental', name];
    }

    const group = parts[0];
    if (group === 'supplemental' || group === 'main') {
      const path = [version, ...parts].join(filepath.sep);
      makedirs(DATAROOT, path);
      entry.pipe(fs.createWriteStream(filepath.join(DATAROOT, path), { encoding: 'utf-8' }))
        .on('error', (e: Error) => {
          error(`failure writing entry ${path}: ${e}`);
        });
    } else {
      entry.resume();
    }
  }

  private loadstate(): State {
    const path = filepath.join(DATAROOT, this.version, STATEFILE);
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, { encoding: 'utf-8' }).toString();
      return JSON.parse(data);
    }
    return {};
  }

  private savestate(): void {
    const name = filepath.join(this.version, STATEFILE);
    makedirs(DATAROOT, name);
    const path = filepath.join(DATAROOT, name);
    const data = JSON.stringify(this.state, undefined, '  ');
    fs.writeFileSync(path, data, { encoding: 'utf-8' });
  }

}

export const main = async () => {
  const downloader = new Downloader(pkg.cldrversion);
  await downloader.run();
};
