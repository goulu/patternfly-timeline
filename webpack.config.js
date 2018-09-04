// webpack v4
// see https://hackernoon.com/a-tale-of-webpack-4-and-how-to-finally-configure-it-in-the-right-way-4e94c8e7e5c1

const path = require('path');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


var PRODUCTION = process.argv[2] === '-p';


module.exports = {
  entry: require('./webpack/entries')(PRODUCTION),
  output: {
    path: __dirname + "/dist",
    filename: '[name].js',
    library: 'timeline',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        use:  [  'style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },

  externals: {
    d3: 'd3',
  },
  plugins: [
    require('./webpack/plugins')(PRODUCTION),
    // new ExtractTextPlugin(
    //   {filename: 'style.css', disable: false, allChunks: true }
    // ),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css',
    }),
  ]
};