import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/api',
  withCredentials: true, // for cookies/JWT if needed
});

export default api; 