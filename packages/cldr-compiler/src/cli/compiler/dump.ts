import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';

import { CodeBuilder, DigitsArrow, FieldArrow, Origin, Schema, ScopeArrow, Vector1Arrow, Vector2Arrow } from '@phensley/cldr-schema';
import { VERSION } from '@phensley/cldr-core/lib/utils/version';
import { SchemaBuilder } from '@phensley/cldr-core/lib/internals/schema';
import { checksumIndices } from '@phensley/cldr-core/lib/resource/checksum';
import * as CONFIG from './config.json';

export const loader = (lang: string) => {
  const path = join(__dirname, `../../../../cldr/packs/${lang}.json`);
    return fs.readFileSync(path).toString('utf-8');
};

export const buildSchema = (origin: Origin, debug: boolean = false): Schema => {
  const builder = new SchemaBuilder(debug);
  const schema = ({} as any) as Schema;
  builder.construct(schema, origin);
  return schema;
};

type Entry = [number, string, number, number] | [number, string];

interface Options {
  verbose: boolean;
}

/**
 * Scan the schema and collect the scope names and start/end offsets.
 */
const scan = (o: any, depth: number, opts: Options): Entry[] => {
  let e: Entry[] = [];
  if (o instanceof DigitsArrow) {
    const start = o.offset;
    e.push([depth, 'DigitsArrow', start, start + o.index.size * o.size2]);
  } else if (o instanceof FieldArrow) {
    e.push([depth, 'FieldArrow', o.offset, o.offset + 1]);
  } else if (o instanceof Vector1Arrow) {
    const start = o.offset - 1;
    e.push([depth, 'Vector1Arrow', start, start + o.len + 1]);
  } else if (o instanceof Vector2Arrow) {
    // TODO: need to get the right formatting
    // if (opts.verbose) {
    //   const vec2 = o as Vector2Arrow<any, any>;
    //   for (const k1 of vec2.index1.keys) {
    //     e.push([depth, `Vector2Arrow "${k1}" "${vec2.index2.keys.join(', ')}"`]);
    //     e.push([depth + 1, ``, o.offset + vec2.index1.get(k1),  o.offset + vec2.index2.size]);
    //   }
    // } else {
    const start = o.offset - 1;
    e.push([depth, 'Vector2Arrow', start, start + o.size + 1]);
    // }
  } else if (o instanceof ScopeArrow) {
    e.push([depth, 'ScopeArrow']);
    for (const key of Object.keys(o.map)) {
      e.push([depth, key]);
      e = e.concat(scan(o.map[key], depth + 1, opts));
    }
  } else {
    for (const key of Object.keys(o)) {
      e.push([depth, key]);
      e = e.concat(scan(o[key], depth + 1, opts));
    }
  }
  return e;
};

/**
 * Display the schema entries.
 */
const display = (entries: Entry[], strings: string[]) => {
  // let next = 0;
  // for (let i = 0; i < entries.length; i++) {

  // }
  for (const e of entries) {
    if (e.length === 2) {
      const [depth, key] = e;
      console.log(`${' '.repeat(depth)}${key}`);
    } else {
      const [depth, key, start, end] = e;
      console.log(`${' '.repeat(depth)}${key} (${start}, ${end})`);
      console.log(' '.repeat(depth), JSON.stringify(strings.slice(start, end)));
    }
  }
};

interface DumpArgs {
  pack: string;
  config?: string;
}

export const runDump = (argv: yargs.Arguments<DumpArgs>) => {
  let raw: string;
  let config: any = CONFIG;

  if (argv.config) {
    raw = fs.readFileSync(argv.config).toString('utf-8');
    config = JSON.parse(raw);
  }

  raw = fs.readFileSync(argv.pack).toString('utf-8');
  const data = JSON.parse(raw);

  const schema = ({} as any) as Schema;
  const origin = new CodeBuilder(config).origin();
  const ck = checksumIndices(VERSION, origin.indices);
  console.log(`Checksum ${ck}`);

  const builder = new SchemaBuilder(false);
  builder.construct(schema, origin);

  const opts = { verbose: false };
  Object.keys(data.scripts).forEach(name => {
    const strings = data.scripts[name].strings.split('\t');
    const entries = scan(schema, 1, opts);
    display(entries, strings);
  });
};
