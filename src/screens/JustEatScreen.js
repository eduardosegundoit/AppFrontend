/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {setJustEatData, setUser} from '../redux/actions';
import {Layout, Input, Button, Card, Text, Icon} from '@ui-kitten/components';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConnectJustEatScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const theme = useSelector(state => state.theme);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      toast[title === 'Success' ? 'success' : 'error'](message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <Formik
      initialValues={{justEatEmail: '', justEatPassword: ''}}
      validationSchema={Yup.object({
        justEatEmail: Yup.string()
          .email('Invalid email address')
          .required('Required'),
        justEatPassword: Yup.string().required('Required'),
      })}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          const justEatResponse = await axios.post(
            'https://lightinggrabber-2ebb31cb9e79.herokuapp.com/justEat/connect',
            {
              justEatEmail: values.justEatEmail.toLowerCase(),
              justEatPassword: values.justEatPassword,
              userId: user.userId,
            },
          );

          if (justEatResponse.status === 200) {
            const justEatData = {
              id: justEatResponse.data.courierId,
              token: justEatResponse.data.userToken,
            };

            dispatch(setJustEatData(justEatData));

            const updatedUserResponse = await axios.post(
              'https://lightinggrabber-2ebb31cb9e79.herokuapp.com/auth/update-just-eat-credentials',
              {
                userId: user.userId,
                justEatEmail: values.justEatEmail.toLowerCase(),
                justEatPassword: values.justEatPassword,
              },
            );

            if (updatedUserResponse.status === 200) {
              dispatch(setUser(updatedUserResponse.data));
            }

            showAlert('Success', 'Connected to Just Eat successfully.');
            navigation.navigate('Home');
          } else {
            showAlert('Error', 'Failed to connect to Just Eat.');
            console.error('Falha na conexão com Just Eat:', justEatResponse.data);
          }
        } catch (error) {
          showAlert('Error', error.response ? error.response.data : error.message);
          console.error('Erro ao conectar com Just Eat:', error.response ? error.response.data : error.message);
        } finally {
          setSubmitting(false);
        }
      }}>
      {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
        <Layout
          style={[
            styles.container,
            theme === 'dark' ? styles.darkContainer : styles.lightContainer,
          ]}
          level="1">
          {Platform.OS === 'web' && <ToastContainer />}
          <Card
            style={[
              styles.warningCard,
              theme === 'dark' ? styles.darkCard : styles.lightCard,
            ]}
            status="warning">
            <Layout
              style={[
                styles.warningContent,
                theme === 'dark' ? styles.darkCard : styles.lightCard,
              ]}>
              <Icon
                name="alert-triangle-outline"
                fill="#FFAA00"
                style={styles.icon}
              />
              <Text style={styles.warningText}>
                Please note: You can only use this app with a valid Just Eat
                account.
              </Text>
            </Layout>
          </Card>

          <Input
            label="Just Eat Email"
            onChangeText={handleChange('justEatEmail')}
            onBlur={handleBlur('justEatEmail')}
            value={values.justEatEmail}
            placeholder="Just Eat Email"
            style={[
              styles.input,
              theme === 'dark' ? styles.darkInput : styles.lightInput,
            ]}
            textStyle={{color: theme === 'dark' ? '#FFFFFF' : '#222B45'}}
            status={
              touched.justEatEmail && errors.justEatEmail ? 'danger' : 'basic'
            }
            caption={
              touched.justEatEmail && errors.justEatEmail
                ? errors.justEatEmail
                : ''
            }
          />
          <Input
            label="Just Eat Password"
            onChangeText={handleChange('justEatPassword')}
            onBlur={handleBlur('justEatPassword')}
            value={values.justEatPassword}
            placeholder="Just Eat Password"
            secureTextEntry
            style={[
              styles.input,
              theme === 'dark' ? styles.darkInput : styles.lightInput,
            ]}
            textStyle={{color: theme === 'dark' ? '#FFFFFF' : '#222B45'}}
            status={
              touched.justEatPassword && errors.justEatPassword
                ? 'danger'
                : 'basic'
            }
            caption={
              touched.justEatPassword && errors.justEatPassword
                ? errors.justEatPassword
                : ''
            }
          />
          <Button onPress={handleSubmit} style={styles.button}>
            Connect to Just Eat
          </Button>
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
  warningCard: {
    marginBottom: 24,
    borderRadius: 8,
    padding: 16,
  },
  darkCard: {
    backgroundColor: '#333B50',
  },
  lightCard: {
    backgroundColor: '#F7F9FC',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    color: '#FFAA00',
  },
});

export default ConnectJustEatScreen;
