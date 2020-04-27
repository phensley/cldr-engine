// Minimal typings for the parts of benchmark-related modules we use.
// Upstream typings are missing some overloads.

declare module 'benchmark' {

  class Benchmark {
    abort(): Benchmark;
    on(type?: string, listener?: Function): Benchmark;
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
      onAbort?: Function;
      onComplete?: Function;
      onCycle?: Function;
      onError?: Function;
      onReset?: Function;
      onStart?: Function;
      setup?: Function | string;
      teardown?: Function | string;
      fn?: Function | string;
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
      add(name: string, fn: Function | string, options?: Options): Suite;
      add(fn: Function | string, options?: Options): Suite;
      add(name: string, options?: Options): Suite;
      add(options: Options): Suite;
      filter(callback: Function | string): Suite;
      map(callback: Function): string[];
      map(name: string): string[];
      on(type?: string, callback?: Function): Suite;
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
