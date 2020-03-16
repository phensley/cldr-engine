import { LanguageTag } from '@phensley/language-tag';
import { getRegionPartition } from './partition';
import { distanceMap, DistanceMap, DistanceNode } from './autogen.distance';

/**
 * Default distance threshold.
 */
export const DEFAULT_THRESHOLD = 50;

/**
 * Maximum possible distance between two language tags.
 */
export const MAX_DISTANCE = 100;

const get = (map: DistanceMap, want: string, have: string): DistanceNode | undefined => {
  const sub = map[want];
  return sub === undefined ? undefined : sub[have];
};

const getany = (map: DistanceMap): DistanceNode => {
  const sub = map.$;
  /* istanbul ignore else */
  if (sub !== undefined) {
    const node = sub.$;
    /* istanbul ignore else */
    if (node !== undefined) {
      return node;
    }
  }
  /* istanbul ignore next */
  throw new Error('Severe error: wildcard levels missing in distance map.');
};

const _distance = (node: DistanceNode | number): number =>
  typeof node === 'number' ? node : node[0];

/**
 * Return the distance between the desired and supported locale, stopping once
 * the given threshold is exceeded.
 */
export const getDistance = (desired: LanguageTag, supported: LanguageTag, threshold?: number): number => {
  if (typeof threshold !== 'number') {
    threshold = DEFAULT_THRESHOLD;
  }

  // Compare the LANGUAGE subtag.
  let wildcard = false;
  let map = distanceMap;
  let want = desired.language();
  let have = supported.language();

  let node = get(map, want, have);
  if (node === undefined) {
    node = getany(map);
    wildcard = true;
  }

  // Calculate LANGUAGE distance.
  let distance = wildcard ? (want === have ? 0 : _distance(node)) : _distance(node);
  if (distance >= threshold) {
    return MAX_DISTANCE;
  }

  // Move to compare the SCRIPT subtag.
  map = (node as [number, DistanceMap])[1];
  want = desired.script();
  have = supported.script();

  node = get(map, want, have);
  if (node === undefined) {
    node = getany(map);
    wildcard = true;
  } else {
    wildcard = false;
  }

  // Update with SCRIPT distance.
  distance += wildcard ? (want === have ? 0 : _distance(node)) : _distance(node);
  if (distance >= threshold) {
    return MAX_DISTANCE;
  }

  // Move to compare the REGION subtag.
  want = desired.region();
  have = supported.region();

  // If regions are equal, we're done.
  if (want === have) {
    return distance;
  }

  const wantPartitions = getRegionPartition(want);
  const havePartitions = getRegionPartition(have);

  map = (node as [number, DistanceMap])[1];
  node = get(map, want, have);

  // There are currently no region -> region distances, so the node
  // be undefined here.

  /* istanbul ignore else */
  if (node === undefined) {
    // Compare the desired region against supported partitions, and vice-versa.
    node = scanRegion(map, want, wantPartitions, have, havePartitions);
  }

  // If we found something, we're done.
  if (node !== undefined) {
    distance += _distance(node);
    return distance < threshold ? distance : MAX_DISTANCE;
  }

  // Find the maximum distance between partitions.
  let maxDistance = 0;
  let match = false;

  // Try permutations of desired and supported partitions to find the maximum distance.
  for (const dpartition of wantPartitions) {
    for (const spartition of havePartitions) {
      node = get(map, dpartition, spartition);
      if (node !== undefined) {
        maxDistance = Math.max(maxDistance, _distance(node));
        match = true;
      }
    }
  }

  if (!match) {
    node = getany(map);
    // The 'any' lookup will always succeed here
    /* istanbul ignore else */
    if (node !== undefined) {
      maxDistance = Math.max(maxDistance, _distance(node));
    }
  }

  distance += maxDistance;
  return distance < threshold ? distance : MAX_DISTANCE;
};

/**
 * Find the distance between sets of partitions.
 */
const scanRegion = (
  map: DistanceMap,
  want: string,
  wantPartitions: string[],
  have: string,
  havePartitions: string[]): number | undefined => {

  let node = undefined;

  for (const v of wantPartitions) {
    node = get(map, v, have);
    if (typeof node === 'number') {
      return node;
    }
  }

  for (const v of havePartitions) {
    node = get(map, want, v);
    if (typeof node === 'number') {
      return node;
    }
  }

  return undefined;
};
