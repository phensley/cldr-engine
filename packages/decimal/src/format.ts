export interface Part {
  type: string;
  value: string;
}

export interface DecimalFormatter<T> {
  add(c: string): void;
  render(): T;
}

export class StringDecimalFormatter implements DecimalFormatter<string> {

  protected parts: string[] = [];

  add(c: string): void {
    this.parts.push(c);
  }

  render(): string {
    return this.parts.reverse().join('');
  }

}

export class PartsDecimalFormatter implements DecimalFormatter<Part[]> {

  protected parts: Part[] = [];
  protected curr: string[] = [];

  constructor(
    protected decimal: string,
    protected group: string
  ) { }

  add(c: string): void {
    switch (c) {
    case this.decimal:
      this.parts.push({ type: 'fraction', value: this.curr.reverse().join('') });
      this.parts.push({ type: 'decimal', value: c });
      this.curr = [];
      break;

    case this.group:
      this.parts.push({ type: 'integer', value: this.current() });
      this.parts.push({ type: 'group', value: c });
      this.curr = [];
      break;

    default:
      this.curr.push(c);
      break;
    }
  }

  render(): Part[] {
    if (this.curr.length > 0) {
      this.parts.push({ type: 'integer', value: this.current() });
    }
    return this.parts.reverse();
  }

  private current(): string {
    return this.curr.reverse().join('');
  }

}
