const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
process.env.NODE_ENV = 'production';
module.exports = {
  entry: ['./app/root.js'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'javascripts/[name].js',
    sourceMapFilename: '[name].map',
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: function() {
          return [
            autoprefixer({
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9',
              ]
            }),
          ];
        }
      }
    }),
 /* new webpack.optimize.UglifyJsPlugin(),
 new webpack.DefinePlugin({
 'process.env': {
  NODE_ENV: JSON.stringify('production')
 }
  })*/
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(eot|woff|ttf|svg|wof2)(\?\S*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]?[hash]'
            }
          }
        ]
      },
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.scss$/,
          /\.css$/,
          /\.json$/,
          /\.svg$/
        ],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'media/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader?importLoaders=1',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader'
        },
              {
                loader: 'css-loader'
              },
              {
                loader: 'sass-loader',
                options: {
                  localIdentName: '_[hash:base64:4]'
                }
              }]
      },
      {
        test: /\.(js|jsx)$/,
        include: [/(app|test)/],
        loader: 'babel-loader'
      },

    ]
  }
};
