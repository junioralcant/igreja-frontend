import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use(async config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// metodo auternativo para dar put ou post
api.postOrPut = (url, id, data, config = {}) => {
  const method = id ? "put" : "post";
  const apiUrl = id ? `${url}/${id}` : url;

  return api[method](apiUrl, data, config);
};

export default api;
