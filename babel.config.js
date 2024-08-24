module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-env', // Ensure this is first to handle env-specific transforms
      '@babel/preset-react', // Preset for React
    ],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      ['@babel/plugin-transform-class-properties', {loose: true}],
      ['@babel/plugin-transform-private-methods', {loose: true}],
      ['@babel/plugin-transform-private-property-in-object', {loose: true}],
      ['@babel/plugin-transform-react-jsx', {runtime: 'automatic'}], // Ensure this is after env and react presets
      'react-native-reanimated/plugin', // Always include Reanimated's plugin
    ],
  };
};
