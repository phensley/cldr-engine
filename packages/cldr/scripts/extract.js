const fs = require('fs');
const { basename, join } = require('path');
const zlib = require('zlib');

const EXT = '.json.gz';

const root = join(__dirname, '..', 'packs');
const packs = fs.readdirSync(root)
  .filter(n => n.endsWith(EXT))
  .map(n => join(root, n));

packs.forEach(src => {
  const name = basename(src, EXT);
  const dst = join(root, `${name}.json`);
  const compressed = fs.readFileSync(src);
  const raw = zlib.gunzipSync(compressed).toString('utf-8');
  fs.writeFileSync(dst, raw);
});
