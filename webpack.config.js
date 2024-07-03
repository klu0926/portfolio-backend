const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    bucket: './public/javascripts/bucket/bucketMVC.js',
    write: [
      './public/javascripts/write/quill.js',
      './public/javascripts/write/write.js'
    ],
    posts: './public/javascripts/posts/posts.js'
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
  // Remove HtmlWebpackPlugin from plugins array
  plugins: [],
};
