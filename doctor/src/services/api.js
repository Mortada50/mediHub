import { publicApi } from "./axios.js";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";



const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error(
    "Missing VITE_API_BASE_URL. Please set it in your environment variables.",
  );
}

const apiClient = axios.create({
  baseURL: baseURL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "هناك خطأ ما",
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  },
);

const useApi = () => {
  const { getToken } = useAuth();

  const request = async (method, url, data = null, config = {}) => {
    const token = await getToken();
    if (!token) {
      return Promise.reject({
        message: "Unauthenticated request",
        status: 401,
        data: null,
      });
    }
    return apiClient({
      method,
      url,
      data,
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return {
    get: (url, config) => request("GET", url, null, config),
    post: (url, data, config) => request("POST", url, data, config),
    put: (url, data, config) => request("PUT", url, data, config),
    patch: (url, data, config) => request("PATCH", url, data, config),
    delete: (url, config) => request("DELETE", url, null, config),
  };
};

// upload doctor license
export async function uploadLicense(file) {
  const formData = new FormData();
  formData.append("license", file);

  const endpoint = "/upload/doctor-license";

  const res = await publicApi.post(endpoint, formData);
  return res.data.data.url;
}

export const useProfileApi = () => {
  const api = useApi();

  const getProfile = async () => {
    const { data } = await api.get("/auth/me");
    return data.data;
  };

  const updateProfile = async (profile) => {
    const { data } = await api.put("/doctor/update-profile", profile);
    return data;
  }

  return { getProfile, updateProfile };
};