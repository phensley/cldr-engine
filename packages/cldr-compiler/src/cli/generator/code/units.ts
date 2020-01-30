import { lineWrap, Code, HEADER, NOLINT_MAXLINE } from './util';
import { mphashCreate } from '../../../mphash';

export const getUnits = (data: any): Code[] => {
  let code = `${HEADER}${NOLINT_MAXLINE}\n`;

  const units: string[] = [];
  const categoryMap: { [unit: string]: number } = {};
  const categories: string[] = [];

  data.units.forEach((s: string) => {
    const index = s.indexOf('-');
    const category = s.substring(0, index);
    const unit = s.substring(index + 1);

    const cat = `'${category}'`;
    let i = categories.indexOf(cat);
    if (i === -1) {
      i = categories.length;
      categories.push(cat);
    }
    categoryMap[unit] = i;

    units.push(`'${unit}'`);
  });

  const unitType = lineWrap(60, ' | ', units);
  code += `export type UnitType = ${unitType};\n\n`;

  const unitCategory = lineWrap(60, ' | ', categories);
  code += `export type UnitCategory = ${unitCategory};\n\n`;

  code += `export const unitCategories: UnitCategory[] = [${categories.join(', ')}];\n\n`;

  const vals = (nums: number[]) => nums.map(n => n === undefined ? '' : `${n}`).join(', ');

  const hash = mphashCreate(categoryMap);
  code += `// Minimal perfect hash mapping units to the index of their category\n`;
  code += `export const unitCategoryMapG: number[] = [${vals(hash.g)}];\n`;
  code += `export const unitCategoryMapV: (number | undefined)[] = [${vals(hash.v)}];\n`;
  code += `export const unitCategoryMapS: number = ${hash.s};\n`;

  return [
    Code.types(['autogen.units.ts'], code)
  ];
};
