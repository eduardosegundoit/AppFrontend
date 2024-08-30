/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Alert,
  Linking,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {Layout, Text, Button, Toggle, Card} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {toggleBot} from '../redux/actions';
import '../i18n';
import BackgroundFetch from 'react-native-background-fetch';

const HomeScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const theme = useSelector(state => state.theme);
  const user = useSelector(state => state.user);
  const justEatData = useSelector(state => state.justEatData);
  const filters = useSelector(state => state.filters);
  const subscriptionStatus = useSelector(
    state => state.user.subscriptionStatus,
  );
  const trialEnd = useSelector(state => state.user.trialEnd);
  const botActive = useSelector(state => state.botEnabled);
  const dispatch = useDispatch();
  const [boosterActive, setBoosterActive] = useState(false);
  const intervalId = useRef(null);

  const showAlert = (title, message) => {
    console.log(
      `showAlert called with title: ${title} and message: ${message}`,
    );
    Alert.alert(title, message, [{text: 'OK'}]);
  };

  const handleToggleBot = async () => {
    try {
      const response = await axios.post(
        `https://lightinggrabber-2ebb31cb9e79.herokuapp.com/bot/${
          botActive ? 'stop' : 'start'
        }`,
        {
          userId: user._id,
        },
      );

      if (response.status === 200) {
        const botMessage = botActive ? t('Bot Stopped') : t('Bot Started');
        showAlert('Success', botMessage);
        dispatch(toggleBot());
        if (!botActive) {
          startBotTask();
        } else {
          stopBotTask();
        }
      } else {
        showAlert('Error', response.data.message || t('An error occurred'));
      }
    } catch (error) {
      console.error(
        'Erro ao ligar/desligar o bot:',
        error.response ? error.response.data : error.message,
      );
      showAlert(
        'Error',
        error.response?.data?.message ||
          t('An error occurred while toggling the bot.'),
      );
    }
  };

  useEffect(() => {
    const configureBackgroundFetch = async () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        BackgroundFetch.configure(
          {
            minimumFetchInterval: 15,
            stopOnTerminate: false,
            startOnBoot: true,
          },
          async taskId => {
            console.log('[BackgroundFetch] Task Start:', taskId);
            if (botActive) {
              await runBotTask(filters); // Passando os filtros
            }
            BackgroundFetch.finish(taskId);
          },
          error => {
            console.error('[BackgroundFetch] configure failed:', error);
          },
        );

        BackgroundFetch.start();
      } else if (Platform.OS === 'web') {
        if (botActive) {
          intervalId.current = setInterval(async () => {
            console.log('[Web] Running bot task');
            await runBotTask(filters); // Passando os filtros
          }, 30000);
        }

        return () => {
          if (intervalId.current) {
            clearInterval(intervalId.current);
          }
        };
      }
    };

    configureBackgroundFetch();

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botActive, filters]); // Adicionado filters para que o useEffect reaja a mudanças

  const startBotTask = () => {
    console.log('[Bot Task] Starting bot task...');
    if (Platform.OS === 'web') {
      intervalId.current = setInterval(async () => {
        console.log('[Web] Running bot task');
        await runBotTask(filters); // Passando os filtros
      }, 30000); // 30 segundos
    }
  };

  const stopBotTask = () => {
    console.log('[Bot Task] Stopping bot task...');
    if (Platform.OS === 'web' && intervalId.current) {
      clearInterval(intervalId.current);
    }
  };

  const runBotTask = async filters => {
    console.log('[Bot Task] Iniciando a tarefa do bot...');
    try {
      console.log(
        '[Bot Task] Dados Just Eat recebidos na HomeScreen:',
        justEatData,
      );

      if (!justEatData.token || !justEatData.id) {
        console.error('[Bot Task] UserToken ou courierId não definido:', {
          userToken: justEatData.token,
          courierId: justEatData.id,
        });
        return;
      }

      console.log('[Bot Task] Buscando turnos disponíveis...');
      const response = await axios.post(
        `https://lightinggrabber-2ebb31cb9e79.herokuapp.com/justeat/fetchShifts/${justEatData.id}`,
        {
          userToken: justEatData.token,
        },
      );

      const shifts = Array.isArray(response.data.availableShifts)
        ? response.data.availableShifts
        : [];
      console.log('[Bot Task] Turnos disponíveis:', shifts);

      if (shifts.length === 0) {
        console.log('[Bot Task] Nenhum turno disponível no momento.');
        return;
      }

      const filteredShifts = shifts.filter(shift => {
        const {day, time} = convertMillisecondsToDayAndHour(
          shift.shiftTime.start,
        );
        const filter = filters[day];

        // Verifica se o filtro está ativo. Se não estiver, ignore esse dia.
        if (!filter || !filter.active) {
          console.log(
            `[Bot Task] Filtro para ${day} está desativado. Ignorando.`,
          );
          return false;
        }

        const startHour = timeOptions[filter.start];
        const endHour = timeOptions[filter.end];

        // Verifica se o turno está dentro do intervalo de tempo selecionado
        return isTimeInRange(time, startHour, endHour);
      });

      console.log('[Bot Task] Turnos filtrados:', filteredShifts);

      for (const shift of filteredShifts) {
        console.log('[Bot Task] Tentando confirmar turno:', shift);
        try {
          const confirmResponse = await axios.post(
            `https://lightinggrabber-2ebb31cb9e79.herokuapp.com/justeat/confirmShift/${justEatData.id}/${shift.id}`,
            {
              userToken: justEatData.token,
            },
          );

          if (confirmResponse.status === 200) {
            const shiftMessage = `Shift starting at ${new Date(
              shift.shiftTime.start,
            ).toLocaleString()} has been confirmed.`;
            showAlert('Success', shiftMessage);
            console.log('[Bot Task] Turno confirmado:', shift);
          } else {
            console.error(
              '[Bot Task] Erro ao confirmar turno:',
              confirmResponse.data,
            );
          }
        } catch (confirmError) {
          console.error(
            '[Bot Task] Erro ao confirmar turno:',
            confirmError.response
              ? confirmError.response.data
              : confirmError.message,
          );
        }
      }
    } catch (error) {
      console.error(
        '[Bot Task] Erro ao buscar ou confirmar turnos:',
        error.response ? error.response.data : error.message,
      );
    }
  };

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

  const convertMillisecondsToDayAndHour = milliseconds => {
    const date = new Date(milliseconds);
    const day = date.toLocaleString('en-GB', {weekday: 'long'});
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {day, time: `${hours}:${minutes}`};
  };

  const isTimeInRange = (time, start, end) => {
    const [shiftHours, shiftMinutes] = time.split(':').map(Number);
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    const shiftTotalMinutes = shiftHours * 60 + shiftMinutes;
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return (
      shiftTotalMinutes >= startTotalMinutes &&
      shiftTotalMinutes <= endTotalMinutes
    );
  };

  const handleAppStorePress = () => {
    Linking.openURL('https://apps.apple.com');
  };

  const handleGooglePlayPress = () => {
    Linking.openURL('https://play.google.com');
  };

  const handleLanguageChange = language => {
    i18n.changeLanguage(language);
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleToggleBot}
          style={[
            styles.headerButton,
            botActive ? styles.activeBotButton : styles.inactiveBotButton,
          ]}>
          {botActive ? t('stopBot') : t('startBot')}
        </Button>
      ),
      headerStyle: {
        backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF',
      },
      headerTintColor: theme === 'dark' ? '#FFFFFF' : '#222B45',
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleToggleBot}
          style={[
            styles.headerButton,
            botActive ? styles.activeBotButton : styles.inactiveBotButton,
          ]}>
          {botActive ? t('stopBot') : t('startBot')}
        </Button>
      ),
      headerStyle: {
        backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF',
      },
      headerTintColor: theme === 'dark' ? '#FFFFFF' : '#222B45',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, botActive, theme]);

  return (
    <Layout
      style={[
        styles.container,
        theme === 'dark' ? styles.darkContainer : styles.lightContainer,
      ]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text
          category="h1"
          style={[
            styles.header,
            theme === 'dark' ? styles.darkText : styles.lightText,
          ]}>{`${t('hello')}, ${user.name}`}</Text>
        <Text
          category="h6"
          style={[
            styles.trialText,
            theme === 'dark' ? styles.darkText : styles.lightText,
          ]}>
          {t('trialInfo', {trialEnd: moment(trialEnd).format('LL')})}
        </Text>
        <Layout
          style={[
            styles.flagContainer,
            theme === 'dark' ? styles.darkContainer : styles.lightContainer,
          ]}>
          <TouchableOpacity onPress={() => handleLanguageChange('en')}>
            <Image
              source={require('../img/uk2.png')}
              style={[
                styles.flag,
                {backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF'},
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('pt')}>
            <Image
              source={require('../img/br.png')}
              style={[
                styles.flag,
                {backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF'},
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('es')}>
            <Image
              source={require('../img/es2.png')}
              style={[
                styles.flag,
                {backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF'},
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('it')}>
            <Image
              source={require('../img/italian2.png')}
              style={[
                styles.flag,
                {backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF'},
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('hi')}>
            <Image
              source={require('../img/in2.png')}
              style={[
                styles.flag,
                {backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF'},
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('ar')}>
            <Image
              source={require('../img/arab.png')}
              style={[
                styles.flag,
                {backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF'},
              ]}
            />
          </TouchableOpacity>
        </Layout>
        <Card
          style={[
            styles.card,
            theme === 'dark' ? styles.darkCard : styles.lightCard,
          ]}>
          <Text
            category="h5"
            style={theme === 'dark' ? styles.darkText : styles.lightText}>
            {t('instructions')}
          </Text>
          {t('steps', {returnObjects: true}).map((step, index) => (
            <Text
              key={index}
              style={[
                styles.text,
                theme === 'dark' ? styles.darkText : styles.lightText,
              ]}>
              {index + 1}. {step}
            </Text>
          ))}
        </Card>
        <Card
          style={[
            styles.card,
            theme === 'dark' ? styles.darkCard : styles.lightCard,
          ]}>
          <Toggle
            checked={boosterActive}
            onChange={setBoosterActive}
            style={styles.toggle}
            status={boosterActive ? 'success' : 'basic'}>
            <Text style={{color: 'orange'}}>
              {boosterActive
                ? 'Disable Booster Orders'
                : 'Enable Booster Orders'}
            </Text>
          </Toggle>
          <Text
            style={[
              styles.feedbackText,
              theme === 'dark' ? styles.darkText : styles.lightText,
            ]}>
            {t('feedback')}
          </Text>
          <Text
            style={[
              styles.feedbackText,
              theme === 'dark' ? styles.darkText : styles.lightText,
            ]}>
            {t('boosterExplanation')}
          </Text>
        </Card>
        <Layout
          style={[
            styles.imageContainer,
            theme === 'dark' ? styles.darkContainer : styles.lightContainer,
          ]}>
          <TouchableOpacity onPress={handleAppStorePress}>
            <Image
              source={require('../img/appstore.png')}
              style={styles.image}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGooglePlayPress}>
            <Image
              source={require('../img/googleplay.png')}
              style={styles.image}
            />
          </TouchableOpacity>
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
  activeBotButton: {
    backgroundColor: 'red', // Green when bot is active
    borderColor: 'red',
  },
  inactiveBotButton: {
    backgroundColor: 'green', // Red when bot is inactive
    borderColor: 'green',
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
