import * as fs from 'fs';
import * as tar from 'tar';
import * as zlib from 'zlib';
import * as filepath from 'path';

import chalk from 'chalk';
import fetch, { Response } from 'node-fetch';

/*
 * Replacement for 'cldr-data-downloader'
 */

const BASEURL = 'https://registry.npmjs.org';

const DATAROOT = filepath.resolve(filepath.join(__dirname, '../../../.cldr'));
const STATEFILE = 'state.json';

const ARCHIVES = [
  'cldr-core',
  'cldr-dates-full',
  'cldr-cal-buddhist-full',
  'cldr-cal-japanese-full',
  'cldr-cal-persian-full',
  'cldr-localenames-full',
  'cldr-misc-full',
  'cldr-numbers-full',
  'cldr-rbnf',
  'cldr-units-full',
];

const IGNORE = new Set<string>(['bower.json', 'package.json', 'LICENSE', 'README.md']);
const SUPPLEMENTAL = new Set([
  'availableLocales.json',
  'coverageLevels.json',
  'defaultContent.json',
  'scriptMetadata.json',
]);

type State = { [archive: string]: string };

const makedir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const makedirs = (root: string, filename: string) => {
  const p = filename.split(filepath.sep);
  for (let i = 0; i < p.length; i++) {
    const dir = filepath.join(root, ...p.slice(0, i));
    makedir(dir);
  }
};

const info = (m: string) => console.log(m);
const error = (m: string) => console.log(`${chalk.red('ERROR')} ${m}`);

export class Downloader {
  private state: State;

  constructor(readonly version: string) {
    makedirs(DATAROOT, version);
    this.state = this.loadstate();
  }

  run(): Promise<boolean[]> {
    const res: Promise<boolean>[] = [];
    for (const name of ARCHIVES) {
      if (this.state[name] !== this.version) {
        res.push(this.extract(name, this.version));
      }
    }
    return Promise.all(res);
  }

  private extract(name: string, version: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      info(`${chalk.yellow('fetching')} ${name}`);

      // If a specific commit is defined, use that.
      const url = `${BASEURL}/${name}/-/${name}-${version}.tgz`;
      const desc = `${name} ${version} at ${url}`;

      const unzip = zlib.createGunzip();
      const parser = new tar.Parser({ strip: 1 });
      fetch(url)
        .then((r: Response) => {
          return (
            r.body &&
            r.body
              // un-gzip
              .pipe(unzip)
              .on('error', (e: Error) => {
                console.log('failure', e);
                reject(`failure un-gzipping ${desc}: ${e}`);
              })

              // untar
              .pipe(parser)
              .on('entry', (entry: any) => {
                this.save(version, entry);
              })
              .on('close', () => {
                this.state[name] = version;
                this.savestate();
                info(`${chalk.green('      ok')} ${name}`);
                resolve(true);
              })
          );
        })
        .catch((reason: any) => {
          reject(`failure downloading ${desc}: ${reason}`);
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

    if (IGNORE.has(name)) {
      entry.resume();
      return;
    }

    if (SUPPLEMENTAL.has(name)) {
      parts = ['supplemental', name];
    }

    // Build destination path
    const path = [version, ...parts].join(filepath.sep);
    if (parts.length > 1) {
      makedirs(DATAROOT, path);
    }

    // Write output
    entry.pipe(fs.createWriteStream(filepath.join(DATAROOT, path), { encoding: 'utf-8' })).on('error', (e: Error) => {
      error(`failure writing entry ${path}: ${e}`);
    });
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
