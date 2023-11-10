import axios from 'axios';
import jwt_decode from 'jwt-decode';

const ENVIRONMENT = import.meta.env.VITE_ENV;
const BACKEND = import.meta.env.VITE_BACKEND;

let BASE_URL = '';

if (ENVIRONMENT === 'development') {
  BASE_URL = `${BACKEND}/api/v1` || 'http://localhost:3000/api/v1';
} else {
  BASE_URL = 'https://api-resturantes.azurewebsites.net/api/v1';
}

const REFRESH_TOKEN_URL = `${BASE_URL}/auth/refresh-token`;
const REFRESH_TOKEN_ADMIN_URL = `${BASE_URL}/admin/auth/refresh-token`;

export default axios.create({
  baseURL: BASE_URL,
});

// Crear una función que recibe el token como parámetro y devuelve una instancia de axios con el interceptor
export function axiosPrivate(authTokens, setAuthTokens, setUser, role = 'admin') {
  // Crear la instancia de axios con la base URL
  const instance = axios.create({
    baseURL: BASE_URL,
  });

  // Añadir el interceptor de request
  instance.interceptors.request.use(
    (config) => {
      // Si hay un token, añadirlo al header de autorización
      if (authTokens) {
        config.headers.Authorization = `Bearer ${authTokens.accessToken}`;
      }
      // Devolver la configuración modificada
      return config;
    },
    (error) => {
      // Si hay un error al configurar la petición, devolverlo
      return Promise.reject(error);
    },
  );

  // Añadir el interceptor de response
  instance.interceptors.response.use(
    (response) => {
      // Si la respuesta es exitosa, devolverla
      return response;
    },
    async (error) => {
      // refresh token

      if (error.response.status === 403 || error.response.status === 401 || error.response.status === 498) {
        return axios
          .get(role === 'customer' ? REFRESH_TOKEN_URL : REFRESH_TOKEN_ADMIN_URL, {
            headers: {
              Authorization: `Bearer ${authTokens.refreshToken}`,
            },
          })
          .then((response) => {
            const tokens = response.data.data;

            setAuthTokens(tokens);

            const userInfo = jwt_decode(tokens.accessToken);

            setUser(userInfo);

            localStorage.setItem('tokens', JSON.stringify(tokens));
            localStorage.setItem('user', JSON.stringify(userInfo));

            const config = error.config;

            config.headers.Authorization = `Bearer ${tokens.accessToken}`;

            return axios.request(config);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      } else {
        return Promise.reject(error);
      }
    },
  );

  // Devolver la instancia de axios
  return instance;
}
