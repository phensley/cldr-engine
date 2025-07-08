export type TZC = [number, boolean, number, number];

export const getTZC = (offset: number): TZC => {
  const negative = offset < 0;
  if (negative) {
    offset *= -1;
  }
  offset /= 60000;
  const hours = (offset / 60) | 0;
  const minutes = offset % 60 | 0;
  return [offset, negative, hours, minutes];
};
