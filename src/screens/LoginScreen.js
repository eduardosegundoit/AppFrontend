/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
import React, {useEffect} from 'react';
// eslint-disable-next-line no-unused-vars
import {StyleSheet, View, Platform} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import {Layout, Input, Button, Text} from '@ui-kitten/components';
import {setUser} from '../redux/actions';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme);

  useEffect(() => {
    // Função para verificar o token ao carregar a tela
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Se o token existe, redirecionar o usuário
        navigation.navigate('JustEat', {token});
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <Formik
      initialValues={{email: '', password: ''}}
      validationSchema={Yup.object({
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string().required('Required'),
      })}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          const response = await axios.post(
            'https://lightinggrabber-2ebb31cb9e79.herokuapp.com/auth/login',
            values,
          );
          const userData = {
            userId: response.data.userId,
            token: response.data.token,
            subscriptionStatus: response.data.subscriptionStatus,
            trialEnd: response.data.trialEnd,
          };

          // Salva o token no AsyncStorage
          await AsyncStorage.setItem('token', response.data.token);

          dispatch(setUser(userData));
          navigation.navigate('JustEat', {token: response.data.token});
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }
      }}>
      {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
        <Layout
          style={[
            styles.container,
            theme === 'dark' ? styles.darkContainer : styles.lightContainer,
          ]}>
          <Animatable.Image
            animation="bounceIn"
            duration={1500}
            source={require('../img/logo.png')}
            style={styles.logo}
          />
          <Text
            category="h3"
            style={[
              styles.header,
              theme === 'dark' ? styles.darkText : styles.lightText,
            ]}>
            Lighting Grabber
          </Text>
          <Input
            label="Email"
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            placeholder="Email"
            style={[
              styles.input,
              theme === 'dark' ? styles.darkInput : styles.lightInput,
            ]}
            textStyle={{color: theme === 'dark' ? '#FFFFFF' : '#222B45'}}
            status={touched.email && errors.email ? 'danger' : 'basic'}
            caption={touched.email && errors.email ? errors.email : ''}
          />
          <Input
            label="Password"
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder="Password"
            secureTextEntry
            style={[
              styles.input,
              theme === 'dark' ? styles.darkInput : styles.lightInput,
            ]}
            textStyle={{color: theme === 'dark' ? '#FFFFFF' : '#222B45'}}
            status={touched.password && errors.password ? 'danger' : 'basic'}
            caption={touched.password && errors.password ? errors.password : ''}
          />
          <Button onPress={handleSubmit} style={styles.button}>
            Login
          </Button>
          <View style={styles.registerContainer}>
            <Text
              style={[
                styles.text,
                theme === 'dark' ? styles.darkText : styles.lightText,
              ]}>
              Already registered?
            </Text>
            <Button
              onPress={() => navigation.navigate('Register')}
              appearance="ghost">
              Register
            </Button>
          </View>
        </Layout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#222B45',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#222B45',
  },
  input: {
    marginBottom: 12,
  },
  darkInput: {
    backgroundColor: '#333B50',
  },
  lightInput: {
    backgroundColor: '#F7F9FC',
  },
  button: {
    marginVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  text: {
    marginRight: 8,
  },
});

export default LoginScreen;
