const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const replacements = {
      'react-native/Libraries/Utilities/Platform':
        'react-native-web/dist/exports/Platform',
      'react-native/Libraries/Components/AccessibilityInfo/legacySendAccessibilityEvent':
        'react-native-web/dist/exports/AccessibilityInfo',
      'react-native/Libraries/StyleSheet/PlatformColorValueTypes':
        'react-native-web/dist/exports/StyleSheet',
      'react-native/Libraries/NativeComponent/PlatformBaseViewConfig':
        'identity-obj-proxy',
      'react-native/Libraries/Network/RCTNetworking': 'identity-obj-proxy',
      'react-native/Libraries/Alert/RCTAlertManager': 'identity-obj-proxy',
      'react-native/Libraries/Image/Image': 'identity-obj-proxy',
      'react-native/Libraries/Utilities/BackHandler':
        'react-native-web/dist/exports/BackHandler',
    };

    const replacement = replacements[moduleName];

    if (replacement) {
      return {
        filePath: require.resolve(replacement),
        type: 'sourceFile',
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = mergeConfig(defaultConfig, {});
