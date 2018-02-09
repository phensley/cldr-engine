export class NumberPattern {

  constructor(
    protected nodes: NumberNode[],
    protected maxInt: number,
    protected maxFrac: number,
    protected minFrac: number,
    protected priGroup: number,
    protected secGroup: number
  ) {}

  format(): NumberNode[] {
    return this.nodes;
  }

  maxIntegerDigits(): number {
    return this.maxInt;
  }

  maxFractionDigits(): number {
    return this.maxFrac;
  }

  minFractionDigits(): number {
    return this.minFrac;
  }

  primaryGroupingSize(): number {
    // TODO: this defaulting should probably go elsewhere
    return this.priGroup === 0 ? 3 : this.priGroup;
  }

  secondaryGroupingSize(): number {
    // TODO: this defaulting should probably go elsewhere
    return this.secGroup === 0 ? this.primaryGroupingSize() : this.secGroup;
  }

}

export type NumberNode = string | NumberField;

export enum NumberField {
  MINUS = 0,
  PERCENT = 1,
  CURRENCY = 2,
  NUMBER = 3
}

const MAX_INT = 0;
const MAX_FRAC = 1;
const MIN_FRAC = 2;
const PRI_GROUP = 3;
const SEC_GROUP = 4;

class NumberPatternParser {

  private nodes: NumberNode[] = [];
  private fields: number[] = [0, 0, 0, 0, 0];
  private buf: string = '';
  private attached: boolean = false;

  parse(raw: string): NumberPattern {
    const len = raw.length;

    let ingroup = false;
    let indecimal = false;
    let i = 0;

    while (i < len) {
      let ch = raw[i];
      switch (ch) {
      case "'":
        while (i++ < len) {
          ch = raw[i];
          if (ch === '\'') {
            break;
          }
          this.buf += ch;
        }
        break;

      case '-':
        this.pushText();
        this.nodes.push(NumberField.MINUS);
        break;

      case '%':
        this.pushText();
        this.nodes.push(NumberField.PERCENT);
        break;

      case '\u00a4':
        this.pushText();
        this.nodes.push(NumberField.CURRENCY);
        break;

      case '#':
        this.attach();
        if (ingroup) {
          this.fields[PRI_GROUP]++;
        } else if (indecimal) {
          this.fields[MAX_FRAC]++;
        }
        break;

      case ',':
        this.attach();
        if (ingroup) {
          this.fields[SEC_GROUP] = this.fields[PRI_GROUP];
          this.fields[PRI_GROUP] = 0;
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
          this.fields[PRI_GROUP]++;
        } else if (indecimal) {
          this.fields[MAX_FRAC]++;
          this.fields[MIN_FRAC]++;
        }
        if (!indecimal) {
          this.fields[MAX_INT]++;
        }
        break;

      default:
        this.buf += ch;
        break;
      }

      i++;
    }
    this.pushText();
    return new NumberPattern(
      this.nodes,
      this.fields[MAX_INT],
      this.fields[MAX_FRAC],
      this.fields[MIN_FRAC],
      this.fields[PRI_GROUP],
      this.fields[SEC_GROUP]
    );
  }

  private attach(): void {
    this.pushText();
    if (!this.attached) {
      this.nodes.push(NumberField.NUMBER);
      this.attached = true;
    }
  }

  private pushText(): void {
    if (this.buf.length > 0) {
      this.nodes.push(this.buf);
      this.buf = '';
    }
  }
}

export const parseNumberPattern = (raw: string): NumberPattern => {
  const parser = new NumberPatternParser();
  return parser.parse(raw);
};
