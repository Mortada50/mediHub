import { useQuery } from "@tanstack/react-query";
import { pharmacyService } from "../services/pharmacy.service";
import { Pharmacy } from "../components/PharmacyCard";

export const usePharmacies = () => {
  return useQuery<Pharmacy[], Error>({
    queryKey: ["activePharmacies"],
    queryFn: pharmacyService.fetchActivePharmacies,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    retry: 2,
  });
};
