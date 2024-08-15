import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Text, Card, Select, SelectItem, Button, IndexPath, Icon, Input, Divider } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next'; 
import { updateUserEmailAsync, updateUserPasswordAsync, createCheckoutSession, checkSubscriptionStatus } from '../redux/actions';

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation(); 
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const theme = useSelector(state => state.theme);
  const backgroundColor = theme === 'dark' ? '#222B45' : '#FFFFFF';
  const cardBackgroundColor = theme === 'dark' ? '#333B50' : '#F7F9FC';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#222B45';
  const inputBackgroundColor = theme === 'dark' ? '#333B50' : '#F7F9FC';

  const scrollViewRef = useRef();

  const [selectedOption, setSelectedOption] = useState(new IndexPath(0));
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const options = ['Weekly - £9.99', 'Monthly - £30.00'];

  useEffect(() => {
    // Update the navigation header color based on the theme
    navigation.setOptions({
      headerStyle: {
        backgroundColor: backgroundColor,
      },
      headerTintColor: textColor,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, backgroundColor, textColor]);

  useEffect(() => {
    // Fetch the latest subscription status when the component mounts
    dispatch(checkSubscriptionStatus());
  }, [dispatch]);

  const handleSubscriptionManage = () => {
    Linking.openURL('https://billing.stripe.com/p/login/14kbKMcqc6DX000bII').catch(err =>
      console.error("Couldn't load page", err)
    );
  };

  const handleUpdateEmail = () => {
    dispatch(updateUserEmailAsync(email));
    Alert.alert(t('emailUpdated'), t('emailUpdateSuccess'));
  };

  const handleUpdatePassword = () => {
    dispatch(updateUserPasswordAsync(password));
    Alert.alert(t('passwordUpdated'), t('passwordUpdateSuccess'));
  };

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

  const subscriptionStatusText = user.subscriptionStatus === 'active' ? t('inGoodStanding') : t('expired');
  const subscriptionStatusColor = user.subscriptionStatus === 'active' ? 'success' : 'danger';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <Layout style={[styles.container, { backgroundColor }]}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
          <Text category='h1' style={[styles.header, { color: textColor }]}>{t('profile')}</Text>

          {/* User Information */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Text category='h5' style={[styles.cardHeader, { color: textColor }]}>{t('userInfo')}</Text>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: textColor }]}>{t('name')}:</Text>
              <Text style={[styles.detailText, { color: textColor }]}>{user.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: textColor }]}>{t('phone')}:</Text>
              <Text style={[styles.detailText, { color: textColor }]}>{user.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: textColor }]}>{t('email')}:</Text>
              <Text style={[styles.detailText, { color: textColor }]}>{user.email}</Text>
            </View>
          </Card>

          {/* Just Eat Status */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Text category='h5' style={[styles.cardHeader, { color: textColor }]}>{t('justEatStatus')}</Text>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: textColor }]}>{t('email')}:</Text>
              <Text style={[styles.detailText, { color: textColor }]}>
                {user.justEatEmail ? user.justEatEmail : t('notConnected')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text category='s1' status={user.justEatEmail ? 'success' : 'danger'} style={styles.statusText}>
                {user.justEatEmail ? t('connected') : t('notConnected')}
              </Text>
            </View>
          </Card>

          {/* Subscription Section */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Text category='h5' style={[styles.cardHeader, { color: textColor }]}>{t('subscription')}</Text>
            <Divider style={styles.divider} />
            <Select
              selectedIndex={selectedOption}
              value={options[selectedOption.row]}
              onSelect={index => setSelectedOption(index)}
              style={styles.select}
            >
              {options.map((option, index) => (
                <SelectItem title={option} key={index} />
              ))}
            </Select>
            <Card style={[styles.pricingCard, { backgroundColor: cardBackgroundColor }]}>
              <Text category='h6' style={[styles.centeredText, { color: textColor }]}>
                {selectedOption.row === 0 ? '7 Days - £9.99' : '30 Days - £30.00'}
              </Text>
              <Button
                onPress={() => handlePayment(selectedOption.row === 0 
                  ? 'price_1PfxAvB789YNlFfymPS2yicX'
                  : 'price_1PfxBeB789YNlFfyo40AQZmU')}
                style={styles.button}
                status='primary'
              >
                {t('subscribe')}
              </Button>
            </Card>
            <Text category='s1' status={subscriptionStatusColor} style={{ textAlign: 'center', marginTop: 8 }}>
              {subscriptionStatusText}
            </Text>
            <Button onPress={handleSubscriptionManage} style={styles.manageButton} status='info'>
              {t('manageSubscription')}
            </Button>
          </Card>

          {/* Update Profile Section */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Text category='h5' style={[styles.cardHeader, { color: textColor }]}>{t('updateProfile')}</Text>
            <Divider style={styles.divider} />
            <Input
              label={t('email')}
              placeholder={t('enterNewEmail')}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: inputBackgroundColor }]}
              textStyle={{ color: textColor }}
              placeholderTextColor={theme === 'dark' ? '#888' : '#AAA'}
            />
            <Button onPress={handleUpdateEmail} style={styles.emailUpdateButton} status='primary'>
              {t('updateEmail')}
            </Button>
            <Input
              label={t('password')}
              placeholder={t('enterNewPassword')}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              style={[styles.input, { backgroundColor: inputBackgroundColor }]}
              textStyle={{ color: textColor }}
              placeholderTextColor={theme === 'dark' ? '#888' : '#AAA'}
            />
            <Button onPress={handleUpdatePassword} style={styles.button} status='primary'>
              {t('updatePassword')}
            </Button>
          </Card>
        </ScrollView>
        <TouchableOpacity style={styles.scrollToTopButton} onPress={() => scrollViewRef.current.scrollTo({ y: 0, animated: true })}>
          <Icon name='arrow-upward-outline' fill='#FFFFFF' style={styles.scrollToTopIcon} />
        </TouchableOpacity>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  cardHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
  },
  detailText: {
    flex: 1,
    marginLeft: 8,
  },
  statusText: {
    marginLeft: 8,
  },
  centeredText: {
    textAlign: 'center',
    padding: 0,
    marginVertical: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  manageButton: {
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 8,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(51, 102, 255, 0.7)',
    borderRadius: 24,
    padding: 12,
  },
  scrollToTopIcon: {
    width: 24,
    height: 24,
  },
  emailUpdateButton: {
    marginBottom: 12,
  },
});

export default ProfileScreen;
