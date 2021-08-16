// Minimal typings for the parts of benchmark-related modules we use.
// Upstream typings are missing some overloads.

type benchfunc = (...args: any[]) => any;

declare module 'benchmark' {
  class Benchmark {
    abort(): Benchmark;
    on(type?: string, listener?: benchfunc): Benchmark;
    on(types: string[]): Benchmark;
    reset(): Benchmark;
    run(options?: Benchmark.Options): Benchmark;
    toString(): string;
  }

  namespace Benchmark {
    export interface Options {
      async?: boolean;
      defer?: boolean;
      delay?: number;
      id?: string;
      initCount?: number;
      maxTime?: number;
      minSamples?: number;
      minTime?: number;
      name?: string;
      onAbort?: benchfunc;
      onComplete?: benchfunc;
      onCycle?: benchfunc;
      onError?: benchfunc;
      onReset?: benchfunc;
      onStart?: benchfunc;
      setup?: benchfunc | string;
      teardown?: benchfunc | string;
      fn?: benchfunc | string;
      queued?: boolean;
    }

    export class Event {
      constructor(type: string | any);

      aborted: boolean;
      cancelled: boolean;
      currentTarget: any;
      result: any;
      target: any;
      timeStamp: number;
      type: string;
    }

    export class Suite {
      static options: { name: string };

      constructor(name?: string, options?: Options);

      aborted: boolean;
      length: number;
      running: boolean;

      abort(): Suite;
      add(name: string, fn: benchfunc | string, options?: Options): Suite;
      add(fn: benchfunc | string, options?: Options): Suite;
      add(name: string, options?: Options): Suite;
      add(options: Options): Suite;
      filter(callback: benchfunc | string): Suite;
      map(callback: benchfunc): string[];
      map(name: string): string[];
      on(type?: string, callback?: benchfunc): Suite;
      on(types: string[]): Suite;
      push(benchmark: Benchmark): number;
      reset(): Suite;
      run(options?: Options): Suite;
    }
  }

  export = Benchmark;
}

declare module 'beautify-benchmark' {
  function log(): void;
  function add(obj: any): void;
}
