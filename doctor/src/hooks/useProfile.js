import { useProfileApi } from "../services/api.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"

export const useProfile = (state = false) => {
  const { getProfile, updateProfile } = useProfileApi()

  const queryClient = useQueryClient();

  const {data: userProfile, isLoading, isError} = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: state,
  });

  const profileUpdateMutation = useMutation({
    mutationFn: async (profile) => {
      const {data} = await updateProfile(profile);
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
    profileUpdateMutation: profileUpdateMutation.mutate,
    isUpdatingProfile: profileUpdateMutation.isPending,
    profileUpdatedSuccess: profileUpdateMutation.isSuccess
  };
}