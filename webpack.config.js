const path = require('path')
const { ContextReplacementPlugin, DefinePlugin } = require('webpack')
const packageConfig = require('./package.json')
const exclude = [/node_modules/]
const normalizeValue = (availableValues, value) => (availableValues.includes(value) ? value : availableValues[0])

/* eslint-disable no-process-env */
const mode = normalizeValue(['development', 'production'], process.env.MODE)
const target = normalizeValue(['web', 'node'], process.env.TARGET)
const module = normalizeValue(['static', 'server', 'seeds'], process.env.MODULE)
/* eslint-enable no-process-env */

const CONST = {
  _TIME_STAMP_: new Date().getTime(),
  _PACKAGE_NAME_: `"${packageConfig.name}"`,
  _DEV_MODE_: isDev
}

const isDev = mode === 'development'

const babelLoader = {
  loader: 'babel-loader',

  options: {
    presets: [['@babel/preset-env', { target: { browsers: 'last 1 Chrome versions' }, modules: false }]],
    plugins: [
      '@babel/plugin-transform-runtime',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      'lodash'
    ]
    // plugins: ['transform-decorators', ['transform-class-properties', { loose: true }], 'lodash'],
    // presets: [['@babel/env', { targets: { browsers: ['last 1 Chrome versions'] }, modules: false }]]
  }
}
const eslintLoader = { loader: 'eslint-loader', options: { cache: true } }
const propertiesLoader = ['json-loader', 'java-properties-loader']
const ractiveLoader = ['./loaders/ractive-loader']
const plugins = [new DefinePlugin(CONST)]

const rules = [
  { test: /\.js$/, exclude, enforce: 'pre', use: eslintLoader },
  { test: /\.properties$/, use: propertiesLoader },
  { test: /\.mustache/, use: ractiveLoader }
]

const outDir = {
  development: '.tmp',
  production: 'dist'
}

const commonConfig = {
  mode,
  target,
  plugins,
  entry: `./src/${module}/index.js`,
  output: { path: path.resolve(__dirname, `./${outDir[mode]}/${module}`), filename: `[name]${isDev ? '' : '.[hash]'}.js` },
  watchOptions: { aggregateTimeout: 300, poll: true, ignored: exclude },
  module: { rules },
  devtool: isDev ? 'cheap-source-map' : undefined,
  externals: target === 'node' ? [require('webpack-node-externals')()] : undefined
}

switch (module) {
  case 'static':
    {
      const ExtractTextPlugin = require('extract-text-webpack-plugin')
      const extractSassPlugin = new ExtractTextPlugin({ filename: '[name].[contenthash].css' })
      const cssLoader = { loader: 'css-loader', options: { minimize: !isDev } }
      const extractSassLoader = extractSassPlugin.extract({ use: [cssLoader, 'sass-loader'], fallback: 'style-loader' })
      const HtmlWebpackPlugin = require('html-webpack-plugin')
      const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

      rules.push(
        { test: /\.js$/, exclude, use: babelLoader },
        { test: /\.html$/, use: 'html-minify-loader' },
        { test: /\.worker\.js$/, exclude, use: 'worker-loader' },
        { test: /\.woff2($|\?)|\.svg($|\?)/, use: 'file-loader' },
        { test: /\.properties$/, use: propertiesLoader },
        { test: /\.scss$/, use: extractSassLoader }
      )

      plugins.push(
        extractSassPlugin,
        new ContextReplacementPlugin([/moment[/\\]locale$/, /en$/]),
        new HtmlWebpackPlugin({ title: 'EBLOG [DEV]', TIME_STAMP: CONST._TIME_STAMP_ }),
        new LodashModuleReplacementPlugin({
          shorthands: true,
          cloning: true,
          currying: true,
          caching: true,
          collections: true,
          exotics: true,
          guards: true,
          metadata: true,
          deburring: true,
          unicode: true,
          chaining: true,
          memoizing: true,
          coercions: true,
          flattening: true,
          paths: true,
          placeholders: true
        })
      )
    }

    break
  case 'server':
    rules.push({ test: /\.graphql$/, exclude, use: 'graphql-import-loader' })
    break
  case 'seeds':
    break
  default:
}

module.exports = commonConfig
