import axios from '../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const REGISTRATION_URL = '/auth/signup';
const LOGIN_URL = '/auth/login';

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
        console.log(error); // eslint-disable-line

        return error;
      });
  }

  function login(email, password) {
    return axios.post(LOGIN_URL, { email, password }).then((response) => {
      setAuthTokens(response.data);
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
  };
}

export default useAuth;
