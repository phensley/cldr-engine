
export class Arg {
  constructor(readonly index: number) { }
}

export type WrapperNode = Arg | string;

/**
 * Parse a generic wrapper pattern.
 * Example:  "{1} at {0}"
 */
export const parse = (raw: string): WrapperNode[] => {
  const nodes: WrapperNode[] = [];
  const len = raw.length;

  let buf = '';
  let inquote = false;
  let intag = false;
  let i = 0;

  while (i < len) {
    const ch = raw[i];
    switch (ch) {
    case '{':
      if (buf.length > 0) {
        nodes.push(buf);
        buf = '';
      }
      intag = true;
      break;

    case '}':
      intag = false;
      break;

    case '\'':
      if (inquote) {
        inquote = false;
      } else {
        inquote = true;
      }
      break;

    default:
      if (intag) {
        // Index doesn't exceed single digits.
        nodes.push(new Arg(Number(ch)));
      } else {
        buf += ch;
      }
      break;
    }
    i++;
  }

  if (buf.length > 0) {
    nodes.push(buf);
  }

  return nodes;
};
