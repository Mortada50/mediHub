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

// upload pharmacy license
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

  const updateRegisterData = async (profile) => {
    const { data } = await api.put("/doctor/update-register/data", profile);
    return data;
  };

  const updateProfile = async (profile) => {
    const formData = new FormData();

    for (const key in profile) {
      formData.append(key, profile[key]);
    }

    const { data } = await api.put("/doctor/update-profile", formData);

    return data;
  };

  const updateClinicData = async (clinicData) => {
    const { data } = await api.put("/doctor/update-clinic/data", clinicData);

    return data;
  };

  const updateAppointmentSetting = async (appData) => {
    const { data } = await api.put("/doctor/update-appointment/data", appData);

    return data;
  };

  return {
    getProfile,
    updateRegisterData,
    updateProfile,
    updateClinicData,
    updateAppointmentSetting,
  };
};

export const useArticleApi = () => {
  const api = useApi();
  const getArticles = async () => {
    const { data } = await api.get("/articles/doctor");
    return data;
  };

  const addNewArticle = async (articleData) => {
    const formData = new FormData();

    for (const key in articleData) {
      formData.append(key, articleData[key]);
    }

    const { data } = await api.post("/articles/add", formData);

    return data.data;
  };

  const updateArticle = async (articleData) => {
    const formData = new FormData();

    for (const key in articleData) {
      formData.append(key, articleData[key]);
    }

    const { data } = await api.put("/articles/update", formData);

    return data.data;
  };

  const deleteArticle = async (articleId) => {
    const { data } = await api.delete(`/articles/delete/${articleId}`);

    return data.data;
  };

  return {
    getArticles,
    addNewArticle,
    updateArticle,
    deleteArticle,
  };
};

export const useScheduleApi = () => {
  const api = useApi();

  const getSchedule = async () => {
    const { data } = await api.get("/schedule");

    return data.data;
  };

  const toggleDay = async (dayNumber, name) => {
    const { data } = await api.patch(`/schedule/day/${dayNumber}/toggle`, {
      name,
    });
    return data.data;
  };

  const addSession = async (dayNumber, type, startTime, endTime) => {
    const { data } = await api.post(`/schedule/day/${dayNumber}/session`, {
      type,
      startTime,
      endTime,
    });
    return data.data;
  };

  const deleteSession = async (dayNumber, sessionId) => {
    const { data } = await api.delete(
      `/schedule/day/${dayNumber}/session/${sessionId}`,
    );
    return data.data;
  };

  const clearDaySessions = async (dayNumber) => {
    const { data } = await api.delete(`/schedule/day/${dayNumber}/sessions`);

    return data.data;
  };

  const toggleSession = async (dayNumber, sessionId) => {
    const { data } = await api.patch(
      `/schedule/day/${dayNumber}/session/${sessionId}/toggle`,
    );

    return data.data;
  };

  const updateSession = async (dayNumber, sessionId, startTime, endTime) => {
    const { data } = await api.put(
      `/schedule/day/${dayNumber}/session/${sessionId}`,
      { startTime, endTime },
    );
    return data.data;
  };

  return {
    getSchedule,
    toggleDay,
    addSession,
    deleteSession,
    clearDaySessions,
    toggleSession,
    updateSession,
  };
};

export const useLeavesApi = () => {
  const api = useApi();

  const getLeaves = async () => {
    const { data } = await api.get("/leaves");
    return data.data;
  };

  const addLeave = async (leaveData) => {
    const { data } = await api.post("/leaves", leaveData);
    return data.data;
  }

  const deleteLeave = async (leaveId) => {
    const { data } = await api.delete(`/leaves/${leaveId}`);
    return data.data;
  };

  const cancelLeave = async (leaveId) => {
    const { data } = await api.patch(`/leaves/${leaveId}`);
    return data.data;
  }

  return {
    getLeaves,
    addLeave,
    deleteLeave,
    cancelLeave,
  };
}


  
