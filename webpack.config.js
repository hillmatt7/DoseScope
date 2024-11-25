// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Entry point for your React app
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Output bundle file
  },
  target: 'electron-renderer', // Set target to 'electron-renderer'
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Process JS and JSX files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel loader
        },
      },
      {
        test: /\.css$/, // Process CSS files
        use: ['style-loader', 'css-loader'], // Use CSS loaders
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Use your index.html as template
      filename: 'index.html', // Output filename
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

