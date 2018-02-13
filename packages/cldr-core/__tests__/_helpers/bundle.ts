import * as fs from 'fs';
import { join } from 'path';
import * as process from 'process';
import * as child from 'child_process';
import * as zlib from 'zlib';

import { Bundle } from '@phensley/cldr-schema';
import { LanguageResolver } from '../../src/locale/resolver';
import { Pack } from '../../src/resource/pack';
import { SchemaBuilder } from '../../src/schema';

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
