import { createHash } from 'crypto';
import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';
import * as zlib from 'zlib';

import { checksumIndices, CodeBuilder } from '@phensley/cldr-core';
import { getMain } from '../../cldr';
import { Encoder, EncoderMachine } from '../../resource/machine';
import { ResourcePack } from '../../resource/pack';
import { loadPatch, applyPatch, PatchFile } from './patch';
import { buildLocaleMap, checkLanguages, getProjectInfo, ProjectInfo } from './util';

import DEFAULT_CONFIG from './config.json';
import { Downloader } from '../downloader/downloader';
import { validateConfig } from './validate';
import { RBNFCollector } from '../../rbnf';

/**
 * Encodes fields into a resource pack and returns the offset
 * to the field. Undefined fields get encoded as ''.
 */
export class PackEncoder implements Encoder {
  private _distinct: { [x: string]: number } = {};
  private _count: number = 0;
  private _size: number = 0;

  constructor(private pack: ResourcePack) {}

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

export const sha256 = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');

export interface PackArgs {
  out: string;
  lang?: string;
  patch?: string;
  config?: string;
  regions?: string;
  verbose: boolean;
}

/**
 * Generates static data that will be impored into the runtime.
 */
export const runPack = (argv: yargs.Arguments<PackArgs>) => {
  const pkg = getProjectInfo();

  // Ensure downloads happen before building
  const downloader = new Downloader(pkg.cldrVersion);
  downloader
    .run()
    .then(() => runPackImpl(argv, pkg))
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });
};

const runPackImpl = (argv: yargs.Arguments<PackArgs>, pkg: ProjectInfo) => {
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
    validateConfig(config);
  } else {
    config = DEFAULT_CONFIG;
  }

  const regions = new Set(argv.regions ? argv.regions.split(',') : []);

  const dest = argv.out;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  // We can apply zero or more patch files to the schema before generating
  // resource files.
  const patchfiles: PatchFile[] = [];
  if (argv.patch) {
    let fail = false;
    for (const path of argv.patch.split(',')) {
      try {
        const patchfile = loadPatch(path);
        patchfiles.push(patchfile);
      } catch (e) {
        console.warn(`failed to load patch: ${e}`);
        fail = true;
      }
    }
    if (fail) {
      process.exit(1);
    }
  }

  // Configure the schema accessor builder
  const builder = new CodeBuilder(config);
  const origin = builder.origin();
  const checksum = checksumIndices(pkg.version, origin.indices);

  const rbnf = new RBNFCollector();
  rbnf.load();

  let path: string;
  const hashes: { [x: string]: string } = {};
  const pkghash = createHash('sha256');
  langs.forEach((lang) => {
    console.warn(`processing:  ${lang}`);

    // Get the list of languages that should live together in this bundle.
    let locales = localeMap[lang];

    if (regions.size > 0) {
      locales = locales.filter((l) => l.id === lang || regions.has(l.tag.region()));
    }

    // Construct a pack that will contain all strings across all regions for this language.
    const pack = new ResourcePack(lang, pkg.version, pkg.cldrVersion, rbnf);

    const encoder = new PackEncoder(pack);
    const machine = new EncoderMachine(encoder, argv.verbose);

    // Load patches if any. We pattern match the locale selector against each id
    // to determine if the patch applies

    // For each locale, fetch its data from the JSON files and execute an encoder.
    locales.forEach((locale) => {
      if (argv.verbose) {
        console.warn(`   locale: ${locale.id}`);
      }
      pack.push(locale);
      const main = getMain(locale.id);
      if (patchfiles.length) {
        for (const patch of patchfiles) {
          if (!applyPatch(locale.id, main, patch)) {
            console.warn(`failed to apply patch ${patch.path} to ${locale.id}, aborting`);
            process.exit(1);
          }
        }
      }
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

    // Only uncompressed hash is recorded
    hashes[name] = sha256(raw);

    // Package hash only updated using uncompressed data
    pkghash.update(raw);

    // Write compressed
    name = `${lang}.json.gz`;
    path = join(dest, name);
    console.warn(`writing:     ${path}`);
    const data = zlib.gzipSync(raw, { level: zlib.constants.Z_BEST_COMPRESSION });
    fs.writeFileSync(path, data, { encoding: 'binary' });
  });

  // Write hashes file
  path = join(dest, 'sha256sums.txt');
  console.warn(`writing:     ${path}`);

  fs.writeFileSync(
    path,
    Object.keys(hashes)
      .sort()
      .map((k) => `${hashes[k]}  ${k}`)
      .join('\n') + '\n',
  );

  path = join(dest, 'resource.json');
  console.warn(`writing:     ${path}`);

  fs.writeFileSync(path, JSON.stringify({ sha256: pkghash.digest('hex') }));
};
