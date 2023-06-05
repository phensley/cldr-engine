import commonjs from '@rollup/plugin-commonjs';
import filesize from "rollup-plugin-filesize";
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const libName = 'cldrengine';
const isProd = process.env.NODE_ENV == 'production';

const plugins = [
  json({
    jsnext: true,
    compact: true,
    preferConst: true,
    namedExports: true
  }),
  resolve({
    mainFields: ['module'],
    extension: ['.js', '.json']
  }),
  commonjs({
    extensions: ['.json', '.js'],
  }),
];

if (isProd) {
  plugins.push(terser({
    output: {
      ecma: 5
    }
  }));
}

plugins.push(filesize({
  showBrotliSize: true
}));

const tasks = [
  {
    input: 'lib-es/index.js',
    output: {
      name: libName,
      file: `dist/${libName}.umd.js`,
      format: 'umd',
      exports: 'named',
      sourcemap: true,
    },
    plugins,
  },
];

export default tasks;
