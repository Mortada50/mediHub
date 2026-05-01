
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
    delete: (url, data, config) => request("DELETE", url, data, config),
  };
};



export const useDoctorPharmacyApi = () => {
  const api = useApi();

  const getDoctorsPharmacies = async () => {
    const { data } = await api.get("/admin/pending-reject/status");
    return data.data;
  };
  
 

  const updateDocPharmApprovelStatus = async (userId, role, status) => {
    const { data } = await api.patch(`/admin/approve-reject/users/${userId}`, {role, status});
    return data;
  }

  const deleteRejectedUser = async (userId, role) => {
    console.log(userId);
    
    const { data } = await api.delete(`admin/remove-reject/users/${userId}`, {role});
    return data;
  }




  return {
    getDoctorsPharmacies,
    updateDocPharmApprovelStatus,
    deleteRejectedUser,
  };
};

export const useUsersApi = () => {
  const api = useApi();

  const getActiveSuspendedUsers = async (role) => {
    const { data } = await api.get("/admin/active-suspended/users", {
      params: { role },
    });
    return data.data;
  };

  return {
    getActiveSuspendedUsers,
  };
};

export const useMedicinesApi = () => {
  const api = useApi();

  const getAllMedicines = async () => {
    const {data} = await api.get("/medicines");
    return data.data;
  }

  const addNewMedicine = async (medicineFormData) => {
    
    const formData = new FormData();
    for (const key in medicineFormData) {
      if (key === "images") {
        medicineFormData[key].forEach((image) => {
          
          formData.append("images", image.file);
        });
      } else {
        formData.append(key, medicineFormData[key]);
      }
    }
    
    const { data } = await api.post("/medicines/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.data;
  }

  const updateMedicine = async (medicineFormData) => {

    const formData = new FormData();
    for (const key in medicineFormData) {
      if (key === "images") {
        medicineFormData[key].forEach((image) => {
          
          formData.append("images", image.file);
        });
      } else {
        formData.append(key, medicineFormData[key]);
      }
    }
    
    const { data } = await api.put("/medicines/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.data;
  }

  const deleteMedicine = async (medicineId) => {
    const { data } = await api.delete(`/medicines/delete/${medicineId}`);

    return data.data;
  }

  return { getAllMedicines, addNewMedicine, updateMedicine, deleteMedicine };
}

export const useArticlesApi = () => {
  const api = useApi();

  const getArticles = async () => {
    const {data} = await api.get("/articles");
    return data.data;
  }

  
  const addNewArticle = async (articleData) => {
    const formData = new FormData();

    for (const key in articleData) {
     formData.append(key, articleData[key]);
    }
    
    const { data } = await api.post("/articles/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.data;
  }

  const updateArticle = async (articleData) => {
    console.log(articleData);
    
    const formData = new FormData();

    for (const key in articleData) {
     formData.append(key, articleData[key]);
    }
    
    const { data } = await api.put("/articles/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.data;
  }

  const toggleIsFeaturedStatus=async(articleId)=>{
   const {data}=await api.patch(`/articles/update/${articleId}`)
   return data;
  }

   const deleteArticle = async (articleId) => {
     const { data } = await api.delete(`/articles/delete/${articleId}`);

     return data.data;
   };


  return {
    addNewArticle,
    getArticles,
    updateArticle,
    toggleIsFeaturedStatus,
    deleteArticle,
  };
}