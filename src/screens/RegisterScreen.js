/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Layout, Input, Button, Text } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [sendCodeStatus, setSendCodeStatus] = useState(null);
  const navigation = useNavigation(); // Navegação do React Navigation
  const theme = useSelector(state => state.theme);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdown);
  }, [timer]);

  const handleSendVerificationCode = async () => {
    if (timer > 0) {
      showAlert('Wait', `Please wait ${timer} seconds before requesting another code.`);
      return;
    }

    try {
      const response = await axios.post(
        'https://lightinggrabber-2ebb31cb9e79.herokuapp.com/auth/send-verification-code',
        {
          phone: phone.startsWith('+') ? phone : `+${phone}`,
        },
      );

      if (response.data.message === 'Verification code sent') {
        setSendCodeStatus('success');
        setTimer(60); // 1 minuto
        showAlert('Success', 'Verification code sent to your phone.');
      } else {
        setSendCodeStatus('error');
        showAlert('Error', response.data.message);
      }
    } catch (error) {
      setSendCodeStatus('error');
      showAlert('Error', error.response ? error.response.data.error : error.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post(
        'https://lightinggrabber-2ebb31cb9e79.herokuapp.com/auth/verify-code',
        {
          phone: phone.startsWith('+') ? phone : `+${phone}`,
          providedCode: verificationCode,
        },
      );
      if (response.data.message === 'Verification code is correct') {
        setVerificationStatus('success');
        showAlert('Success', 'Verification code is correct.');
      } else {
        setVerificationStatus('error');
        showAlert('Error', 'Invalid verification code.');
      }
    } catch (error) {
      setVerificationStatus('error');
      showAlert('Error', error.response ? error.response.data.error : error.message);
    }
  };

  const handleRegister = async () => {
    if (verificationStatus !== 'success') {
      showAlert('Error', 'Please verify your phone number before registering.');
      return;
    }

    try {
      const response = await axios.post('https://lightinggrabber-2ebb31cb9e79.herokuapp.com/auth/register', {
        name,
        email,
        password,
        phone: phone.startsWith('+') ? phone : `+${phone}`,
      });

      if (response.data.message === 'User registered successfully') {
        showAlert('Success', 'User registered successfully.', () => {
          if (Platform.OS === 'web') {
            navigation.navigate('Login'); // Redireciona para a página de login na web
          } else {
            navigation.navigate('Login'); // Usa navegação do React Navigation em dispositivos móveis
          }
        });
      } else {
        showAlert('Error', response.data.message);
      }
    } catch (error) {
      showAlert('Error', error.response ? error.response.data.error : error.message);
    }
  };

  const showAlert = (title, message, onClose = null) => {
    if (Platform.OS === 'web') {
      toast[title === 'Success' ? 'success' : 'error'](message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: onClose
      });
    } else {
      Alert.alert(title, message, onClose ? [{ text: 'OK', onPress: onClose }] : undefined);
    }
  };

  return (
    <Layout
      style={[
        styles.container,
        theme === 'dark' ? styles.darkContainer : styles.lightContainer,
      ]}>
      {Platform.OS === 'web' && <ToastContainer />}
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          theme === 'dark' ? styles.darkInput : styles.lightInput,
        ]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          theme === 'dark' ? styles.darkInput : styles.lightInput,
        ]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[
          styles.input,
          theme === 'dark' ? styles.darkInput : styles.lightInput,
        ]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Input
        label="Phone (+4401234567891)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={[
          styles.input,
          theme === 'dark' ? styles.darkInput : styles.lightInput,
        ]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Button
        onPress={handleSendVerificationCode}
        disabled={timer > 0}
        style={[
          styles.button,
          sendCodeStatus === 'success'
            ? styles.successButton
            : sendCodeStatus === 'error'
              ? styles.errorButton
              : null,
        ]}>
        Send Verification Code
      </Button>
      <Input
        label="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        style={[
          styles.input,
          theme === 'dark' ? styles.darkInput : styles.lightInput,
        ]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Button
        onPress={handleVerifyCode}
        style={[
          styles.button,
          verificationStatus === 'success'
            ? styles.successButton
            : verificationStatus === 'error'
              ? styles.errorButton
              : null,
        ]}>
        Verify Code
      </Button>
      <Button onPress={handleRegister} style={styles.button}>
        Register
      </Button>
      {timer > 0 && (
        <Text>Please wait {timer} seconds before requesting another code.</Text>
      )}
      <View style={styles.loginContainer}>
        <Text
          style={[
            styles.text,
            theme === 'dark' ? styles.darkText : styles.lightText,
          ]}>
          Already registered?
        </Text>
        <Button
          onPress={() => {
            if (Platform.OS === 'web') {
              navigation.navigate('Login'); // Redireciona para a página de login na web
            } else {
              navigation.navigate('Login'); // Usa navegação do React Navigation em dispositivos móveis
            }
          }}
          appearance="ghost">
          Login
        </Button>
      </View>
    </Layout>
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
  successButton: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  errorButton: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  text: {
    marginRight: 8,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#222B45',
  },
});

export default RegisterScreen;
