export const stringToObject = (raw: string, d1: string, d2: string): { [x: string]: string } => {
  const o: { [x: string]: string } = {};
  for (const part of raw.split(d1)) {
    const [k, v] = part.split(d2);
    o[k] = v;
  }
  return o;
};
