import * as fs from 'fs';
import * as filepath from 'path';
import * as rimraf from 'rimraf';
import * as subproc from 'child_process';

const REPO = 'https://github.com/eggert/tz.git';
const TIMEOUT = 30000;

const fail = (m: string) => {
  console.error(`ERROR: ${m}`);
  process.exit(1);
};

const lines = (s: string) => s.split('\n').filter((e) => e.length);

const set = (s: string[]) => new Set(s);

export const setupTZDB = (tag: string): string => {
  const tmp = filepath.join(__dirname, '..', '.tztemp');
  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
  }

  const repo = filepath.join(tmp, 'tz');

  // Check cache file to track current tag and avoid unnecessary rebuilds
  const cachepath = filepath.join(tmp, 'cache.json');
  if (fs.existsSync(cachepath)) {
    const data = fs.readFileSync(cachepath, { encoding: 'utf-8' });
    const cache = JSON.parse(data);
    if (cache.tag === tag) {
      return repo;
    }
  }

  const exec = (cmd: string, cwd: string) => subproc.execSync(cmd, { cwd, timeout: TIMEOUT });

  const tagset = () => set(lines(exec(`git tag`, repo).toString('utf-8')));

  // clone, checkout master, pull refresh
  if (!fs.existsSync(repo)) {
    exec(`git clone ${REPO}`, tmp);
  }

  // check if desired tag exists
  let tags = tagset();
  if (!tags.has(tag)) {
    // switch to clean master and refresh from origin
    exec(`git checkout master`, repo);
    exec(`git reset --hard`, repo);
    exec(`git pull origin master --tags`, repo);
  }

  // after pull, check tag again
  tags = tagset();
  if (!tags.has(tag)) {
    fail(`tag "${tag}" does not exist`);
  }

  // checkout the tag and create the zones dir
  exec(`git checkout ${tag}`, repo);
  const zonedir = filepath.join(repo, 'zones');
  if (fs.existsSync(zonedir)) {
    rimraf.sync(zonedir);
  }

  // make zic and tzdata.zi and generate tzif zone files
  exec(`make clean`, repo);
  exec(`make zic tzdata.zi`, repo);
  exec(`./zic -d zones tzdata.zi`, repo);

  console.log(`Tag ${tag} built successfully`);

  // Update cache file
  fs.writeFileSync(cachepath, JSON.stringify({ tag }), { encoding: 'utf-8' });

  // return root of repo
  return repo;
};
