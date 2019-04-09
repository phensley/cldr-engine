declare module 'partial.lenses' {
  export const compose: (...optic: any[]) => any;
  export const get: (lens: any, maybeData: any) => any;
  export const pickIn: (template: any) => any;
  export const props: (...properties: string[]) => any;
  export const remove: (optic: any) => any;
}

declare module 'tar' {
  export class Parse {
    constructor(props?: any);
  }
}
