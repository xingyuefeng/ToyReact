const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack'); // to access built-in plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: './index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts|js|jsx)?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    open: true,
    hot: true
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'ToyReact',
      template:'./temp/index.html'
    }),
  ],

};