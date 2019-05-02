import { Code, HEADER, NOLINT } from './util';
import { RBNFPacker } from '../../../resource/rbnf';
import { RBNFCollector } from '../../../rbnf';

export const getRBNF = (_data: any): Code[] => {
  const collector = new RBNFCollector();
  collector.load();
  const packer = new RBNFPacker(collector);

  let code = HEADER + NOLINT;
  code += `export const rbnfRulesets: any = `;
  code += packer.pack('root');
  code += ';\n';

  return [
    Code.core(['systems', 'numbering', 'autogen.rbnf.ts'], code)
  ];
};
