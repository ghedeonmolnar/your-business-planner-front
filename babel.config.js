const envConfig = path => [
  'dotenv-import',
  {
    moduleName: '@env',
    path,
    safe: true,
    allowUndefined: false,
  },
];

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    envConfig(process.env.ENVFILE || '.env'),
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-worklets/plugin',
  ],
  overrides: [
    {
      test: /[\\/]react-native-paper[\\/]/,
      plugins: ['optional-require'],
    },
  ],
  env: {
    production: {
      plugins: [
        envConfig(process.env.ENVFILE || '.env.production'),
        'react-native-paper/babel',
      ],
    },
  },
};
