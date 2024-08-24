// components/PaymentButton.js

import React from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {Button} from '@ui-kitten/components';

const PaymentButton = ({priceId}) => {
  const user = useSelector(state => state.user);

  const handlePayment = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/payment/create-checkout-session',
        {
          userId: user.userId,
          priceId: priceId,
        },
      );

      const {id} = response.data;
      window.location.href = `https://checkout.stripe.com/pay/${id}`;
    } catch (error) {
      console.error('Erro ao iniciar pagamento:', error);
    }
  };

  return <Button onPress={handlePayment}>Subscribe</Button>;
};

export default PaymentButton;
