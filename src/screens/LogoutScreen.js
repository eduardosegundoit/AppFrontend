// screens/LogoutScreen.js
import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {logout} from '../redux/actions';

const LogoutScreen = ({navigation}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
    navigation.navigate('Login');
  }, [dispatch, navigation]);

  return null;
};

export default LogoutScreen;
