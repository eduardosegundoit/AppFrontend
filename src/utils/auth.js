import axios from 'axios';

export const obterTokenJWT = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Erro ao obter token JWT:', error.response ? error.response.data : error.message);
    throw error;
  }
};
