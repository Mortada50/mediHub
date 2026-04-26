import { useUsersApi } from "../services/api.js";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";


export const useUsers = (role) => {
  const { getActiveSuspendedUsers } = useUsersApi();

  // const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["userData", role],
    queryFn: () => getActiveSuspendedUsers(role),
  });
  return { usersData, isLoading, isError, error, refetch, isFetching };
};
