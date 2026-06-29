import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL || "https://medihub-backend-m32h.onrender.com";

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
