import * as fs from 'fs';
import * as filepath from 'path';
import { default as minimatch } from 'minimatch';
import * as yaml from 'yaml';
import { applyOperation, Operation } from 'fast-json-patch';

export interface Patch {
  locales: string;
  operations: Operation[];
}

export interface PatchFile {
  path: string;
  version: number;
  patches: Patch[];
}

/**
 * Load a patch file, which contains some extra attributes to apply only to
 * certain locale ids. It wraps arrays of JSON patch operations. See the
 * http://jsonpatch.com/ site for details. We also accept JSON patches in
 * YAML format, which eases maintenance.
 */
export const loadPatch = (path: string): PatchFile => {
  const ext = filepath.extname(path);
  if (ext != '.json' && ext != '.yaml') {
    throw new Error(`unsupported file type: '${ext}'`);
  }

  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  const patchfile = (ext == '.yaml' ? yaml.parse(raw) : JSON.parse(raw)) as PatchFile;
  const { version, patches } = patchfile;
  if (version != 1) {
    throw new Error(`unsupported version ${version} in patch ${path}`);
  }
  if (!Array.isArray(patches)) {
    throw new Error(`missing 'patches' key in patch ${path}`);
  }
  patchfile.path = path;
  return patchfile;
};

/**
 * Apply a patch file to the given document. Note that the document is modified
 * in-place; we do not return a modified copy.
 */
export const applyPatch = (locale: string, doc: any, patchfile: PatchFile) => {
  let ok = true;
  for (const patch of patchfile.patches) {
    if (!matchesLocale(locale, patch.locales)) {
      continue;
    }
    console.warn(`patching:    ${locale} from ${patchfile.path}`);
    for (const op of patch.operations) {
      try {
        applyOperation(doc, op, true, true, true);
      } catch (e: any) {
        console.warn(`error patching key ${op.path}: ${e.name}`);
        ok = false;
      }
    }
  }
  return ok;
};

/**
 * Match a locale id against a pattern and return true.
 */
const matchesLocale = (locale: string, patterns: string): boolean => {
  for (const p of patterns.split(',')) {
    if (minimatch(locale, p)) {
      return true;
    }
  }
  return false;
};
