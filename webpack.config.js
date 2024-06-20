const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    bucket: [
      './public/javascripts/bucket/bucketMVC.js'
    ],
    write: [
      './public/javascripts/write/quill.js',
      './public/javascripts/write/write.js'
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/dist'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'bucket.html',
      template: './public/bucket.html',
      chunks: ['bucket']
    }),
    new HtmlWebpackPlugin({
      filename: 'write.html',
      template: './public/write.html',
      chunks: ['write']
    }),
  ]
};
