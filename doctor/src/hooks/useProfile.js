import { useProfileApi } from "../services/api.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"

export const useProfile = (state = false) => {
  const { getProfile, updateRegisterData, updateProfile } = useProfileApi();

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
  };
}