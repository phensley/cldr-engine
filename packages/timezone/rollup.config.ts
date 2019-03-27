import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
// import { dts, ts } from 'rollup-plugin-dts';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const libraryName = 'timezone';

const config = [
  {
    input: `src/index.ts`,
    output: [
      {
        file: `dist/${libraryName}.umd.js`,
        name: libraryName,
        format: 'umd',
        sourcemap: true
      }
    ],
    external: [],
    watch: {
      include: 'src/**',
    },
    plugins: [
      json({
        compact: true
      }),
      resolve({
        jsnext: true,
        extensions: ['.ts'],
      }),
      typescript({
        // verbosity: 3,
        tsconfig: 'tsconfig.build.json',
        tsconfigDefaults: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            resolveJsonModule: true,
            module: 'esnext',
            types: [
              '@phensley/cldr-utils',
              'node'
            ]
          }
        }
      }),
      commonjs(),
      sourceMaps(),
      uglify({}, minify)
    ],
  },
];

export default config;

