import axios from 'axios';

const JustEatService = {
  fetchShifts: async (justEatEmail, justEatPassword) => {
    const response = await axios.get('https://api-courier-produk.skipthedishes.com', {
      auth: {
        username: justEatEmail,
        password: justEatPassword
      }
    });
    return response.data.shifts;
  }
};

export default JustEatService;
