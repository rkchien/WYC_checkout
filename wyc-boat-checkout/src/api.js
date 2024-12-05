import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: `http://localhost:3000/api`,
});

export default api;