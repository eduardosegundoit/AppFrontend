/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Animated,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Layout, Text, Button, Card, Toggle, Icon} from '@ui-kitten/components';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {setFilters} from '../redux/actions';
import {useTranslation} from 'react-i18next';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const timeOptions = Array.from({length: 96}, (_, i) => {
  const hours = Math.floor(i / 4)
    .toString()
    .padStart(2, '0');
  const minutes = (i % 4) * 15;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
});

const FilterScreen = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const filters = useSelector(state => state.filters);
  const theme = useSelector(state => state.theme);
  const backgroundColor = theme === 'dark' ? '#222B45' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#222B45';

  const scrollViewRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const defaultStartTimeIndex = 0;
  const defaultEndTimeIndex = 95;

  const [selectedFilters, setSelectedFilters] = useState(
    Object.fromEntries(
      daysOfWeek.map(day => [
        day,
        {
          ...filters[day],
          start: filters[day]?.start ?? defaultStartTimeIndex,
          end: filters[day]?.end ?? defaultEndTimeIndex,
        },
      ]),
    ),
  );

  const handleDayChange = (day, values) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [day]: {
        ...prevFilters[day],
        start: values[0],
        end: values[1],
      },
    }));
  };

  const toggleDayActive = day => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [day]: {
        ...prevFilters[day],
        active: !prevFilters[day].active,
      },
    }));
  };

  const toggleAllDays = () => {
    const allActive = !Object.values(selectedFilters).some(
      filter => filter.active,
    );
    setSelectedFilters(prevFilters => {
      const newFilters = {};
      daysOfWeek.forEach(day => {
        newFilters[day] = {
          ...prevFilters[day],
          active: allActive,
        };
      });
      return newFilters;
    });
  };

  const applyFilters = () => {
    dispatch(setFilters(selectedFilters));
    Alert.alert(t('filtersApplied'), t('filtersAppliedMessage'), [
      {text: 'OK'},
    ]);
  };

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme === 'dark' ? '#222B45' : '#FFFFFF',
      },
      headerTintColor: theme === 'dark' ? '#FFFFFF' : '#222B45',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, theme]);

  useEffect(() => {
    scrollY.addListener(({value}) => {
      setShowScrollToTop(value > 100);
    });
    return () => scrollY.removeAllListeners();
  }, []);

  return (
    <Layout style={[styles.container, {backgroundColor}]}>
      <Text category="h1" style={[styles.header, {color: textColor}]}>
        {t('filtersTitle')}
      </Text>

      <View style={styles.rowContainer}>
        <Button onPress={applyFilters} style={styles.button}>
          {t('applyFilters')}
        </Button>
        <Toggle
          style={styles.toggle}
          checked={Object.values(selectedFilters).some(filter => filter.active)}
          onChange={toggleAllDays}
          textStyle={{color: 'orange'}}
          status={
            Object.values(selectedFilters).some(filter => filter.active)
              ? 'success'
              : 'danger'
          }>
          {Object.values(selectedFilters).some(filter => filter.active) ? (
            <Text style={{color: 'orange'}}>{t('deactivateAll')}</Text>
          ) : (
            <Text style={{color: 'orange'}}>{t('activateAll')}</Text>
          )}
        </Toggle>
      </View>

      <Card
        style={[
          styles.infoCard,
          {backgroundColor: theme === 'dark' ? '#333B50' : '#F7F9FC'},
        ]}>
        <Icon name="alert-circle-outline" fill="#FFAA00" style={styles.icon} />
        <Text category="s1" style={[styles.infoText, {color: textColor}]}>
          {t('infoApplyFilters')}
        </Text>
      </Card>

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        {daysOfWeek.map(day => (
          <Card
            key={day}
            style={[
              styles.card,
              {
                borderColor: selectedFilters[day]?.active
                  ? '#28a745'
                  : '#dc3545',
                backgroundColor: theme === 'dark' ? '#333B50' : '#F7F9FC',
              },
            ]}>
            <Text category="h2" style={[styles.dayHeader, {color: textColor}]}>
              {t(day)}
            </Text>
            <Layout
              style={[styles.switchContainer, {backgroundColor}]}
              level="2">
              <Text style={{color: textColor}}>{t('activeToWork')}</Text>
              <Toggle
                checked={selectedFilters[day]?.active || false}
                onChange={() => toggleDayActive(day)}
                status={selectedFilters[day]?.active ? 'success' : 'danger'}
              />
            </Layout>
            {selectedFilters[day]?.active && (
              <View style={styles.sliderContainer}>
                <View style={styles.timeContainer}>
                  <Text style={{color: textColor}}>
                    {t('start')}: {timeOptions[selectedFilters[day]?.start]}
                  </Text>
                  <Text style={{color: textColor}}>
                    {t('end')}: {timeOptions[selectedFilters[day]?.end]}
                  </Text>
                </View>
                <MultiSlider
                  values={[
                    selectedFilters[day]?.start,
                    selectedFilters[day]?.end,
                  ]}
                  min={0}
                  max={timeOptions.length - 1}
                  step={1}
                  onValuesChange={values => handleDayChange(day, values)}
                  selectedStyle={{backgroundColor: '#28a745'}}
                  unselectedStyle={{backgroundColor: '#E0E0E0'}}
                  markerStyle={{backgroundColor: '#28a745'}}
                />
              </View>
            )}
          </Card>
        ))}
      </Animated.ScrollView>

      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={() =>
            scrollViewRef.current.scrollTo({y: 0, animated: true})
          }>
          <Icon
            name="arrow-upward-outline"
            fill="#FFFFFF"
            style={styles.scrollToTopIcon}
          />
        </TouchableOpacity>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  header: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggle: {
    marginBottom: 0,
  },
  infoCard: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFAE5',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  card: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayHeader: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderContainer: {
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(51, 102, 255, 0.7)',
    borderRadius: 24,
    padding: 12,
  },
  scrollToTopIcon: {
    width: 24,
    height: 24,
  },
});

export default FilterScreen;
