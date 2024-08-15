import React, { useEffect } from 'react';
import { StyleSheet, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { Layout, Text, Card, Icon, Button } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

const SupportScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useSelector(state => state.theme);
  const isDarkTheme = theme === 'dark';
  const backgroundColor = isDarkTheme ? '#222B45' : '#FFFFFF';
  const textColor = isDarkTheme ? '#FFFFFF' : '#222B45';
  const cardBackgroundColor = isDarkTheme ? '#1A2138' : '#FFFFFF';

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: isDarkTheme ? '#222B45' : '#FFFFFF',
      },
      headerTintColor: isDarkTheme ? '#FFFFFF' : '#222B45',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, isDarkTheme]);

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleWhatsAppPress = () => {
    Linking.openURL('https://wa.me/+4407415105772');
  };

  return (
    <Layout style={[styles.container, { backgroundColor }]}>
      <Text category='h1' style={[styles.header, { color: textColor }]}>
        {t('support')}
      </Text>
      <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text category='s1' style={[styles.text, { color: textColor }]}>
          {t('contactSupport')}
        </Text>
        <Button
          style={styles.button}
          appearance='ghost'
          accessoryLeft={(props) => <Icon {...props} name='email-outline' fill='#808080' />}
          onPress={handleEmailPress}
        >
          lightinggrabberuk@gmail.com
        </Button>
        <Button
          style={styles.button}
          appearance='ghost'
          accessoryLeft={(props) => <Icon {...props} name='message-circle-outline' fill='#25D366' />}
          onPress={handleWhatsAppPress}
        >
          WhatsApp
        </Button>
      </Card>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
  },
});

export default SupportScreen;
