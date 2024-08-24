import React from 'react';
import {StyleSheet} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {setJustEatData, setUser} from '../redux/actions';
import {Layout, Input, Button, Card, Text, Icon} from '@ui-kitten/components';

const ConnectJustEatScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const theme = useSelector(state => state.theme);

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
          // Primeira chamada para conectar à Just Eat
          const justEatResponse = await axios.post(
            'http://localhost:3000/justEat/connect',
            {
              justEatEmail: values.justEatEmail,
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

            // Atualizar usuário com credenciais do Just Eat
            const updatedUserResponse = await axios.post(
              'http://localhost:3000/auth/update-just-eat-credentials',
              {
                userId: user.userId,
                justEatEmail: values.justEatEmail,
                justEatPassword: values.justEatPassword,
              },
            );

            if (updatedUserResponse.status === 200) {
              dispatch(setUser(updatedUserResponse.data));
            }

            navigation.navigate('Home');
          } else {
            console.error(
              'Falha na conexão com Just Eat:',
              justEatResponse.data,
            );
          }
        } catch (error) {
          console.error(
            'Erro ao conectar com Just Eat:',
            error.response ? error.response.data : error.message,
          );
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
