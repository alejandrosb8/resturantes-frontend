import axios from '../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const REGISTRATION_URL = '/auth/signup';
const LOGIN_URL = '/auth/login';
const VERIFY_URL = '/auth/verify';

function useAuth() {
  const { authTokens, setAuthTokens, setUser } = useContext(AuthContext);

  async function register(fullName, email, dni, phone, password) {
    return axios
      .post(REGISTRATION_URL, { fullName, email, dni, phone, password })
      .then((response) => {
        setAuthTokens(response.data);
        setUser(response.data.user);

        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  function login(email, password) {
    return axios
      .post(LOGIN_URL, { email, password })
      .then((response) => {
        setAuthTokens(response.data);
        setUser(response.data);

        localStorage.setItem('tokens', JSON.stringify(response.data.data));

        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  function verifyAccount(token) {
    return axios.get(`${VERIFY_URL}/${token}`).then((response) => {
      return response;
    });
  }

  function logout() {
    setAuthTokens(null);
  }

  return {
    authTokens,
    login,
    logout,
    register,
    verifyAccount,
  };
}

export default useAuth;
