import api from '../lib/axios';

export const usePatientAuthApi = () => {
  const getGoogleAuthStartUrl = (returnUrl: string) => {
    const baseURL = api.defaults.baseURL || "https://medihub-backend-m32h.onrender.com";
    return `${baseURL}/api/patient/auth/google/start?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return {
    getGoogleAuthStartUrl,
  };
};
