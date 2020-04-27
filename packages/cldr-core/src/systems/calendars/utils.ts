/**
 * Compute floor(n / d) and store the remainder in r[0]
 */
export const floorDiv = (n: number, d: number, r: [number]): number => {
  const q = Math.floor(n / d);
  r[0] = n % d;
  return q;
};
