import { useScheduleApi } from "../services/api.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSchedule = () => {
  const {
    getSchedule,
    toggleDay,
    addSession,
    deleteSession,
    clearDaySessions,
    toggleSession,
    updateSession,
  } = useScheduleApi();
  const queryClient = useQueryClient();

  const {
    data: weeklyScheduleData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["schedule"],
    queryFn: () => getSchedule(),
  });

  const toggleDayMutation = useMutation({
    mutationFn: ({ dayNumber, name }) => toggleDay(dayNumber, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });

  const addSessionMutation = useMutation({
    mutationFn: ({ dayNumber, type, startTime, endTime }) =>
      addSession(dayNumber, type, startTime, endTime),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: ({ dayNumber, id }) => deleteSession(dayNumber, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });

  const clearDaySessionsMution = useMutation({
    mutationFn: (dayNumber) => clearDaySessions(dayNumber),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });

  const toggleSessionMutation = useMutation({
    mutationFn: ({ dayNumber, id }) => toggleSession(dayNumber, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ dayNumber, id, startTime, endTime }) =>
      updateSession(dayNumber, id, startTime, endTime),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });

  return {
    weeklyScheduleData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    toggleDayMutation: toggleDayMutation.mutate,
    isTogglingDayLoading: toggleDayMutation.isLoading,
    isToggleDayError: toggleDayMutation.isError,
    toggleDayError: toggleDayMutation.error,

    addSessionMutation: addSessionMutation.mutate,
    isAddingSessionLoading: addSessionMutation.isLoading,
    isAddingSessionError: addSessionMutation.isError,
    addSessionError: addSessionMutation.error,

    deleteSessionMutation: deleteSessionMutation.mutate,
    isDeletingSessionLoading: deleteSessionMutation.isLoading,
    isDeletingSessionError: deleteSessionMutation.isError,
    deleteSessionError: deleteSessionMutation.error,

    clearDaySessionsMutation: clearDaySessionsMution.mutate,
    isClearingDaySessionsLoading: clearDaySessionsMution.isLoading,
    isClearingDaySessionsError: clearDaySessionsMution.isError,
    clearDaySessionsError: clearDaySessionsMution.error,

    toggleSessionMutation: toggleSessionMutation.mutate,
    isTogglingSessionLoading: toggleSessionMutation.isLoading,
    isTogglingSessionError: toggleSessionMutation.isError,
    toggleSessionError: toggleSessionMutation.error,

    updateSessionMutation: updateSessionMutation.mutate,
    isUpdatingSessionLoading: updateSessionMutation.isLoading,
    isUpdatingSessionError: updateSessionMutation.isError,
    updateSessionError: updateSessionMutation.error,
  };
};
