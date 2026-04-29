import { useMedicinesApi } from "../services/api";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useMedicine = () => {
  const { addNewMedicine, getAllMedicines, updateMedicine, deleteMedicine} = useMedicinesApi();
  const queryClient = useQueryClient();

  const {
    data: medicinesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicines,
  });

  const addMedicineMutation = useMutation({
    mutationFn: (formData) => addNewMedicine(formData),
    onSuccess: () => queryClient.invalidateQueries(["medicines"]),
  });

  const updateMedicineMutation = useMutation({
    mutationFn: (formData) => updateMedicine(formData),
    onSuccess: () => queryClient.invalidateQueries(["medicines"]),
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: (medicineId) => deleteMedicine(medicineId),
    onSuccess: () => queryClient.invalidateQueries(["medicines"]),
  });

  return {
    medicinesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    addNewMedicineMutation: addMedicineMutation.mutate,
    isAddNewMedicineLoading: addMedicineMutation.isLoading,
    isAddNewMedicineError: addMedicineMutation.isError,
    addNewMedicineError: addMedicineMutation.error,

    updateMedicineMutation: updateMedicineMutation.mutate,
    isupdateMedicineLoading: updateMedicineMutation.isLoading,
    isupdateMedicineError: updateMedicineMutation.isError,
    updateMedicineError: updateMedicineMutation.error,

    deleteMedicineMutation: deleteMedicineMutation.mutate,
    isdeleteMedicineLoading: deleteMedicineMutation.isLoading,
    isdeleteMedicineError: deleteMedicineMutation.isError,
    deleteMedicineError: deleteMedicineMutation.error,
  };
};
