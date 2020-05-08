export type DateTimeField = [string, number];

export type DateTimeNode = DateTimeField | string;

// prettier-ignore
export const DATE_PATTERN_CHARS = [
  'G', 'y', 'Y', 'u', 'U', 'r', 'Q', 'q', 'M', 'L', 'l', 'w', 'W', 'd', 'D',
  'F', 'g', 'E', 'e', 'c', 'a', 'b', 'B', 'h', 'H', 'K', 'k', 'j', 'J', 'C',
  'm', 's', 'S', 'A', 'z', 'Z', 'O', 'v', 'V', 'X', 'x'
].reduce((o: any, c, i) => {
  o[c] = i + 1;
  return o;
}, {});

/**
 * Parse a datetime pattern into an array of nodes.
 */
export const parseDatePattern = (raw: string): DateTimeNode[] => {
  const nodes: DateTimeNode[] = [];
  if (!raw) {
    return nodes;
  }
  const len = raw.length;

  let buf = '';
  let field = '';
  let width = 0;
  let inquote = false;
  let i = 0;

  while (i < len) {
    const ch = raw[i];
    if (inquote) {
      if (ch === "'") {
        inquote = false;
        field = '';
      } else {
        buf += ch;
      }
      i++;
      continue;
    }

    if (DATE_PATTERN_CHARS[ch] > 0) {
      if (buf.length > 0) {
        nodes.push(buf);
        buf = '';
      }

      if (ch !== field) {
        if (field !== '') {
          nodes.push([field, width]);
        }

        field = ch;
        width = 1;
      } else {
        // Widen the current field.
        width++;
      }
    } else {
      if (field !== '') {
        nodes.push([field, width]);
      }
      field = '';
      if (ch === "'") {
        inquote = true;
      } else {
        buf += ch;
      }
    }
    i++;
  }

  // In the final state we'll either have a field+width or
  // some characters in the buf.
  if (width > 0 && field !== '') {
    nodes.push([field, width]);
  } else {
    nodes.push(buf);
  }
  return nodes;
};

/**
 * Scan the date interval pattern and return the index of the first repeated field.
 */
export const intervalPatternBoundary = (pattern: DateTimeNode[]): number => {
  // Use bit flags to detect first repeated field.
  const data = [0, 0];
  for (let i = 0; i < pattern.length; i++) {
    const node = pattern[i];
    if (typeof node !== 'string') {
      const n = DATE_PATTERN_CHARS[node[0]];
      const idx = n >>> 5;
      if (((data[idx] >>> n % 32) & 1) === 1) {
        return i;
      }
      data[idx] |= 1 << n;
    }
  }
  return -1;
};
