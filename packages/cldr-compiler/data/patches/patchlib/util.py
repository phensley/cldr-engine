
from lxml.etree import fromstring

def readxml(path):
    data = open(path, 'rb').read()
    return fromstring(data)

