import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Layout, Input, Button, Text } from '@ui-kitten/components';
import { useSelector } from 'react-redux';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [sendCodeStatus, setSendCodeStatus] = useState(null);
  const navigation = useNavigation();
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
      Alert.alert('Wait', `Please wait ${timer} seconds before requesting another code.`);
      return;
    }

    try {
      console.log(`Requesting verification code for phone: ${phone}`);
      const response = await axios.post('http://localhost:3000/auth/send-verification-code', {
        phone: phone.startsWith('+') ? phone : `+${phone}`
      });

      if (response.data.message === 'Verification code sent') {
        console.log('Verification code sent successfully');
        setSendCodeStatus('success');
        setTimer(60); // 1 minuto
        Alert.alert('Success', 'Verification code sent to your phone.');
      } else {
        console.error('Error:', response.data.message);
        setSendCodeStatus('error');
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error sending verification code:', error.response ? error.response.data.error : error.message);
      setSendCodeStatus('error');
      Alert.alert('Error', error.response ? error.response.data.error : error.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      console.log(`Verifying code: ${verificationCode} for phone: ${phone}`);
      const response = await axios.post('http://localhost:3000/auth/verify-code', {
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        providedCode: verificationCode
      });
      if (response.data.message === 'Verification code is correct') {
        console.log('Verification code is correct');
        setVerificationStatus('success');
        Alert.alert('Success', 'Verification code is correct.');
      } else {
        console.error('Invalid verification code');
        setVerificationStatus('error');
        Alert.alert('Error', 'Invalid verification code.');
      }
    } catch (error) {
      console.error('Error verifying code:', error.response ? error.response.data.error : error.message);
      setVerificationStatus('error');
      Alert.alert('Error', error.response ? error.response.data.error : error.message);
    }
  };

  const handleRegister = async () => {
    if (verificationStatus !== 'success') {
      Alert.alert('Error', 'Please verify your phone number before registering.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/register', {
        name,
        email,
        password,
        phone: phone.startsWith('+') ? phone : `+${phone}`
      });
      console.log(response.data.message);
      if (response.data.message === 'User registered successfully') {
        console.log('User registered successfully');
        Alert.alert('Success', 'User registered successfully.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else if (response.data.message === 'User already exists') {
        console.error('User already exists');
        Alert.alert('Error', 'User already exists.');
      } else {
        console.error('Failed to register user');
        Alert.alert('Error', 'Failed to register user.');
      }
    } catch (error) {
      console.error('Error registering user:', error.response ? error.response.data.error : error.message);
      Alert.alert('Error', error.response ? error.response.data.error : error.message);
    }
  };

  return (
    <Layout style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        style={[styles.input, theme === 'dark' ? styles.darkInput : styles.lightInput]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, theme === 'dark' ? styles.darkInput : styles.lightInput]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, theme === 'dark' ? styles.darkInput : styles.lightInput]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Input
        label="Phone (+4401234567891)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={[styles.input, theme === 'dark' ? styles.darkInput : styles.lightInput]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Button
        onPress={handleSendVerificationCode}
        disabled={timer > 0}
        style={[
          styles.button,
          sendCodeStatus === 'success' ? styles.successButton :
          sendCodeStatus === 'error' ? styles.errorButton : null
        ]}
      >
        Send Verification Code
      </Button>
      <Input
        label="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        style={[styles.input, theme === 'dark' ? styles.darkInput : styles.lightInput]}
        textStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#222B45' }}
      />
      <Button
        onPress={handleVerifyCode}
        style={[
          styles.button,
          verificationStatus === 'success' ? styles.successButton :
          verificationStatus === 'error' ? styles.errorButton : null
        ]}
      >
        Verify Code
      </Button>
      <Button onPress={handleRegister} style={styles.button}>
        Register
      </Button>
      {timer > 0 && <Text>Please wait {timer} seconds before requesting another code.</Text>}
      <View style={styles.loginContainer}>
        <Text style={[styles.text, theme === 'dark' ? styles.darkText : styles.lightText]}>Already registered?</Text>
        <Button onPress={() => navigation.navigate('Login')} appearance='ghost'>
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
