import json, os
from lxml.etree import fromstring

def readxml(path):
    data = open(path, 'rb').read()
    return fromstring(data)

def save(dest, obj):
    json.dump(obj, open(dest, 'wb'), indent=2, sort_keys=1, ensure_ascii=0)

def makedirs(path):
    if not os.path.exists(path):
        os.makedirs(path)

def to_utf8(obj):
    if isinstance(obj, dict):
        return dict((k, to_utf8(v)) for k, v in obj.iteritems())
    elif isinstance(obj, list):
        return list(to_utf8(v) for v in obj)
    elif isinstance(obj, unicode):
        return obj.encode('utf-8')
    return obj

