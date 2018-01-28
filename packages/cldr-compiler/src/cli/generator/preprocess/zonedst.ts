import * as fs from 'fs';
import { join } from 'path';
import { encoding } from '@phensley/cldr-core';
import { getSupplemental } from '../../../cldr';

const { base100encode, bitarrayCreate } = encoding;

export const getZoneDST = (): any => {
  const path = join(__dirname, '..', '..', '..', '..', 'data', 'timezones', 'temp', 'tzdata.json');
  const raw = fs.readFileSync(path);
  const data = JSON.parse(raw.toString());

  const inverted: any = {};
  for (const row of data) {
    const [ name, _indexed, _untils, _dsts ] = row;
    const [ _offsets, _index ] = _indexed;

    const offsets = _offsets.join(' ');
    const index = _index.map(base100encode).join(' ');
    const untils = _untils.map(base100encode).join(' ');
    const dsts = bitarrayCreate(_dsts).map(base100encode).join(' ');

    const key = [offsets, index, untils, dsts].join('\t');
    const ids = inverted[key] || [];
    ids.push(name);
    inverted[key] = ids;
  }

  const zoneDST: any = {};
  const zoneLinks: any = {};
  Object.keys(inverted).forEach(info => {
    const keys = inverted[info];
    const first = keys[0];
    zoneDST[first] = info;
    keys.slice(1).forEach((k: string) => {
      zoneLinks[k] = first;
    });
  });

  return {
    zoneDST,
    zoneLinks,
  };
};
