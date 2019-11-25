export type RangeList = Array<number | Range>;

export interface Range {
  [0]: number;
  [1]: number;
}

export interface Expr {
  [0]: string;
  [1]: number;
  [2]: number;
  [3]: RangeList;
}

export type AndCond = Array<Expr>;

export type OrCond = Array<AndCond>;

export interface Rule {
  // plural category index
  [0]: number;

  // indices of shared OR conditions
  [1]: number[][];
}

export type RuleMap = { [x: string]: Rule[] };
