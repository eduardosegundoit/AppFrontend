import React, { useEffect } from 'react';
import { StyleSheet, Linking } from 'react-native';
import { Layout, Text, Card, Button } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'; // Import the hook for translations
import { createCheckoutSession } from '../redux/actions';

const PaymentScreen = ({ navigation }) => {
  const { t } = useTranslation(); // Initialize the translation hook
  const theme = useSelector(state => state.theme);
  const isDarkTheme = theme === 'dark';
  const backgroundColor = isDarkTheme ? '#222B45' : '#f7f9fc';
  const textColor = isDarkTheme ? '#ffffff' : '#222b45';
  const cardBackgroundColor = isDarkTheme ? '#1A2138' : '#ffffff';

  const dispatch = useDispatch();

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

  const handlePayment = async (priceId) => {
    try {
      const paymentUrl = await dispatch(createCheckoutSession(priceId));
      if (paymentUrl) {
        Linking.openURL(paymentUrl).catch(err => console.error("Couldn't load page", err));
      }
    } catch (error) {
      console.error("Error during payment process:", error);
    }
  };

  return (
    <Layout style={[styles.container, { backgroundColor }]}>
      <Text category='h1' style={[styles.header, { color: textColor }]}>
        {t('choosePlan')}
      </Text>
      <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text category='h2' style={[styles.cardTitle, { color: textColor }]}>{t('sevenDays')}</Text>
        <Text category='h2' style={[styles.cardPrice, { color: textColor }]}>£9.99</Text>
        <Text category='s1' style={[styles.cardInfo, { color: textColor }]}>{t('accessForSevenDays')}</Text>
        <Button
          style={styles.button}
          onPress={() => handlePayment('price_1PfxAvB789YNlFfymPS2yicX')}
        >
          {t('subscribe')}
        </Button>
      </Card>
      <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text category='h2' style={[styles.cardTitle, { color: textColor }]}>{t('monthly')}</Text>
        <Text category='h2' style={[styles.cardPrice, { color: textColor }]}>£30.00</Text>
        <Text category='s1' style={[styles.cardInfo, { color: textColor }]}>{t('accessForThirtyDays')}</Text>
        <Button
          style={styles.button}
          onPress={() => handlePayment('price_1PfxBeB789YNlFfyo40AQZmU')}
        >
          {t('subscribe')}
        </Button>
      </Card>
      <Text category='s1' style={[styles.footerText, { color: textColor }]}>
        {t('paymentFooter')}
      </Text>
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
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  cardPrice: {
    textAlign: 'center',
    marginBottom: 8,
  },
  cardInfo: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PaymentScreen;
