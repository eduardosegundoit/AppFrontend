import axios from 'axios';

export const TOGGLE_BOT = 'TOGGLE_BOT';
export const SET_FILTERS = 'SET_FILTERS';
export const SET_JUST_EAT_DATA = 'SET_JUST_EAT_DATA';
export const SET_USER = 'SET_USER';
export const SET_SUBSCRIPTION_STATUS = 'SET_SUBSCRIPTION_STATUS';
export const TOGGLE_THEME = 'TOGGLE_THEME';
export const LOGOUT = 'LOGOUT';
export const UPDATE_USER_EMAIL = 'UPDATE_USER_EMAIL';
export const UPDATE_USER_PASSWORD = 'UPDATE_USER_PASSWORD';

export const toggleBot = () => ({
  type: TOGGLE_BOT,
});

export const logout = () => ({
  type: LOGOUT,
});

export const toggleTheme = () => ({
  type: TOGGLE_THEME,
});

export const setFilters = filters => ({
  type: SET_FILTERS,
  payload: filters,
});

export const setJustEatData = data => ({
  type: SET_JUST_EAT_DATA,
  payload: data,
});

export const setUser = user => ({
  type: SET_USER,
  payload: user,
});

export const updateUserEmail = email => ({
  type: UPDATE_USER_EMAIL,
  payload: email,
});

export const updateUserPassword = password => ({
  type: UPDATE_USER_PASSWORD,
  payload: password,
});

export const loginUser = (email, password) => {
  return async dispatch => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });
      if (response.status === 200) {
        const userData = {
          userId: response.data.userId,
          token: response.data.token,
          subscriptionStatus: response.data.subscriptionStatus,
          trialEnd: response.data.trialEnd,
          justEatEmail: response.data.justEatEmail,
          justEatPassword: response.data.justEatPassword,
        };
        dispatch(setUser(userData));
        dispatch(checkSubscriptionStatus());

        if (userData.justEatEmail && userData.justEatPassword) {
          dispatch(
            connectJustEat(
              userData.justEatEmail,
              userData.justEatPassword,
              userData.userId,
            ),
          );
        }
      }
    } catch (error) {
      console.error(
        'Error logging in:',
        error.response ? error.response.data : error.message,
      );
    }
  };
};

export const connectJustEat = (email, password, userId) => {
  return async dispatch => {
    try {
      const justEatResponse = await axios.post(
        'http://localhost:3000/justEat/connect',
        {
          justEatEmail: email,
          justEatPassword: password,
          userId: userId,
        },
      );

      if (justEatResponse.status === 200) {
        const justEatData = {
          id: justEatResponse.data.courierId,
          token: justEatResponse.data.userToken,
        };
        dispatch(setJustEatData(justEatData));
      } else {
        console.error('Falha na conexão com Just Eat:', justEatResponse.data);
      }
    } catch (error) {
      console.error(
        'Erro ao conectar com Just Eat:',
        error.response ? error.response.data : error.message,
      );
    }
  };
};

export const createCheckoutSession = plan => {
  return async (dispatch, getState) => {
    const {user} = getState();

    try {
      if (!user.userId) {
        throw new Error('User ID is not available');
      }

      const response = await axios.post(
        'http://localhost:3000/payment/create-checkout-session',
        {
          priceId: plan,
          userId: user.userId,
        },
      );

      if (response.status === 200 && response.data.url) {
        return response.data.url;
      } else {
        throw new Error(
          response.data.error || 'Failed to create checkout session',
        );
      }
    } catch (error) {
      console.error('Error creating checkout session:', error.message);
      throw error;
    }
  };
};

export const checkSubscriptionStatus = () => {
  return async (dispatch, getState) => {
    const {user} = getState();

    try {
      if (!user.Id) {
        throw new Error('User ID is not available');
      }

      const response = await axios.post(
        'http://localhost:3000/subscription/status',
        {
          userId: user.Id,
        },
      );

      if (response.status === 200) {
        dispatch({
          type: SET_SUBSCRIPTION_STATUS,
          payload: response.data.subscriptionStatus,
        });
      } else {
        console.error('Failed to check subscription status:', response.data);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error.message);
    }
  };
};

export const updateUserEmailAsync = email => async (dispatch, getState) => {
  const {user} = getState();

  if (!user.userId) {
    console.error('User ID is not available');
    return;
  }

  try {
    const response = await axios.put(
      'http://localhost:3000/auth/update-email',
      {userId: user.userId, newEmail: email},
    );
    if (response.status === 200) {
      dispatch({
        type: UPDATE_USER_EMAIL,
        payload: email,
      });
    }
  } catch (error) {
    console.error('Error updating email:', error.message);
  }
};

export const updateUserPasswordAsync =
  password => async (dispatch, getState) => {
    const {user} = getState();

    if (!user.userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:3000/auth/update-password',
        {userId: user.userId, newPassword: password},
      );
      if (response.status === 200) {
        dispatch(updateUserPassword(password));
      }
    } catch (error) {
      console.error('Error updating password:', error.message);
    }
  };
