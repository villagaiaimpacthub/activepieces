const path = require('path');
const nodeExternals = require('webpack-node-externals');

// Backend configuration
const backendConfig = {
  entry: './src/backend/main.ts',
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@backend': path.resolve(__dirname, 'src/backend'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/backend'),
    clean: true,
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
};

module.exports = backendConfig;