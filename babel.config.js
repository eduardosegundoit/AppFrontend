module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from', // Adicione esta linha
      'react-native-reanimated/plugin', // Certifique-se de que esta linha está presente
    ],
  };
};
