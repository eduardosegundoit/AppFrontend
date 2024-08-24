/* eslint-disable prettier/prettier */
const { getDefaultConfig } = require('@expo/metro-config');

// Get default configurations from Expo's Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Add any customizations to the defaultConfig here
// Ensure compatibility with React Native Web and other modules
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web') {
      const replacements = {
        'react-native/Libraries/Utilities/Platform': 'react-native-web/dist/exports/Platform',
        'react-native/Libraries/Components/AccessibilityInfo/legacySendAccessibilityEvent': 'react-native-web/dist/exports/AccessibilityInfo',
        'react-native/Libraries/StyleSheet/PlatformColorValueTypes': 'react-native-web/dist/exports/StyleSheet',
        'react-native/Libraries/NativeComponent/PlatformBaseViewConfig': 'identity-obj-proxy',
        'react-native/Libraries/Network/RCTNetworking': 'identity-obj-proxy',
        'react-native/Libraries/Alert/RCTAlertManager': 'identity-obj-proxy',
        'react-native/Libraries/Image/Image': 'identity-obj-proxy',
        'react-native/Libraries/Utilities/BackHandler': 'react-native-web/dist/exports/BackHandler',
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
  }
};

module.exports = defaultConfig;
