import { Part } from '@phensley/decimal';
import { WrapperNode } from '../parsing/wrapper';

export interface AbstractValue<R> {
  length(): number;
  add(type: string, value: string): void;
  get(i: number): string;
  append(value: R): void;
  insert(i: number, type: string, value: string): void;
  render(): R;
  reset(): void;
  join(...elems: R[]): R;
  wrap(pattern: WrapperNode[], args: R[]): void;
  empty(): R;
}

export class StringValue implements AbstractValue<string> {

  private str: string = '';

  length(): number {
    return this.str.length;
  }

  get(i: number): string {
    return this.str[i] || '';
  }

  add(_type: string, value: string): void {
    this.str += value;
  }

  append(value: string): void {
    this.str += value;
  }

  insert(i: number, _type: string, value: string): void {
    const prefix = this.str.substring(0, i);
    const suffix = this.str.substring(i);
    this.str = `${prefix}${value}${suffix}`;
  }

  render(): string {
    const s = this.str;
    this.str = '';
    return s;
  }

  reset(): void {
    this.str = '';
  }

  join(...str: string[]): string {
    return str.join('');
  }

  wrap(pattern: WrapperNode[], args: string[]): void {
    for (const n of pattern) {
      if (typeof n === 'string') {
        this.add('literal', n);
      } else {
        const arg = args[n];
        if (arg) {
          this.str += arg;
        }
      }
    }
  }

  empty(): string {
    return '';
  }

}

export class PartsValue implements AbstractValue<Part[]> {

  private parts: Part[] = [];

  length(): number {
    return this.parts.length;
  }

  get(i: number): string {
    const p = this.parts[i];
    return p ? p.value : '';
  }

  add(type: string, value: string): void {
    this.parts.push({ type, value });
  }

  append(value: Part[]): void {
    for (const p of value) {
      this.parts.push(p);
    }
  }

  insert(i: number, type: string, value: string): void {
    this.parts.splice(i, 0, { type, value });
  }

  render(): Part[] {
    const p = this.parts;
    this.parts = [];
    return p;
  }

  reset(): void {
    this.parts = [];
  }

  join(...parts: Part[][]): Part[] {
    return ([] as Part[]).concat(...parts);
  }

  wrap(pattern: WrapperNode[], args: Part[][]): void {
    for (const n of pattern) {
      if (typeof n === 'string') {
        this.add('literal', n);
      } else {
        for (const p of args[n] || []) {
          this.parts.push(p);
        }
      }
    }
  }

  empty(): Part[] {
    return [];
  }

}
