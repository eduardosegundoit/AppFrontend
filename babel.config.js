module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-react', '@babel/preset-env'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      ['@babel/plugin-transform-class-properties', {loose: true}],
      ['@babel/plugin-transform-private-methods', {loose: true}],
      ['@babel/plugin-transform-private-property-in-object', {loose: true}],
      ['@babel/plugin-transform-react-jsx', {runtime: 'automatic'}],
      'react-native-reanimated/plugin',
    ],
  };
};
