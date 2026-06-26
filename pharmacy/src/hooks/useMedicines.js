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
      queryClient.invalidateQueries(["profile"]);
      queryClient.invalidateQueries(["myMedicines"]);
    },
  });

  const {
    data: myMedicinesData,
    isLoading: isMyMedicinesLoading,
    isError: isMyMedicinesError,
    error: myMedicinesError,
    refetch: refetchMyMedicines,
    isFetching: isMyMedicinesFetching,
  } = useQuery({
    queryKey: ["myMedicines"],
    queryFn: medicineApi.getMyMedicines,
    staleTime: 1000 * 60 * 5,
  });

  const {
    mutate: removeMedicineMutation,
    isLoading: isRemovingMedicine,
  } = useMutation({
    mutationFn: medicineApi.removeMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries(["myMedicines"]);
    },
  });

  const {
    mutate: updateMedicinePriceMutation,
    isLoading: isUpdatingPrice,
  } = useMutation({
    mutationFn: medicineApi.updateMedicinePrice,
    onSuccess: () => {
      queryClient.invalidateQueries(["myMedicines"]);
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

    myMedicinesData,
    isMyMedicinesLoading,
    isMyMedicinesError,
    myMedicinesError,
    refetchMyMedicines,
    isMyMedicinesFetching,

    removeMedicineMutation,
    isRemovingMedicine,

    updateMedicinePriceMutation,
    isUpdatingPrice,
  };
};
