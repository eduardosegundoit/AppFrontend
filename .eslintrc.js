module.exports = {
  root: true, // Define este arquivo como o ponto de partida para as regras ESLint
  parser: '@babel/eslint-parser', // Usando o parser Babel para suporte a sintaxe moderna
  parserOptions: {
    requireConfigFile: false, // Não requer um arquivo de configuração separado para Babel
    babelOptions: {
      presets: ['@babel/preset-react'], // Inclui o preset React para interpretar JSX
    },
  },
  extends: [
    '@react-native', // Conjunto de regras padrão para projetos React Native
    'eslint:recommended', // Regras recomendadas pela ESLint
    'plugin:react/recommended', // Regras recomendadas para React
  ],
  plugins: ['react', 'react-hooks'], // Plugins para suporte a regras adicionais para React e hooks do React
  settings: {
    react: {
      version: 'detect', // Detecta automaticamente a versão do React
    },
  },
  rules: {
    // Adicione suas regras personalizadas aqui, se necessário
    // Exemplo:
    // "react/prop-types": "off", // Desativa a verificação de PropTypes
  },
};
