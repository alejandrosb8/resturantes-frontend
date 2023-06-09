import axios from 'axios';

const BASE_URL = 'https://api-resturantes.azurewebsites.net/api/v1';

export default axios.create({
  baseURL: BASE_URL,
});

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

const privateAxiosRequest = axios.interceptors.request.use(
  async (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  async (error) => {
    if (error.response.status === 401) {
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const response = await axios.get('/admin/auth/refresh-token', {
            refreshToken: refreshToken,
          });
          const tokens = response.data;
          localStorage.setItem('tokens', tokens);
          return axios(originalRequest);
        } catch (error) {
          // Redirect to login page if refresh token has expired
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

const privateAxios = privateAxiosRequest.create({
  baseURL: BASE_URL,
});

export { privateAxios };
