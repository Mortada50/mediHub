import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMedicineApi } from "../services/api.js";

export const useMedicines = () => {
  const queryClient = useQueryClient();
  const medicineApi = useMedicineApi();

  const {
    data: medicinesData,
    isLoading: isMedicinesLoading,
    isError: isMedicinesError,
    error: medicinesError,
    refetch: refetchMedicines,
    isFetching: isMedicinesFetching,
  } = useQuery({
    queryKey: ["medicines"],
    queryFn: medicineApi.getAllMedicines,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    mutate: addMedicineMutation,
    isLoading: isAddingMedicine,
    isError: isAddingError,
    error: addingError,
  } = useMutation({
    mutationFn: medicineApi.addMedicineToPharmacy,
    onSuccess: () => {
      // We can invalidate profile or pharmacy medicines if there is a query for that
      queryClient.invalidateQueries(["profile"]);
    },
  });

  return {
    medicinesData,
    isMedicinesLoading,
    isMedicinesError,
    medicinesError,
    refetchMedicines,
    isMedicinesFetching,

    addMedicineMutation,
    isAddingMedicine,
    isAddingError,
    addingError,
  };
};
