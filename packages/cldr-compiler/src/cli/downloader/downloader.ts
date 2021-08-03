import * as fs from 'fs';
import * as tar from 'tar';
import * as zlib from 'zlib';
import * as filepath from 'path';

import chalk from 'chalk';
import fetch, { Response } from 'node-fetch';

/*
 * Replacement for 'cldr-data-downloader'
 */

// Temporary location prior to official Github JSON release
// const BASEURL = 'https://glonk.com/unicode-cldr';
// const BASEURL = 'http://localhost:8000/unicode-org';

const BASEURL = 'https://github.com/unicode-org/';
const DATAROOT = filepath.resolve(filepath.join(__dirname, '../../../.cldr'));
const STATEFILE = 'state.json';

const ARCHIVES = ['cldr-json'];

const GROUPS = new Set<string>([
  'cldr-core',
  'cldr-dates-modern',
  'cldr-cal-buddhist-modern',
  'cldr-cal-japanese-modern',
  'cldr-cal-persian-modern',
  'cldr-localenames-modern',
  'cldr-misc-modern',
  'cldr-numbers-modern',
  'cldr-rbnf',
  'cldr-units-modern',
]);

const IGNORE = new Set<string>(['bower.json', 'package.json']);
const SUPPLEMENTAL = new Set(['availableLocales.json', 'defaultContent.json', 'scriptMetadata.json']);

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

export class Downloader {
  private state: State;

  constructor(readonly version: string) {
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
      const url = `${BASEURL}/${name}/archive/${version}.tar.gz`;
      const desc = `${name} ${version} at ${url}`;

      const unzip = zlib.createGunzip();
      fetch(url)
        .then((r: Response) => {
          r.body
            // un-gzip
            .pipe(unzip)
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
              info(`${chalk.green('      ok')} ${name}`);
              resolve(true);
            });
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

    let parts = entry.path.split(filepath.sep).slice(2);
    const name = parts[parts.length - 1];
    if (IGNORE.has(name)) {
      entry.resume();
      return;
    }
    if (SUPPLEMENTAL.has(name)) {
      parts = ['cldr-core', 'supplemental', name];
    }
    const group = parts[0];
    if (GROUPS.has(group)) {
      // Build destination path
      const path = [version, ...parts.slice(1)].join(filepath.sep);
      makedirs(DATAROOT, path);

      // Write output
      entry.pipe(fs.createWriteStream(filepath.join(DATAROOT, path), { encoding: 'utf-8' })).on('error', (e: Error) => {
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
