import { Code, HEADER, NOLINT } from './util';
import { RBNFPacker } from '../../../resource/rbnf';
import { RBNFCollector } from '../../../rbnf';

export const getRBNF = (_data: any): Code[] => {
  const codes: Code[] = [];

  const collector = new RBNFCollector();
  collector.load();
  const packer = new RBNFPacker(collector);

  let code = HEADER + NOLINT;
  code += `export const rbnfRulesets: any = `;
  code += packer.pack('root');
  code += ';\n';

  codes.push(Code.rbnf(['autogen.rbnf.ts'], code));

  code = packer.report();
  codes.push(Code.top(['notes', 'rbnf-names.txt'], code));

  return codes;
};
