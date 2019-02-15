import { makeSuite } from './util';
import { LRU } from '../src';

export const lruSuite = makeSuite('LRU');
export const mapSuite = makeSuite('Map');

const chars = 'abcdefghijklmnopqrstuvwxyz';
const randstr = (len: number): string => {
  let r = '';
  for (let x = 0; x < len; x++) {
    r += chars[(Math.random() * len) | 0];
  }
  return r;
};

const keys: string[] = [];
const nums: number[] = [];
const syms = 10000;

for (let i = 0; i < syms; i++) {
  keys.push(randstr(10));
  nums.push((Math.random() * 100000000) | 0);
}
const limit = 5000;

const lruNums1 = new LRU<string>(limit);
const lruKeys1 = new LRU<string>(limit);

for (const key of nums) {
  lruNums1.set(key, 'val');
}
for (const key of keys) {
  lruKeys1.set(key, key);
}

let index1 = 0;
lruSuite.add('lru get number', () => {
  const key = index1++;
  lruNums1.get(nums[key % syms]);
});

let index2 = 0;
lruSuite.add('lru get string', () => {
  const key = index2++;
  lruKeys1.get(keys[key % syms]);
});

const lruNums2 = new LRU<string>(limit);
const lruKeys2 = new LRU<string>(limit);

let index3 = 0;
lruSuite.add('lru set number', () => {
  const key = nums[index3++ % syms];
  lruNums2.set(key, 'val');
});

let index4 = 0;
lruSuite.add('lru set string', () => {
  const key = keys[index4++ % syms];
  lruKeys2.set(key, 'val');
});

const mapNums1 = new Map();
const mapKeys1 = new Map();

for (const key of nums) {
  mapNums1.set(key, 'val');
}
for (const key of keys) {
  mapKeys1.set(key, key);
}

let index5 = 0;
mapSuite.add('map get number', () => {
  const key = index5++;
  mapNums1.get(nums[key % syms]);
});

let index6 = 0;
mapSuite.add('map get string', () => {
  const key = index6++;
  mapKeys1.get(keys[key % syms]);
});

const mapNums2 = new Map();
const mapKeys2 = new Map();

let index7 = 0;
mapSuite.add('map set number', () => {
  const key = nums[index7++ % syms];
  mapNums2.set(key, 'val');
});

let index8 = 0;
mapSuite.add('map set string', () => {
  const key = keys[index8++ % syms];
  mapKeys2.set(key, 'val');
});
