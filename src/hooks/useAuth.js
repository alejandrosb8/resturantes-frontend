import axios from '../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const USER_AUTH = '/auth';
const ADMIN_AUTH = '/admin/auth';

// user auth

const REGISTRATION_URL = `${USER_AUTH}/signup`;
const LOGIN_URL = `${USER_AUTH}/login`;
const VERIFY_URL = `${USER_AUTH}/verify`;
const RECOVER_PASSWORD_URL = `${USER_AUTH}/recover-password`;
const CHANGE_PASSWORD_URL = `${USER_AUTH}/change-password`;

// admin auth

const ADMIN_LOGIN_URL = `${ADMIN_AUTH}/login`;

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

  function recoverPassword(email) {
    return axios
      .post(RECOVER_PASSWORD_URL, { email })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  function changePassword(token, password) {
    return axios
      .patch(`${CHANGE_PASSWORD_URL}/${token}`, { password })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  function adminLogin(username, password) {
    return axios
      .post(ADMIN_LOGIN_URL, { username, password })
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

  return {
    authTokens,
    login,
    logout,
    register,
    verifyAccount,
    recoverPassword,
    changePassword,
    adminLogin,
  };
}

export default useAuth;
