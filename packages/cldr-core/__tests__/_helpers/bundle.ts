import * as fs from 'fs';
import { join } from 'path';
import * as process from 'process';
import * as child from 'child_process';
import * as zlib from 'zlib';

import { SchemaBuilder } from '../../src/internals';
import { Pack } from '../../src/resource/pack';
import { LanguageResolver } from '../../src/locale/resolver';
import { Bundle, Schema, ORIGIN } from '@phensley/cldr-schema';

// Singleton schema accessor.
let SCHEMA: Schema;

/**
 * Builds and returns the global schema accessor object.
 */
export const schema = (): Schema => {
  if (SCHEMA === undefined) {
    const builder = new SchemaBuilder();
    SCHEMA = ({} as any) as Schema;
    builder.construct(SCHEMA, ORIGIN);
  }
  return SCHEMA;
};

/**
 * Load a resource bundle for a given language. If resource file does
 * not exist it is generated.
 */
export const languageBundle = (tag: string): Bundle => {
  const scratch = join(__dirname, '../../scratch');
  if (!fs.existsSync(scratch)) {
    fs.mkdirSync(scratch);
  }
  const locale = LanguageResolver.addLikelySubtags(tag);
  const language = locale.language();
  const path = join(scratch, `${language}.res.gz`);
  if (!fs.existsSync(path)) {
    const node = process.argv[0];
    const script = join(__dirname, '..', '..', '..', 'cldr-compiler', 'bin', 'compiler.js');
    child.execSync(`${node} ${script} pack -o ${scratch} -l ${language}`);
  }
  const compressed = fs.readFileSync(path);
  const raw = zlib.gunzipSync(compressed).toString('utf-8');
  const pack = new Pack(raw);
  return pack.get(locale);
};
