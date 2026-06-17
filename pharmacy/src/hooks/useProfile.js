import { useProfileApi } from "../services/api.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfile = (state = false) => {
  const {
    getProfile,
    updateProfile,
    updateManagerProfile,
    updatePharmacyData,
  } = useProfileApi();

  const queryClient = useQueryClient();

  const {
    data: userProfile,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: state,
  });

  const profileUpdateMutation = useMutation({
    mutationFn: async (profile) => {
      const { data } = await updateProfile(profile);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const managerProfileUpdateMutation = useMutation({
    mutationFn: async ( profile ) => {
      const { data } = await updateManagerProfile(profile);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

    const updatePharmacyMutation = useMutation({
      mutationFn: async (pharmacyData) => {
        const { data } = await updatePharmacyData(pharmacyData);

        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });

  return {
    userProfile,
    isProfileLoading: isLoading,
    isProfileError: isError,
    profileError: error,
    refetch,
    isFetching,

    profileUpdateMutation: profileUpdateMutation.mutate,
    isUpdatingProfile: profileUpdateMutation.isLoading,
    profileUpdatedSuccess: profileUpdateMutation.isSuccess,
    profileUpdateError: profileUpdateMutation.error,

    managerProfileUpdateMutation: managerProfileUpdateMutation.mutate,
    isUpdatingManagerProfile: managerProfileUpdateMutation.isLoading,
    isManagerProfileUpdatedError: managerProfileUpdateMutation.isError,
    managerProfileUpdateError: managerProfileUpdateMutation.error,

    pharmacyUpdateMutation: updatePharmacyMutation.mutate,
    isUpdatingPharmacy: updatePharmacyMutation.isLoading,
    isPharmacyUpdatedError: updatePharmacyMutation.isError,
    pharmacyUpdateError: updatePharmacyMutation.error,
  };
};
