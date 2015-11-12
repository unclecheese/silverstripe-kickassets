var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var PROD = JSON.parse(process.env.PROD || "0");

module.exports = {  
  entry: './javascript/src/index.js',
  output: {
    path: './javascript/build', // This is where images AND js will go
    publicPath: '', // This is used to generate URLs to e.g. images
    filename: PROD ? 'bundle.min.js' : 'bundle.js'
  },

  module: {
    loaders: [,
      { 
        test: /\.js$/, 
        loader: 'babel-loader?stage=0',
        exclude: /(node_modules|bower_components)/
      },
      { 
        test: /\.less$/, 
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
      },
      { 
        test: /\.css$/, 
        loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      },
      { 
        test: /\.(otf|eot|svg|ttf|woff|woff2)$/,
        loader: 'url-loader?limit=8192' 
      },
      { 
        test: /\.png$/, 
        loader: "url-loader?limit=100000&mimetype=image/png" 
      },
      { 
        test: /\.jpg$/, 
        loader: "file-loader" 
      }      
    ],
    noParse: [/cortex\.js$/, /bluebird\.js$/]
  },
  resolve: {
      modulesDirectories: ["node_modules", "bower_components"]
  },

  plugins: [
    new ExtractTextPlugin("[name].css")
  ]  
};