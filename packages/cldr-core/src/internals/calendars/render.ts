import { Part } from '../../types';
import { WrapperNode } from '../../parsing/patterns/wrapper';

// TODO: generalize to work with number formatters

export interface Renderer<R> {
  add(type: string, value: string): void;
  literal(value: string): void;
  get(): R;
  join(...elems: R[]): R;
  wrap(format: WrapperNode[], args: R[]): void;
  empty(): R;
}

export class StringRenderer implements Renderer<string> {

  protected str: string = '';

  literal(value: string): void {
    this.str += value;
  }

  add(type: string, value: string): void {
    this.str += value;
  }

  get(): string {
    const s = this.str;
    this.str = '';
    return s;
  }

  join(...str: string[]): string {
    return str.join('');
  }

  empty(): string {
    return '';
  }

  wrap(pattern: WrapperNode[], args: string[]): void {
    for (const n of pattern) {
      if (typeof n === 'string') {
        this.literal(n);
      } else {
        this.str += args[n] || '';
      }
    }
  }
}

export class PartsRenderer implements Renderer<Part[]> {

  protected parts: Part[] = [];

  literal(value: string): void {
    this.parts.push({ type: 'literal', value });
  }

  add(type: string, value: string): void {
    this.parts.push({ type, value });
  }

  get(): Part[] {
    const p = this.parts;
    this.parts = [];
    return p;
  }

  join(...parts: Part[][]): Part[] {
    return ([] as Part[]).concat(...parts);
  }

  empty(): Part[] {
    return [];
  }

  wrap(pattern: WrapperNode[], args: Part[][]): void {
    for (const n of pattern) {
      if (typeof n === 'string') {
        this.literal(n);
      } else {
        for (const p of args[n] || []) {
          this.parts.push(p);
        }
      }
    }
  }

}
