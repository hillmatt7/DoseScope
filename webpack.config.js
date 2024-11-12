const path = require('path');

module.exports = {
  entry: './index.js', // Entry point of your React app
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Output bundle
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Transpile ES6+ and JSX
          },
        },
      },
      {
        test: /\.css$/, // Support for CSS imports
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  target: 'electron-renderer', // Target Electron's renderer process
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve both .js and .jsx files
  },
};
