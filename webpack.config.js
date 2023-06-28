const WrapperPlugin = require('wrapper-webpack-plugin');
const path = require('path');

const outputFiles = [
  {basePath: 'codenames', name: 'codenames-client'},
  {basePath: 'codenames', name: 'codenames-server'}
];

const configs = [];

outputFiles.forEach(file => {
  configs.push({
    entry: './' + file.basePath + '/source/' + file.name + '.ts',
    target: 'es5',
    mode: 'production',
    optimization: { minimizer: [] },
    module: {
      rules: [{
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules|spec.ts$/
        }]
    },
    resolve: {
      extensions: ['.ts']
    },
    output: {
      chunkFormat: false,
      filename: file.name + '.js',
      path: path.resolve(__dirname, file.basePath + '/dist'),
      libraryTarget: 'self'
    },
    plugins: [
      new WrapperPlugin({
        test: /\.js$/, // only wrap output of bundle files with '.js' extension 
        header: '((typeof module !== \'undefined\' ? module : {}).exports = function () { var self={};\n',
        footer: '\nreturn self["default"];})',
        afterOptimizations: true
      })
    ]
  });
});

module.exports = configs;
