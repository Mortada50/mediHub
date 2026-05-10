import { useProfileApi } from "../services/api.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"

export const useProfile = (state = false) => {
  const {
    getProfile,
    updateRegisterData,
    updateProfile,
    updateClinicData,
    updateAppointmentSetting,
  } = useProfileApi();

  const queryClient = useQueryClient();

  const {
    data: userProfile,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: state,
  });

  

  const registerUpdateMutation = useMutation({
    mutationFn: async (profile) => {
      const { data } = await updateRegisterData(profile);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (profile) => {
      const { data } = await updateProfile(profile);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

    }
  })
  
  const updateClinicMutation = useMutation({
    mutationFn: async (clinciData) => {
      const {data}  = await updateClinicData(clinciData);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

    }
  })

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appData) => {
      const { data } = await updateAppointmentSetting(appData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

    }
  })

  return {
    userProfile,
    isProfileLoading: isLoading,
    isProfileError: isError,
    profileError: error,
    isFetching,
    refetch,

    registerUpdateMutation: registerUpdateMutation.mutate,
    isUpdatingRegister: registerUpdateMutation.isLoading,
    registerUpdatedSuccess: registerUpdateMutation.isSuccess,
    registerUpdateError: registerUpdateMutation.error,

    updateProfileMutation: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isLoading,
    profileUpdatedSuccess: updateProfileMutation.isSuccess,
    profileUpdateError: updateProfileMutation.error,
    isProfileUpdateError: updateProfileMutation.isError,

    updateClinicMutation: updateClinicMutation.mutate,
    isUpdatingClinic: updateClinicMutation.isLoading,
    clinicUpdatedSuccess: updateClinicMutation.isSuccess,
    clinicUpdateError: updateClinicMutation.error,
    isClinicUpdateError: updateClinicMutation.isError,

    updateAppointmentMutation: updateAppointmentMutation.mutate,
    isUpdatingAppointment: updateAppointmentMutation.isLoading,
    appointmentUpdatedSuccess: updateAppointmentMutation.isSuccess,
    appointmentUpdateError: updateAppointmentMutation.error,
    isAppointmentUpdateError: updateAppointmentMutation.isError,
  };
}