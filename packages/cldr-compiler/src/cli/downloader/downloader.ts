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
const BASEURL = 'https://glonk.com/unicode-cldr';

// const BASEURL = 'https://github.com/unicode-cldr';
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
  // 'cldr-rbnf', //
  // 'cldr-segments-modern',
  'cldr-units-modern'
];

// We use the specific commit when a cldr JSON update is pushed
// but left untagged, like 35.1 was. Without the tag we download
// a tarball of a specific commit, at least until the tag is pushed.
const COMMITS: any = {
  // 'cldr-core': 'fdb81faac9c473c161d48b8a7a98028bcac61bd1',
  // 'cldr-dates-modern': '35dfc323e2587fbefbb1d8bad79cc39f58c43348',
  // 'cldr-cal-buddhist-modern': 'c19ad2798b930664a815a278f4df4b8679e0a411',
  // 'cldr-cal-japanese-modern': '40e7cda11e4f0bc1a59aaec4b035214aa4dbb655',
  // 'cldr-cal-persian-modern': '0bc2df2d2524b698e41708fff21fcda0f169efad',
  // 'cldr-localenames-modern': 'bd969e9c29cabe45cd1a4aa88546f698e65b7be5',
  // 'cldr-misc-modern': 'd507b415a36848470d9dda6e54f231f23655e173',
  // 'cldr-numbers-modern': '894eff57e0410bf8c3457eb2db57f004e7ad0412',
  // 'cldr-rbnf': 'ee499271a0c01a12ac3054943c16eac779d41bc1',
  // 'cldr-segments-modern': '5c8fea8cfebf26b864353383168556c198ef22bd',
  // 'cldr-units-modern': '6ce59f5c2e0a6def19f09344032b33925c67bf75'
};

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

export class Downloader {

  private state: State;

  constructor(readonly version: string) {
    this.state = this.loadstate();
  }

  run(): Promise<boolean[]> {
    const res: Promise<boolean>[] = [];
    for (const name of ARCHIVES) {
      if (this.state[name] !== this.version) {
        const commit = COMMITS[name];
        res.push(this.extract(name, this.version, commit));
      }
    }
    return Promise.all(res);
  }

  private extract(name: string, version: string, commit?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      info(`${chalk.yellow('fetching')} ${name}`);

      // If a specific commit is defined, use that.
      const url = `${BASEURL}/${name}/archive/${commit ? commit : version}.tar.gz`;
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
