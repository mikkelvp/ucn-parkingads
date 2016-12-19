var path = require('path');
var srcPath = path.join(__dirname, 'app/src');
var buildPath = path.join(__dirname, 'app/dist');

module.exports = {
  context: srcPath,
  entry: path.join(srcPath, 'js', 'index.js'),
  output: {
      path: buildPath,
      filename: 'bundle.js'
  },
  module: {
      loaders: [
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
              presets: ['react', 'es2015']
            }
          },
          { 
            test: /\.css$/, 
            loader: 'style-loader!css-loader'
          },
          {
            test: /\.scss$/,
            loaders: ['style', 'css', 'sass']
          }
      ]
  }
};