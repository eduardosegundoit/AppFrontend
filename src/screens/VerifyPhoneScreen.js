/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const VerifyPhoneScreen = ({navigation}) => {
  return (
    <Formik
      initialValues={{phone: '', verificationCode: ''}}
      validationSchema={Yup.object({
        phone: Yup.string().required('Required'),
        verificationCode: Yup.string().required('Required'),
      })}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          await axios.post('http://localhost:3000/auth/verify-phone', values);
          console.log('Phone verified successfully');
          navigation.navigate('Login');
        } catch (error) {
          console.error(
            'Error verifying phone:',
            error.response ? error.response.data : error.message,
          );
        } finally {
          setSubmitting(false);
        }
      }}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View style={styles.container}>
          <TextInput
            onChangeText={handleChange('phone')}
            onBlur={handleBlur('phone')}
            value={values.phone}
            placeholder="Phone"
            style={styles.input}
          />
          <TextInput
            onChangeText={handleChange('verificationCode')}
            onBlur={handleBlur('verificationCode')}
            value={values.verificationCode}
            placeholder="Verification Code"
            style={styles.input}
          />
          <Button onPress={handleSubmit} title="Verify Phone" />
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default VerifyPhoneScreen;
