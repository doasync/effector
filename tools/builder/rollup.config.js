import {resolve} from 'path'

import babel from 'rollup-plugin-babel'
import resolvePlugin from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default {
  input: resolve(__dirname, 'index.js'),
  plugins: [
    babel({
      babelrc: false,
      presets: [
        '@babel/preset-flow',
        [
          '@babel/preset-env',
          {
            loose: true,
            useBuiltIns: 'entry',
            modules: false,
            shippedProposals: true,
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins: [
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        ['@babel/plugin-proposal-class-properties', {loose: true}],
      ],
    }),
    json(),
    resolvePlugin(),
    commonjs(),
  ],
  external: [
    'path',
    'execa',
    'fs-extra',
    'chroma-js',
    'js-yaml',
    'viz.js',
    'viz.js/full.render.js',
    'sharp',
    'chalk',
    'rollup',
    'rollup-plugin-json',
    'rollup-plugin-babel',
    'rollup-plugin-node-resolve',
    'rollup-plugin-terser',
    'rollup-plugin-commonjs',
    'rollup-plugin-replace',
    'rollup-plugin-size-snapshot',
    'rollup-plugin-visualizer',
    'readable-stream',
    'cross-fetch',
    'zlib',
    'tar-stream',
    'events',
    'assert',
    'string_decoder',
    'buffer',
    'crypto',
    'fs',
    'stream',
  ],
  output: {
    file: resolve(__dirname, '..', 'builder.js'),
    format: 'cjs',
    sourcemap: false,
  },
}
