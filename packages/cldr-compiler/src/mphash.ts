import { mphash, MPHashTable } from '@phensley/cldr-utils';

// Generate a prime >= 3
const validprime = (n: number) => {
  n = Math.abs(n);
  if (n < 3 || n % 2 === 0) {
    return false;
  }
  const lim = Math.sqrt(n) + 2 | 0;
  for (let i = 3; i < lim; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
};

// Return the next prime number larger than n
const nextprime = (n: number) => {
  for (;;) {
    if (validprime(n)) {
      break;
    }
    n++;
  }
  return n;
};

/**
 * Construct a minimal perfect hash table that can be accessed
 * by the @phensley/cldr-utils mphashLookup function. We use this
 * to avoid having to store the table's keys at runtime.
 */
export const mphashCreate = <T>(map: { [key: string]: T }): MPHashTable<T> => {
  const keys = Object.keys(map);
  let size = keys.length;
  let i = 0;

  // Increase the size of the table to the next larger prime. This should
  // improve the dispersion of the mapping of keys to slots via our hash function.
  size = nextprime(size);

  // Initialize values array
  const v: T[] = new Array<T>(size);

  // Initialize the buckets and table
  const buckets: string[][] = new Array<string[]>(size);
  const g: number[] = new Array<number>(size);
  for (i = 0; i < size; i++) {
    buckets[i] = [];
    g[i] = 0;
  }

  for (i = 0; i < keys.length; i++) {
    const key = keys[i];
    const h = mphash(0, size, key);
    buckets[h].push(key);
  }

  // Sort buckets by length in reverse.
  buckets.sort((a, b) =>
    a.length < b.length ? 1 : a.length > b.length ? -1 : 0);

  // Process buckets with 2 or more keys
  i = 0;
  while (i < size) {
    const bucket = buckets[i];

    // Stop when we reach a bucket with <= 1 item
    if (bucket.length <= 1) {
      break;
    }

    let d = 1;
    let item = 0;
    let slots: number[] = [];
    const used = new Set<number>();

    // Try different values of d until we find a hash function
    // that places all items into the free slots
    while (item < bucket.length) {
      const slot = mphash(d, size, bucket[item]);
      if (v[slot] !== undefined || used.has(slot)) {
        d++;
        item = 0;
        slots = [];
        used.clear();
      } else {
        used.add(slot);
        slots.push(slot);
        item++;
      }
    }

    g[mphash(0, size, bucket[0])] = d;
    for (let j = 0; j < bucket.length; j++) {
      v[slots[j]] = map[bucket[j]];
    }
    i++;
  }

  // Mark all of the empty slots
  const free: number[] = [];
  for (let j = 0; j < size; j++) {
    if (v[j] === undefined) {
      free.push(j);
    }
  }

  // Place all remaining keys into empty slots
  for (; i < size; i++) {
    const bucket = buckets[i];
    // Stop when we find an empty bucket
    if (!bucket || !bucket.length) {
      break;
    }

    const slot = free.pop()!;

    // Use a negative intermediate value to indicate it is
    // the nth empty slot
    const key = bucket[0];
    g[mphash(0, size, key)] = -slot - 1;
    v[slot] = map[key];
  }

  return { g, v, s: size };
};
