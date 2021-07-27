const path = require('path');

module.exports = {
    target: 'node',
    mode:'production',
    entry: ['@babel/polyfill', './src/index.js'],
    output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
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
  }
};