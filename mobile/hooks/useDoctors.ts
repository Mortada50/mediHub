import { useQuery } from "@tanstack/react-query";
import { doctorService } from "../services/doctor.service";
import { Doctor } from "../components/DoctorCard";

export const useDoctors = () => {
  return useQuery<Doctor[], Error>({
    queryKey: ["activeDoctors"],
    queryFn: doctorService.fetchActiveDoctors,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    retry: 2,
  });
};
