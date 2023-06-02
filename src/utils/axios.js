import axios from 'axios';

const BASE_URL = 'https://api-resturantes.azurewebsites.net/api/v1';

export default axios.create({
  baseURL: BASE_URL,
});
