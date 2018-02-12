export class Field {
  constructor(
    readonly ch: string,
    readonly width: number
  ) {}
}

export type DateTimeNode = Field | string;

const patternChars = [
  'G', 'y', 'Y', 'u', 'U', 'r', 'Q', 'q', 'M', 'L', 'l', 'w', 'W', 'd', 'D',
  'F', 'g', 'E', 'e', 'c', 'a', 'b', 'B', 'h', 'H', 'K', 'k', 'j', 'J', 'C',
  'm', 's', 'S', 'A', 'z', 'Z', 'O', 'v', 'V', 'X', 'x']
  .reduce((o: any, c) => {
    o[c] = 1;
    return o;
  }, {});

/**
 * Parse a datetime pattern into an array of nodes.
 */
export const parseDatePattern = (raw: string): DateTimeNode[] => {
  const nodes: DateTimeNode[] = [];
  const len = raw.length;

  let buf = '';
  let field = '';
  let width = 0;
  let inquote = false;
  let i = 0;

  while (i < len) {
    const ch = raw[i];
    if (inquote) {
      if (ch === '\'') {
        inquote = false;
        field = '';
      } else {
        buf += ch;
      }
      i++;
      continue;
    }

    if (patternChars[ch] === 1) {
      if (buf.length > 0) {
        nodes.push(buf);
        buf = '';
      }

      if (ch !== field) {
        if (field !== '') {
          nodes.push(new Field(field, width));
        }

        field = ch;
        width = 1;
      } else {
        // Widen the current field.
        width++;
      }
    } else {
      if (field !== '') {
        nodes.push(new Field(field, width));
      }
      field = '';
      if (ch === '\'') {
        inquote = true;
      } else {
        buf += ch;
      }
    }
    i++;
  }

  if (width > 0 && field !== '') {
    nodes.push(new Field(field, width));
  } else if (buf.length > 0) {
    nodes.push(buf);
  }
  return nodes;
};

/**
 * Scan the date interval pattern and return the index of the first repeated field.
 */
export const intervalPatternBoundary = (pattern: DateTimeNode[]): number => {
  const seen: Set<string> = new Set();
  for (let i = 0; i < pattern.length; i++) {
    const node = pattern[i];
    if (typeof node !== 'string') {
      if (seen.has(node.ch)) {
        return i;
      }
      seen.add(node.ch);
    }
  }
  return -1;
};
