/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
// screens/LogoutScreen.js
import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {logout} from '../redux/actions';
import {View, Text, ActivityIndicator} from 'react-native';

const LogoutScreen = ({navigation}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const performLogout = async () => {
      await dispatch(logout());
      navigation.navigate('Login');
    };

    performLogout();
  }, [dispatch, navigation]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Logging out...</Text>
    </View>
  );
};

export default LogoutScreen;
