import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useScheduleApi } from "../services/api.js";

export const useSchedule = () => {
  const queryClient = useQueryClient();
  const scheduleApi = useScheduleApi();

  // ── GET Schedule ──
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    error: scheduleError,
    refetch: refetchSchedule,
    isFetching: isScheduleFetching,
  } = useQuery({
    queryKey: ["schedule"],
    queryFn: scheduleApi.getMySchedule,
    staleTime: 1000 * 60 * 5,
  });

  // ── UPDATE Schedule (يوم واحد أو isOpen24Hours) ──
  const {
    mutate: updateScheduleMutation,
    isLoading: isUpdatingSchedule,
  } = useMutation({
    mutationFn: scheduleApi.updateSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(["schedule"]);
    },
  });

  // ── ADD Day ──
  const {
    mutate: addDayMutation,
    isLoading: isAddingDay,
  } = useMutation({
    mutationFn: scheduleApi.addDayToSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(["schedule"]);
    },
  });

  return {
    scheduleData,
    isScheduleLoading,
    isScheduleError,
    scheduleError,
    refetchSchedule,
    isScheduleFetching,

    updateScheduleMutation,
    isUpdatingSchedule,

    addDayMutation,
    isAddingDay,
  };
};
