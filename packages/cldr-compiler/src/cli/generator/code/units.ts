import { lineWrap, Code, HEADER } from './util';

export const getUnits = (data: any): Code[] => {
  let code = `${HEADER}`;

  const values: string[] = [];
  const categoryMap: { [unit: string]: string } = {};
  data.units.forEach((s: string) => {
    const index = s.indexOf('-');
    // unit categories not yet used
    const category = s.substring(0, index);
    const value = s.substring(index + 1);
    // const name = enumName(value);
    values.push(`'${value}'`);
  });

  const unitType = lineWrap(60, ' | ', values);
  code += `export type UnitType = ${unitType};`;

  // TODO: use minimal perfect hashing to map units to their categories

  return [
    Code.types(['autogen.units.ts'], code)
  ];
};
