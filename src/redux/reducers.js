import {
  SET_JUST_EAT_DATA,
  TOGGLE_BOT,
  SET_FILTERS,
  SET_USER,
  SET_SUBSCRIPTION_STATUS,
  TOGGLE_THEME,
  UPDATE_USER_EMAIL,
  UPDATE_USER_PASSWORD,
} from './actions';

const initialState = {
  botEnabled: false,
  justEatData: {},
  user: {
    subscriptionStatus: 'inactive',
    trialEnd: null,
    justEatEmail: null,
    justEatPassword: null,
    email: '',
    password: '',
  },
  filters: {
    Monday: {active: false, start: 0, end: 95},
    Tuesday: {active: false, start: 0, end: 95},
    Wednesday: {active: false, start: 0, end: 95},
    Thursday: {active: false, start: 0, end: 95},
    Friday: {active: false, start: 0, end: 95},
    Saturday: {active: false, start: 0, end: 95},
    Sunday: {active: false, start: 0, end: 95},
  },
  theme: 'dark',
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_BOT:
      return {...state, botEnabled: !state.botEnabled};
    case SET_FILTERS:
      return {...state, filters: action.payload};
    case SET_JUST_EAT_DATA:
      return {...state, justEatData: action.payload};
    case SET_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    case SET_SUBSCRIPTION_STATUS:
      return {
        ...state,
        user: {...state.user, subscriptionStatus: action.payload},
      };
    case TOGGLE_THEME:
      return {...state, theme: state.theme === 'light' ? 'dark' : 'light'};
    case UPDATE_USER_EMAIL:
      return {
        ...state,
        user: {
          ...state.user,
          email: action.payload,
        },
      };
    case UPDATE_USER_PASSWORD:
      return {
        ...state,
        user: {
          ...state.user,
          password: action.payload,
        },
      };
    default:
      return state;
  }
};

export default rootReducer;
