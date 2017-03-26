var path = require('path')
var webpack = require('webpack');
//var Visualizer = require('webpack-visualizer-plugin');

/*var path = require('path');
var fs = require('fs');


fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });
 */
var nodeModules = {};
module.exports = {
    externals: nodeModules,
    context: __dirname + path.sep + 'public' + path.sep + 'js',
    entry: __dirname + path.sep + 'public' + path.sep + 'js' + path.sep + 'entry.js',
    output: { 
        path: __dirname + path.sep + 'public' + path.sep + 'js' + path.sep,
        filename: 'bundle.js'
    },
  plugins: [/*new Visualizer({
  filename: './statistics.html'
               }),*/
     new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

                new webpack.DefinePlugin({
      '__DEVTOOLS__': false //set it to true in dev mode
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress:{
        warnings: true
      }
    })
/*        new webpack.DllReferencePlugin({
      context: '.',
      manifest: require('./dist/react-manifest.json')
    }),
  */
    ],
    devtool: "eval",
    module: {
        // so that JSX can be used. 
      loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }}

            //            { test: /\.jsx$/, loaders: ['jsx?harmony'] },
/*                        {
                //tell webpack to use jsx-loader for all *.jsx files
                test: /\.jsx$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            }*/
//            {test: /\.jsx?$/,
//             loaders: ['babel?cacheDirectory']}
        ],
        postLoaders: [
            { loader: "transform-loader/cacheable?brfs" }
        ]
    },
    resolve: {
        root: [
            __dirname + path.sep + 'public' + path.sep + 'js',
        ],
      alias: {
//            'react/addons': __dirname + '/node_modules/react/',
//            'react': __dirname + '/node_modules/react/'        ,
        "inferno":                 __dirname  + path.sep + 'node_modules' + path.sep + 'inferno',        
        "redux":                   __dirname  + path.sep + 'node_modules' + path.sep + 'redux',        
        "inferno-redux":           __dirname  + path.sep + 'node_modules' + path.sep + 'inferno-redux',        
        "inferno-component":       __dirname  + path.sep + 'node_modules' + path.sep + 'inferno-component',        
        "inferno-create-element":  __dirname  + path.sep + 'node_modules' + path.sep + 'inferno-create-element',
        "react":                  "inferno",
        "react-dom":              "inferno",
        "react-redux":            "inferno-redux",
        "react-konva":             __dirname  + path.sep + 'public' + path.sep + 'js' + path.sep + 'inferno-konva-svg.js',
        "konva":                   __dirname  + path.sep + 'public' + path.sep + 'js' + path.sep + 'inferno-konva-svg.js'
        }},
  cache: true
}

