import { applyMappings, Mapping, Mappings } from './utils';

const mappings: Mapping[] = [
  Mappings.field('relativeTimes').keys().keys().fields([
    ['relative-type--2', 'previous2'],
    ['relative-type--1', 'previous'],
    ['relative-type-0', 'current'],
    ['relative-type-1', 'next'],
    ['relative-type-2', 'next2'],
  ]).remap(0, 2, 3, 1, 4),
  // "relativeTimes", "wide", "previous", "year", <value>

  Mappings.field('relativeTimes').keys().keys().fields([
    ['relativeTime-type-future', 'future'],
    ['relativeTime-type-past', 'past']
  ]).plural('relativeTimePattern', 'pattern').remap(0, 2, 3, 5, 1, 6),
  // "relativeTimes", "wide", "future", "one", "year", <value>

  Mappings.field('relativeTimes').keys().keys()
    .field('displayName').remap(3, 1, 2, 4)
    // "displayName", "year", "wide", <value>
];

export const transformDatefields = (o: any): any => applyMappings(o, mappings);
