const reactNativeConfig = require('@react-native/eslint-config/flat');

module.exports = [
  ...reactNativeConfig.filter((config) => !config.plugins?.['ft-flow']),
  {
    rules: {
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    },
  },
];
