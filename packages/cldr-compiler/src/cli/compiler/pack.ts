import * as crypto from 'crypto';
import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';
import * as zlib from 'zlib';

import { checksumIndices } from '@phensley/cldr-core';
import { CodeBuilder } from '@phensley/cldr-schema';
import { getMain  } from '../../cldr';
import { Encoder, EncoderMachine } from '../../resource/machine';
import { ResourcePack } from '../../resource/pack';
import { buildLocaleMap, checkLanguages, getProjectInfo, ProjectInfo } from './util';

import * as DEFAULT_CONFIG from './config.json';
import { Downloader } from '../downloader/downloader';

/**
 * Encodes fields into a resource pack and returns the offset
 * to the field. Undefined fields get encoded as ''.
 */
export class PackEncoder implements Encoder {

  private _distinct: { [x: string]: number } = {};
  private _count: number = 0;
  private _size: number = 0;

  constructor(private pack: ResourcePack) { }

  encode(field: string | undefined): number {
    this._count++;
    if (field !== undefined) {
      const c = this._distinct[field] || 0;
      this._distinct[field] = c + 1;
      this._size += field.length;
    }
    return this.pack.add(field === undefined ? '' : field);
  }

  count(): number {
    return this._count;
  }

  size(): number {
    return this._size;
  }

  distinct(): number {
    return Object.keys(this._distinct).length;
  }
}

export const sha256 = (data: string | Buffer): string =>
  crypto.createHash('sha256').update(data).digest('hex');

/**
 * Generates static data that will be impored into the runtime.
 */
export const runPack = (argv: yargs.Arguments) => {
  const pkg = getProjectInfo();

  // Ensure downloads happen before building
  const downloader = new Downloader(pkg.cldrVersion);
  downloader.run()
    .then(() => runPackImpl(argv, pkg))
    .catch(e => {
      console.log(e);
      process.exit(1);
  });
};

const runPackImpl = (argv: yargs.Arguments, pkg: ProjectInfo) => {
  const localeMap = buildLocaleMap();
  let langs = Object.keys(localeMap).sort();
  if (argv.lang) {
    langs = checkLanguages(argv.lang.split(','), localeMap);
  }

  const configpath = argv.config;
  let config: any;
  if (configpath) {
    const configraw = fs.readFileSync(configpath, { encoding: 'utf-8' });
    config = JSON.parse(configraw);
  } else {
    config = DEFAULT_CONFIG;
  }

  const regions = new Set(argv.regions ? argv.regions.split(',') : []);

  const dest = argv.out;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  // Configure the schema accessor builder
  const builder = new CodeBuilder(config);
  const origin = builder.origin();
  const checksum = checksumIndices(origin.indices);

  let path: string;
  const hashes: { [x: string]: string } = {};
  const pkghash = crypto.createHash('sha256');
  langs.forEach(lang => {
    console.warn(`processing:  ${lang}`);

    // Get the list of languages that should live together in this bundle.
    let locales = localeMap[lang];

    if (regions.size > 0) {
      locales = locales.filter(l => l.id === lang || regions.has(l.tag.region()));
    }

    // Construct a pack that will contain all strings across all regions for this language.
    const pack = new ResourcePack(lang, pkg.version, pkg.cldrVersion);

    const encoder = new PackEncoder(pack);
    const machine = new EncoderMachine(encoder, argv.verbose);

    // For each locale, fetch its data from the JSON files and execute an encoder.
    locales.forEach(locale => {
      if (argv.verbose) {
        console.warn(`   locale: ${locale.id}`);
      }
      pack.push(locale);
      const main = getMain(locale.id);
      machine.encode(main, origin);
      if (argv.verbose) {
        console.warn('');
      }
    });

    // Pack all strings appended by the encoder.
    const raw = pack.render(checksum);

    // Write uncompressed pack
    let name = `${lang}.json`;
    path = join(dest, name);
    console.warn(`writing:     ${path}`);
    fs.writeFileSync(path, raw, { encoding: 'utf-8' });
    hashes[name] = sha256(raw);

    // Write compressed
    name = `${lang}.json.gz`;
    path = join(dest, name);
    console.warn(`writing:     ${path}`);
    const data = zlib.gzipSync(raw, { level: zlib.constants.Z_BEST_COMPRESSION });
    fs.writeFileSync(path, data, { encoding: 'binary' });
    hashes[name] = sha256(data);
    pkghash.update(data);
  });

  // Write hashes file
  path = join(dest, 'sha256sums.txt');
  console.warn(`writing:     ${path}`);

  fs.writeFileSync(path, Object.keys(hashes).sort().map(k => `${hashes[k]}  ${k}`).join('\n') + '\n');

  path = join(dest, 'resource.json');
  console.warn(`writing:     ${path}`);

  fs.writeFileSync(path, JSON.stringify({ sha256: pkghash.digest('hex') }));
};
