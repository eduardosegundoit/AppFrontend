/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect} from 'react';
import {
  ApplicationProvider,
  IconRegistry,
  Button,
  Icon,
} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider, useSelector, useDispatch} from 'react-redux';
import {Image, View, StyleSheet, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from './redux/store.js';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import JustEatScreen from './screens/JustEatScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import FilterScreen from './screens/FilterScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import PaymentScreen from './screens/PaymentScreen.js';
import SuccessScreen from './screens/SuccessScreen.js';
import CancelScreen from './screens/CancelScreen.js';
import SupportScreen from './screens/SupportScreen.js';
import LogoutScreen from './screens/LogoutScreen.js';
import customMapping from '../custom-mapping.json';
import {useTranslation} from 'react-i18next';
import './i18n.js';
import ErrorBoundary from './ErrorBoundary';

let toast;
let ToastContainer;

if (Platform.OS === 'web') {
  const reactToastify = require('react-toastify');
  toast = reactToastify.toast;
  ToastContainer = reactToastify.ToastContainer;
  require('react-toastify/dist/ReactToastify.css');
}

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = props => {
  const {t} = useTranslation();
  const theme = useSelector(state => state.theme);
  const backgroundColor = theme === 'light' ? '#fff' : '#222B45';

  return (
    <DrawerContentScrollView {...props} style={{backgroundColor}}>
      <View style={styles.logoContainer}>
        <Image source={require('./img/logo.png')} style={styles.logo} />
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  const {t} = useTranslation();
  const theme = useSelector(state => state.theme);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme === 'light' ? '#fff' : '#222B45',
        },
        drawerLabelStyle: {
          color: theme === 'light' ? '#000' : '#fff',
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('home'),
          drawerIcon: ({color}) => (
            <Icon
              name="home-outline"
              fill="#3366FF"
              style={{width: 22, height: 22}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Filters"
        component={FilterScreen}
        options={{
          title: t('filters'),
          drawerIcon: ({color}) => (
            <Icon
              name="funnel-outline"
              fill="#D3D3D3"
              style={{width: 22, height: 22}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('profile'),
          drawerIcon: ({color}) => (
            <Icon
              name="person-outline"
              fill="#D3D3D3"
              style={{width: 22, height: 22}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: t('payment'),
          drawerIcon: ({color}) => (
            <Icon
              name="credit-card-outline"
              fill="green"
              style={{width: 22, height: 22}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: t('support'),
          drawerIcon: ({color}) => (
            <Icon
              name="question-mark-circle-outline"
              fill="orange"
              style={{width: 22, height: 22}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          title: t('logout'),
          drawerIcon: ({color}) => (
            <Icon
              name="log-out-outline"
              fill="red"
              style={{width: 22, height: 22}}
            />
          ),
          drawerLabelStyle: {color: 'red'},
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const {t} = useTranslation();
  const theme = useSelector(state => state.theme);
  const dispatch = useDispatch();

  const toggleTheme = () => {
    dispatch({type: 'TOGGLE_THEME'});
  };

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerRight: () => (
          <Button appearance="ghost" onPress={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        ),
        headerStyle: {
          backgroundColor: theme === 'light' ? '#fff' : '#222B45',
        },
        headerTintColor: theme === 'light' ? '#000' : '#fff',
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{title: t('login')}}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{title: t('register')}}
      />
      <Stack.Screen
        name="JustEat"
        component={JustEatScreen}
        options={{title: t('justEat')}}
      />
      <Stack.Screen
        name="Home"
        component={DrawerNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{title: t('success')}}
      />
      <Stack.Screen
        name="Cancel"
        component={CancelScreen}
        options={{title: t('cancel')}}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <Provider store={store}>
        <ErrorBoundary>
          <ApplicationProvider
            {...eva}
            theme={eva.dark}
            customMapping={customMapping}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ApplicationProvider>
        </ErrorBoundary>
      </Provider>
    </>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default App;
