import axios, { axiosPrivate } from '../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import jwt_decode from 'jwt-decode';

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
const ADMIN_UPDATE_URL = `${ADMIN_AUTH}/change-username-password`;

function useAuth() {
  const { authTokens, setAuthTokens, setUser, user } = useContext(AuthContext);

  async function register(fullName, email, dni, phone, password, tableId) {
    return axios
      .post(REGISTRATION_URL, { fullName, email, dni, phone, password, tableId })
      .then((response) => {
        setAuthTokens(response.data);
        setUser(response.data.user);

        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async function login(email, password) {
    return axios
      .post(LOGIN_URL, { email, password })
      .then(async (response) => {
        setAuthTokens(response.data.data);

        const userInfo = await jwt_decode(response.data.data.accessToken);
        setUser(userInfo);

        localStorage.setItem('tokens', JSON.stringify(response.data.data));
        localStorage.setItem('user', JSON.stringify(userInfo));

        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async function verifyAccount(token) {
    return axios.get(`${VERIFY_URL}/${token}`).then((response) => {
      return response;
    });
  }

  function logout() {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  }

  async function recoverPassword(email, tableId) {
    return axios
      .post(RECOVER_PASSWORD_URL, { email, tableId })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async function changePassword(token, password) {
    return axios
      .patch(`${CHANGE_PASSWORD_URL}/${token}`, { password })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async function adminLogin(username, password) {
    return axios
      .post(ADMIN_LOGIN_URL, { username, password })
      .then(async (response) => {
        setAuthTokens(response.data.data);

        const userInfo = await jwt_decode(response.data.data.accessToken);

        setUser(userInfo);

        localStorage.setItem('tokens', JSON.stringify(response.data.data));
        localStorage.setItem('user', JSON.stringify(userInfo));

        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async function adminUpdate(username, password) {
    return axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(ADMIN_UPDATE_URL, { username, password })
      .then((response) => {
        return response;
      });
  }

  return {
    authTokens,
    user,
    login,
    logout,
    register,
    verifyAccount,
    recoverPassword,
    changePassword,
    adminLogin,
    adminUpdate,
    setAuthTokens,
    setUser,
  };
}

export default useAuth;
