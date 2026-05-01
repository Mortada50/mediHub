import { useDoctorPharmacyApi } from "../services/api.js";
import {QueryClient, useMutation, useQuery, useQueryClient} from "@tanstack/react-query"



export const useDoctorPharmacy = () => {

  const {
    getDoctorsPharmacies,
    updateDocPharmApprovelStatus,
    deleteRejectedUser,
  } = useDoctorPharmacyApi();
  

  const queryClient = useQueryClient();

  const {
    data: DoctorsPharmaciesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["DoctorsPharmacies"],
    queryFn: getDoctorsPharmacies,
  });

  const updateDoctorPharmacyStatus = useMutation({
    mutationFn: ({_id, role, status}) => updateDocPharmApprovelStatus(_id, role, status),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ["userData"]  }),
      queryClient.invalidateQueries({ queryKey: ["DoctorsPharmacies"] })
      
   
    
    }
    
  });

  const deleteRejectedUserMutation = useMutation({
    mutationFn: ({ _id, role }) => deleteRejectedUser(_id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["DoctorsPharmacies"] })
    
  });


  return {
    DoctorsPharmaciesData,
    refetchDcotorsPharmaciesData: refetch,
    isReFetchingDcotorsPharmaciesData: isFetching,
    isDoctorsPharmaciesLoading: isLoading,
    isDoctorsPharmaciesError: isError,
    DoctorsPharmaciesError: error,

    changeApprovalStatusMutation: updateDoctorPharmacyStatus.mutate,
    isChangeApprovalStatusLoadning: updateDoctorPharmacyStatus.isLoading,
    isChangeApprovalStatusError: updateDoctorPharmacyStatus.isError,
    ChangeApprovalStatusError: updateDoctorPharmacyStatus.error,

    deleteRejectedUserMutation: deleteRejectedUserMutation.mutate,
    isDeleteRejectedUserLoading: deleteRejectedUserMutation.isLoading,
    isDeleteRejectedUserError: deleteRejectedUserMutation.isError,
    deleteRejectedUserError: deleteRejectedUserMutation.error,
  };
}