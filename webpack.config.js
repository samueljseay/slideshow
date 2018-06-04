const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: "./js/index.js",
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        exclude: /node_modules/,
        use: {
          loader: "url-loader?limit=1024&name=/fonts/[name].[ext]"
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      }
    ]
  },
  output: {
    filename: "./public/app.js"
  },
  plugins: [new UglifyJsPlugin()]
};
