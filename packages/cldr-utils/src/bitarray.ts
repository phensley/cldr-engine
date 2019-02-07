export const bitarrayCreate = (bits: number[]): number[] => {
  const data: number[] = new Array((bits.length >>> 5) + 1);
  for (let i = 0; i < bits.length; i++) {
    const idx = i >>> 5;
    const bit = bits[i];
    if (bit === 0) {
      data[idx] &= ~(1 << i);
    } else {
      data[idx] |= (1 << i);
    }
  }
  return data;
};

export const bitarrayGet = (data: number[], i: number): boolean => {
  const idx = i >>> 5;
  return idx < data.length ? ((data[idx] >>> (i % 32)) & 1) === 1 : false;
};
