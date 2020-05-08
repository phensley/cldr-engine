export const enum NumberField {
  MINUS = 0,
  PERCENT = 1,
  CURRENCY = 2,
  NUMBER = 3,
  EXPONENT = 4,
  PLUS = 5,
}

export interface NumberPattern {
  nodes: NumberNode[];
  minInt: number;
  maxFrac: number;
  minFrac: number;
  priGroup: number;
  secGroup: number;
}

export type NumberNode = string | NumberField;

const MINUS_NODE: NumberNode[] = [NumberField.MINUS];

const newPattern = (): NumberPattern => ({ nodes: [], minInt: 0, maxFrac: 0, minFrac: 0, priGroup: 0, secGroup: 0 });

class NumberPatternParser {
  private curr: NumberPattern = newPattern();
  private buf: string = '';
  private attached: boolean = false;

  parse(raw: string): NumberPattern[] {
    const len = raw.length;

    let save: NumberPattern | undefined;
    let curr = this.curr;
    let ingroup = false;
    let indecimal = false;
    let i = 0;

    outer: while (i < len) {
      let ch = raw[i];
      switch (ch) {
        case "'":
          while (i++ < len) {
            ch = raw[i];
            if (ch === "'") {
              break;
            }
            this.buf += ch;
          }
          break;

        case ';':
          // If we encounter more than one pattern separator, bail out
          if (save) {
            break outer;
          }
          this.pushText();
          // Save current pattern and start parsing a new one
          save = curr;
          curr = newPattern();
          this.curr = curr;
          // Reset state for next parse
          indecimal = false;
          ingroup = false;
          this.attached = false;
          break;

        case '-':
          this.pushText();
          curr.nodes.push(NumberField.MINUS);
          break;

        case '%':
          this.pushText();
          curr.nodes.push(NumberField.PERCENT);
          break;

        case '\u00a4':
          this.pushText();
          curr.nodes.push(NumberField.CURRENCY);
          break;

        case 'E':
          this.pushText();
          curr.nodes.push(NumberField.EXPONENT);
          break;

        case '+':
          this.pushText();
          curr.nodes.push(NumberField.PLUS);
          break;

        case '#':
          this.attach();
          if (ingroup) {
            curr.priGroup++;
          } else if (indecimal) {
            curr.maxFrac++;
          }
          break;

        case ',':
          this.attach();
          if (ingroup) {
            curr.secGroup = curr.priGroup;
            curr.priGroup = 0;
          } else {
            ingroup = true;
          }
          break;

        case '.':
          ingroup = false;
          this.attach();
          indecimal = true;
          break;

        case '0':
          this.attach();
          if (ingroup) {
            curr.priGroup++;
          } else if (indecimal) {
            curr.maxFrac++;
            curr.minFrac++;
          }
          if (!indecimal) {
            curr.minInt++;
          }
          break;

        default:
          this.buf += ch;
          break;
      }

      i++;
    }
    this.pushText();
    if (save === undefined) {
      // Derive positive from negative by prepending a minus node
      const { nodes, minInt, maxFrac, minFrac, priGroup, secGroup } = curr;
      save = curr;
      curr = { nodes: MINUS_NODE.concat(nodes.slice(0)), minInt, maxFrac, minFrac, priGroup, secGroup };
    }
    return [save, curr];
  }

  private attach(): void {
    this.pushText();
    if (!this.attached) {
      this.curr.nodes.push(NumberField.NUMBER);
      this.attached = true;
    }
  }

  private pushText(): void {
    if (this.buf.length > 0) {
      this.curr.nodes.push(this.buf);
      this.buf = '';
    }
  }
}

export const parseNumberPattern = (raw: string): NumberPattern[] => new NumberPatternParser().parse(raw);
