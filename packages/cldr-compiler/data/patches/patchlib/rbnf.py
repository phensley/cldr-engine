import json, os, shutil, sys
from collections import defaultdict

from util import makedirs, readxml, save, to_utf8

def dump():
    groups = defaultdict(set)
    root = '/Users/phensley/temp/cldr-trunk/common/rbnf'
    names = os.listdir(root)
    for name in sorted(names):
        lang, _ = os.path.splitext(name)
        path = os.path.join(root, name)

        tree = readxml(path)
        for group in tree.xpath('//rulesetGrouping'):
            for typ in group.xpath('//ruleset'):
                if typ.attrib.get('access') == 'private':
                    continue
                typename = typ.attrib['type']
                groups[lang].add(typename)

    for lang, types in groups.iteritems():
        print lang, ' '.join(sorted(types))
        print

def get_rules(root):
    r = []
    for n in root.xpath('./rbnfrule'):
        value = n.attrib.get('value')
        radix = n.attrib.get('radix')
        rule = n.text
        if radix:
            value = '%s/%s' % (value, radix)
        if value == 'x,x':
            value = 'x.x'
        value = value.replace(',', '')
        print value
        o = {
            'value': value,
            'rule': rule
        }
        r.append(o)
    return r

def get_rulesets(root):
    r = {}
    for n in root.xpath('./ruleset'):
        name = n.attrib.get('type')
        priv = 1 if n.attrib.get('access') else 0
        rules = get_rules(n)
        r[name] =  {
            'private': priv,
            'rules': rules
        }
    return r

def convert(tree):
    groups = defaultdict(list)
    for n in tree.xpath('//rulesetGrouping'):
        type = n.attrib.get('type')
        rulesets = get_rulesets(n)
        groups[type] = rulesets
    return groups

def build(root, dest):
    dest = os.path.join(dest, 'rbnf')
    shutil.rmtree(dest)
    makedirs(dest)
    path = os.path.join(root, 'common/rbnf')
    names = [os.path.splitext(n)[0] for n in os.listdir(path)]
    for name in names:
        tree = readxml(os.path.join(path, '%s.xml' % name))
        rbnf = convert(tree)
        rbnf = to_utf8(rbnf)
        out = os.path.join(dest, '%s.json' % name)
        save(out, rbnf)

if __name__ == '__main__':
    root = '/Users/phensley/temp/cldr-trunk/common/rbnf'
    tree = readxml(os.path.join(root, 'en.xml'))
    groups = convert(tree)
    print json.dumps(groups, indent=2, sort_keys=1)

