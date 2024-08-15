import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, Linking, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Layout, Text, Button, Toggle, Card } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { toggleBot } from '../redux/actions';
import '../i18n'; 

const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const theme = useSelector(state => state.theme);
  const user = useSelector(state => state.user);
  const justEatData = useSelector(state => state.justEatData);
  const filters = useSelector(state => state.filters);
  const subscriptionStatus = useSelector(state => state.user.subscriptionStatus);
  const trialEnd = useSelector(state => state.user.trialEnd);
  const botActive = useSelector(state => state.botEnabled);
  const dispatch = useDispatch();
  const [boosterActive, setBoosterActive] = useState(false);

  const handleToggleBot = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/bot/${botActive ? 'stop' : 'start'}`, {
        userId: user._id,
      });

      if (response.status === 200) {
        Alert.alert(
          botActive ? t('Bot Stopped') : t('Bot Started'),
          response.data.message,
          [{ text: 'OK' }]
        );
        dispatch(toggleBot());
      } else {
        Alert.alert(
          t('Error'),
          response.data.message || t('An error occurred'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao ligar/desligar o bot:', error.response ? error.response.data : error.message);
      Alert.alert(
        t('Error'),
        error.response?.data?.message || t('An error occurred while toggling the bot.'),
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF',
      },
      headerTintColor: theme === 'dark' ? '#FFFFFF' : '#222B45',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: () => (
        <Button
          onPress={handleToggleBot}
          status={botActive ? 'danger' : 'success'}
          style={styles.headerButton}
        >
          {botActive ? t('stopBot') : t('startBot')}
        </Button>
      ),
    });
  }, [navigation, theme, botActive, dispatch, t]);

  useEffect(() => {
    let interval;
    if (botActive) {
      interval = setInterval(async () => {
        try {
          console.log('Dados Just Eat recebidos na HomeScreen:', justEatData);

          if (!justEatData.token || !justEatData.id) {
            console.error('UserToken ou courierId não definido:', { userToken: justEatData.token, courierId: justEatData.id });
            return;
          }

          const response = await axios.post(`http://localhost:3000/justeat/fetchShifts/${justEatData.id}`, {
            userToken: justEatData.token,
          });

          const shifts = Array.isArray(response.data.availableShifts) ? response.data.availableShifts : [];
          console.log('Turnos disponíveis:', shifts);

          if (shifts.length === 0) {
            console.log('Nenhum turno disponível no momento.');
            return;
          }

          const filteredShifts = shifts.filter(shift => {
            const { day, time } = convertMillisecondsToDayAndHour(shift.shiftTime.start);
            const filter = filters[day];
            if (filter && filter.active) {
              const startHour = timeOptions[filter.start];
              const endHour = timeOptions[filter.end];
              return isTimeInRange(time, startHour, endHour);
            }
            return false;
          });

          console.log('Turnos filtrados:', filteredShifts);

          for (const shift of filteredShifts) {
            try {
              const confirmResponse = await axios.post(`http://localhost:3000/justeat/confirmShift/${justEatData.id}/${shift.id}`, {
                userToken: justEatData.token,
              });

              if (confirmResponse.status === 200) {
                console.log('Turno confirmado:', shift);
                Alert.alert(
                  "Shift Confirmed",
                  `Shift starting at ${new Date(shift.shiftTime.start).toLocaleString()} has been confirmed.`,
                  [{ text: "OK" }]
                );
              } else {
                console.error('Erro ao confirmar turno:', confirmResponse.data);
              }
            } catch (confirmError) {
              console.error('Erro ao confirmar turno:', confirmError.response ? confirmError.response.data : confirmError.message);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar ou confirmar turnos:', error.response ? error.response.data : error.message);
        }
      }, 30000); // Verificar a cada 30 segundos
    }

    return () => clearInterval(interval);
  }, [botActive, filters, justEatData]);

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        const hour = i.toString().padStart(2, '0');
        const minutes = (j * 15).toString().padStart(2, '0');
        times.push(`${hour}:${minutes}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const convertMillisecondsToDayAndHour = (milliseconds) => {
    const date = new Date(milliseconds);
    const day = date.toLocaleString('en-GB', { weekday: 'long' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return { day, time: `${hours}:${minutes}` };
  };

  const isTimeInRange = (time, start, end) => {
    const [shiftHours, shiftMinutes] = time.split(':').map(Number);
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    const shiftTotalMinutes = shiftHours * 60 + shiftMinutes;
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return shiftTotalMinutes >= startTotalMinutes && shiftTotalMinutes <= endTotalMinutes;
  };

  const handleAppStorePress = () => {
    Linking.openURL('https://apps.apple.com');
  };

  const handleGooglePlayPress = () => {
    Linking.openURL('https://play.google.com');
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleToggleBot}
          status={botActive ? 'danger' : 'success'}
          style={styles.headerButton}
        >
          {botActive ? t('stopBot') : t('startBot')}
        </Button>
      ),
    });
  };

  return (
    <Layout style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text category='h1' style={[styles.header, theme === 'dark' ? styles.darkText : styles.lightText]}>{`${t('hello')}, ${user.name}`}</Text>
        <Text category='h6' style={[styles.trialText, theme === 'dark' ? styles.darkText : styles.lightText]}>
          {t('trialInfo', { trialEnd: moment(trialEnd).format('LL') })}
        </Text>
        <Layout style={[styles.flagContainer, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
          <TouchableOpacity onPress={() => handleLanguageChange('en')}>
            <Image source={require('../img/uk2.png')} style={[styles.flag, { backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('pt')}>
            <Image source={require('../img/br.png')} style={[styles.flag, { backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('es')}>
            <Image source={require('../img/es2.png')} style={[styles.flag, { backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('it')}>
            <Image source={require('../img/italian2.png')} style={[styles.flag, { backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('hi')}>
            <Image source={require('../img/in2.png')} style={[styles.flag, { backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('ar')}>
            <Image source={require('../img/arab.png')} style={[styles.flag, { backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF' }]} />
          </TouchableOpacity>
        </Layout>
        <Card style={[styles.card, theme === 'dark' ? styles.darkCard : styles.lightCard]}>
          <Text category='h5' style={theme === 'dark' ? styles.darkText : styles.lightText}>{t('instructions')}</Text>
          {t('steps', { returnObjects: true }).map((step, index) => (
            <Text key={index} style={[styles.text, theme === 'dark' ? styles.darkText : styles.lightText]}>{index + 1}. {step}</Text>
          ))}
        </Card>
        <Card style={[styles.card, theme === 'dark' ? styles.darkCard : styles.lightCard]}>
          <Toggle
            checked={boosterActive}
            onChange={setBoosterActive}
            style={styles.toggle}
            status={boosterActive ? 'success' : 'basic'}
          >
            <Text style={{ color: 'orange' }}>
              {boosterActive ? "Disable Booster Orders" : "Enable Booster Orders"}
            </Text>
          </Toggle>
          <Text style={[styles.feedbackText, theme === 'dark' ? styles.darkText : styles.lightText]}>
            {t('feedback')}
          </Text>
          <Text style={[styles.feedbackText, theme === 'dark' ? styles.darkText : styles.lightText]}>
            {t('boosterExplanation')}
          </Text>
        </Card>
        <Layout style={[styles.imageContainer, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
          <Image source={require('../img/appstore.png')} style={styles.image} onPress={handleAppStorePress} />
          <Image source={require('../img/googleplay.png')} style={styles.image} onPress={handleGooglePlayPress} />
        </Layout>
        <Text style={styles.footer}>{t('footer')}</Text>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#222B45',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#222B45',
  },
  trialText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
  },
  headerButton: {
    marginRight: 16,
  },
  flagContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  flag: {
    width: 40,
    height: 30,
    marginHorizontal: 8,
  },
  card: {
    marginVertical: 16,
    width: '100%',
    padding: 16,
  },
  darkCard: {
    backgroundColor: '#333B50',
  },
  lightCard: {
    backgroundColor: '#F7F9FC',
  },
  text: {
    marginVertical: 8,
  },
  toggle: {
    marginVertical: 16,
  },
  feedbackText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 16,
  },
  image: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  footer: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#888',
  },
});

export default HomeScreen;
