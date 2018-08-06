const { ContextReplacementPlugin, DefinePlugin } = require('webpack')
const eslintFormatter = require('eslint-formatter-pretty')

const exclude = [/node_modules/]
const normalizeValue = (availableValues, value) => (availableValues.includes(value) ? value : availableValues[0])
const path = require('path')
const packageConfig = require('./package.json')

const MODE = normalizeValue(['production', 'development'], process.env.MODE)
const MODULE = normalizeValue(['web', 'server', 'seeds'], process.env.MODULE)

let TARGET = null
switch (MODULE) {
  case 'web':
    TARGET = 'web'
    break
  default:
    TARGET = 'node'
    break
}

process.env.BABEL_ENV = MODE
process.env.BROWSERSLIST_ENV = MODE

const _TIME_STAMP_ = new Date().getTime()

const isDev = MODE === 'development'
const CONST = {
  _TIME_STAMP_,
  _PACKAGE_NAME_: `${packageConfig.name}`,
  _CACHE_VERSION_: isDev ? 1 : _TIME_STAMP_,
  _DEV_MODE_: isDev
}

const eslintLoader = { loader: 'eslint-loader', options: { formatter: eslintFormatter, cache: true } }
// const ractiveLoader = './loaders/ractive-router-loader'
const babelLoader = { loader: 'babel-loader', options: { comments: false } }

const outDir = { development: 'temp', production: 'dist' }
const commonConfig = {
  mode: MODE,
  target: TARGET,
  entry: [`./src/${MODULE}/index.js`],
  output: {
    path: path.resolve(__dirname, `./${outDir[MODE]}/${MODULE}`),
    filename: `[name]${isDev ? '' : '.[hash]'}.js`,
    publicPath: '/'
  },
  watchOptions: { aggregateTimeout: 1500, poll: true, ignored: exclude },
  module: {
    rules: [{ test: /\.js$/, exclude, use: babelLoader }]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  // devtool: isDev ? 'cheap-source-map' : 'source-map',
  plugins: [new DefinePlugin(CONST)],
  externals: TARGET === 'node' ? [require('webpack-node-externals')()] : undefined,
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}

if (!isDev) {
  commonConfig.module.rules.unshift({ test: /\.js$/, exclude, enforce: 'pre', use: eslintLoader })
}

if (MODULE === 'web') {
  const title = `${CONST._PACKAGE_NAME_.toUpperCase()} ${isDev ? '[DEV]' : ''}`
  const cssLoader = { loader: 'css-loader', options: { minimize: !isDev } }
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
  const StyleLintPlugin = require('stylelint-webpack-plugin')
  const styleUseableLoader = { loader: 'style-loader/useable', options: { singleton: true } }
  const styleLoader = [styleUseableLoader, 'css-loader', 'resolve-url-loader', 'sass-loader']
  const fileLoader = { loader: 'file-loader', options: { name: `assets/[${isDev ? 'name' : 'hash'}].[ext]` } }
  const htmlLoader = {
    loader: 'html-loader',
    options: {
      minimize: isDev,
      caseSensitive: true,
      keepClosingSlash: true,
      removeAttributeQuotes: false,
      removeComments: true,
      removeEmptyAttributes: true,
      ignoreCustomFragments: [/\{\{#[^}]+\}\}/, /\{\{\/[^}]+\}\}/]
    }
  }

  commonConfig.module.rules.push(
    { test: /\.worker\.js$/, exclude, use: 'worker-loader' },
    { test: /\.(woff|woff2|eot|ttf|svg)($|\?)/, use: fileLoader },
    { test: /template\.html$/, use: htmlLoader },
    { test: /index\.scss$/, use: styleLoader },
    { test: /css\.scss$/, use: [cssLoader, 'sass-loader'] },
    { test: /\.graphql/, use: ['graphql-tag/loader'] }
  )

  commonConfig.plugins.push(
    new StyleLintPlugin({ failOnError: !isDev }),
    new ContextReplacementPlugin([/moment[/\\]locale$/, /en$/]),
    new HtmlWebpackPlugin({ title, TIME_STAMP: CONST._TIME_STAMP_ }),
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

module.exports = commonConfig
