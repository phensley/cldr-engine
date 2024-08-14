
import json, os, sys
from collections import OrderedDict
from util import readxml, save

# Builds a temporary patch for 'pluralRanges' JSON from original
# supplemental 'pluralRanges.xml'. This data is currently missing
# from the JSON CLDR export.

ROOT = 'plurals'

def build(root, dest):
    path = os.path.join(root, 'common/supplemental/pluralRanges.xml')
    tree = readxml(path).findall(ROOT)[0]

    ranges = OrderedDict()
    for n in tree.findall('pluralRanges'):
        locales = n.attrib.get('locales').split()
        recs = []
        for c in n.findall('pluralRange'):
            rec = dict((k, v) for k, v in c.attrib.items())
            recs.append(rec)
        for k in locales:
            ranges[k] = recs

    sort = OrderedDict()
    for k in sorted(ranges.keys()):
        sort[k] = ranges[k]

    res = dict(
        supplemental = dict(
            pluralRanges = sort
        )
    )

    path = os.path.join(dest, 'pluralRanges-fix.json')
    save(path, res)

