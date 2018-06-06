import { enumName, lineWrap, Code, HEADER } from './util';

export const getUnits = (data: any): Code[] => {
  let code = `${HEADER}import { makeKeyedEnum } from '../../types/enum';\n\n`;

  code += 'export const [ Unit, UnitValues ] = makeKeyedEnum([';

  const values: string[] = [];
  data.units.forEach((s: string) => {
    const index = s.indexOf('-');
    const category = s.substring(0, index);
    const value = s.substring(index + 1);
    const name = enumName(value);
    code += `\n  ['${name}', '${value}'],`;
    values.push(`'${value}'`);
  });
  code += '\n]);\n\n';

  const unitType = lineWrap(60, ' | ', values);
  code += `export type UnitType = ${unitType};`;

  return [
    Code.schema(['schema', 'units', 'autogen.units.ts'], code)
  ];
};
