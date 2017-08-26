import path from 'path'

export default {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, `../dist/`),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: 'babel-loader'
      }
    ]
  },
  target: 'node',
  node: {
    __dirname: false
  },
  externals: {
    express: 'express'
  }
}