import { useLeavesApi } from "../services/api.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useLeaves = () => {
  const { getLeaves, addLeave, deleteLeave, cancelLeave } = useLeavesApi();
  const queryClient = useQueryClient();

  const {
    data: leavesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => getLeaves(),
  });

  const addLeaveMutation = useMutation({
    mutationFn: (leaveData) => addLeave(leaveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });

  const deleteLeaveMutation = useMutation({
    mutationFn: (leaveId) => deleteLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });

  const cancelLeaveMutation = useMutation({
    mutationFn: (leaveId) => cancelLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });

  return {
    leavesData: leavesData?.leaves || [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    addLeaveMutation: addLeaveMutation.mutate,
    isAddingLeaveLoading: addLeaveMutation.isLoading,
    isAddingLeaveError: addLeaveMutation.isError,
    addLeaveError: addLeaveMutation.error,

    deleteLeaveMutation: deleteLeaveMutation.mutate,
    isDeletingLeaveLoading: deleteLeaveMutation.isLoading,
    isDeletingLeaveError: deleteLeaveMutation.isError,
    deleteLeaveError: deleteLeaveMutation.error,

    cancelLeaveMutation: cancelLeaveMutation.mutate,
    isCancellingLeaveLoading: cancelLeaveMutation.isLoading,
    isCancellingLeaveError: cancelLeaveMutation.isError,
    cancelLeaveError: cancelLeaveMutation.error,
  };
};
