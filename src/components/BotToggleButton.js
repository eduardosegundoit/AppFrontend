import React from 'react';
import { Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleBot } from '../redux/actions';

const BotToggleButton = () => {
  const dispatch = useDispatch();
  const botEnabled = useSelector(state => state.botEnabled);

  return (
    <Button onPress={() => dispatch(toggleBot())} title={botEnabled ? "Stop Bot" : "Start Bot"} />
  );
};

export default BotToggleButton;
