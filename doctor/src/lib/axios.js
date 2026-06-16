import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 15000,
});

/**
 * نُمرر getToken من Clerk عبر setAuthToken
 * يُستدعى مرة واحدة في main.jsx أو App.jsx
 */
let _getToken = null;
export const setAuthToken = (getToken) => {
  _getToken = getToken;
};

// Request interceptor — يضيف Bearer token لكل طلب
api.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — يُعيد data مباشرة
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "حدث خطأ غير متوقع";
    return Promise.reject(new Error(message));
  },
);

export default api;
