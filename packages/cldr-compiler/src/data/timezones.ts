import { getSupplemental } from '../cldr';
import { applyMappings, Mapping, Mappings } from './utils';

const mappings: Mapping[] = [
  Mappings.field('metaZones').keys().keys().keys().keys().remap(0, 2, 3, 1, 4),
  Mappings.field('timeZones').keys().field('exemplarCity').remap(2, 1, 3),
  Mappings.field('gmtFormat').remap(0, 1),
  Mappings.field('hourFormat').remap(0, 1),
  Mappings.field('gmtZeroFormat').remap(0, 1),
  Mappings.field('regionFormat').remap(0, 1),

  // Extract a list of names
  Mappings.point('timeZoneIds').field('timeZones').keys().point('1').remap(0, 2, 3),
  Mappings.point('metaZoneIds').field('metaZones').keys().point('1').remap(0, 2, 3),
];

const UNKNOWN = new Set<string>(['CST6CDT', 'EST5EDT', 'MST7MDT', 'PST8PDT']);

let SUPPLEMENTAL: any;

export const transformTimezones = (o: any): any => {
  const m = applyMappings(o, mappings);

  // Fill in missing exemplar cities for all stable timezone ids
  if (!SUPPLEMENTAL) {
    SUPPLEMENTAL = getSupplemental();
  }

  const ids = Object.keys(SUPPLEMENTAL.MetaZones.ranges);
  for (const id of ids) {
    if (m.exemplarCity[id]) {
      continue;
    }

    let city: string[] = [];
    if (id.startsWith('Etc/') || UNKNOWN.has(id)) {
      city = ['Unknown City'];
    } else {
      city = id.split('/').map((x) => x.replace(/_/g, ' '));
    }

    m.exemplarCity[id] = city[city.length - 1];
  }

  return m;
};
