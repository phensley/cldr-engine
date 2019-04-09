import { lineWrap, Code, HEADER } from './util';

export const getUnits = (data: any): Code[] => {
  let code = `${HEADER}`;

  const values: string[] = [];
  data.units.forEach((s: string) => {
    const index = s.indexOf('-');
    // unit categories not yet used
    // const category = s.substring(0, index);
    const value = s.substring(index + 1);
    // const name = enumName(value);
    values.push(`'${value}'`);
  });

  // code += 'export const UnitValues: UnitType[] = [\n';
  // code += lineWrap(60, ',', values);
  // code += '\n];\n\n';

  const unitType = lineWrap(60, ' | ', values);
  code += `export type UnitType = ${unitType};`;

  return [
    Code.schema(['schema', 'units', 'autogen.units.ts'], code)
  ];
};
