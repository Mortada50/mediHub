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

  const endpoint = "/upload/pharmacy-license";

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
    const { data } = await api.put("/pharmacy/update-profile", profile);
    return data;
  };

  const updateManagerProfile = async (profile) => {
    const formData = new FormData();

    for (const key in profile) {
      formData.append(key, profile[key]);
    }

    const { data } = await api.put(
      "/pharmacy/update-manager-profile",
      formData,
    );
    return data;
  };

  const updatePharmacyData = async (pharmacyData) => {
    const { data } = await api.put(
      "/pharmacy/update-pharmacy/data",
      pharmacyData,
    );

    return data;
  };

  return {
    getProfile,
    updateProfile,
    updateManagerProfile,
    updatePharmacyData,
  };
};

export const useMedicineApi = () => {
  const api = useApi();

  const getAllMedicines = async () => {
    const { data } = await api.get("/medicines");
    return data.data;
  };

  const addMedicineToPharmacy = async (medicineData) => {
    // medicineData = { medicineId, price }
    const { data } = await api.post("/pharmacy/add-medicine", medicineData);
    return data;
  };

  const getMyMedicines = async () => {
    const { data } = await api.get("/pharmacy/my-medicines");
    return data.data;
  };

  const removeMedicine = async (medicineId) => {
    const { data } = await api.delete(`/pharmacy/remove-medicine/${medicineId}`);
    return data;
  };

  const updateMedicinePrice = async (medicineData) => {
    const { medicineId, price } = medicineData;
    const { data } = await api.put(`/pharmacy/update-medicine-price/${medicineId}`, { price });
    return data;
  };

  return {
    getAllMedicines,
    addMedicineToPharmacy,
    getMyMedicines,
    removeMedicine,
    updateMedicinePrice,
  };
};

