import { Part } from '../../types';

export interface Formatter<T> {
  add(c: string): void;
  render(): T;
}

export class StringFormatter implements Formatter<string> {

  protected parts: string[] = [];

  add(c: string): void {
    this.parts.push(c);
  }

  render(): string {
    return this.parts.reverse().join('');
  }

}

export class PartsFormatter implements Formatter<Part[]> {

  protected parts: Part[] = [];
  protected curr: string[] = [];

  constructor(
    protected decimal: string,
    protected group: string
  ) { }

  add(c: string): void {
    switch (c) {
    case this.decimal:
      this.parts.push({ type: 'digits', value: this.curr.reverse().join('') });
      this.parts.push({ type: 'decimal', value: c });
      this.curr = [];
      break;

    case this.group:
      this.parts.push({ type: 'digits', value: this.current() });
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
      this.parts.push({ type: 'digits', value: this.current() });
    }
    return this.parts.reverse();
  }

  private current(): string {
    return this.curr.reverse().join('');
  }

}
