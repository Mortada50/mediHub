import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://172.17.1.97:3000";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('patientToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || "حدث خطأ غير متوقع";
    return Promise.reject(new Error(message));
  }
);

export default api;
