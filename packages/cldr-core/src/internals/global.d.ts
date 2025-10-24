declare global {
  // Define global process for browser environment that can be checked at runtime.
  // We can check `typeof process !== 'undefined'` to use the global in Node but
  // skip in browsers.
  const process: {
    hrtime: () => [number, number];
  };
}

export {};
