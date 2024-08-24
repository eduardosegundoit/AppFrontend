// Cancel.js
import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';

const CancelScreen = ({navigation}) => {
  return (
    <Layout style={styles.container}>
      <Text category="h1" style={styles.header}>
        Payment Cancelled
      </Text>
      <Text category="s1" style={styles.text}>
        Your payment was cancelled. If this was a mistake, please try again.
      </Text>
      <Button onPress={() => navigation.navigate('Home')} style={styles.button}>
        Go to Home
      </Button>
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
  header: {
    fontSize: 24,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default CancelScreen;
