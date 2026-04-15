import { useProfileApi } from "../services/api.js";
import {useQuery} from "@tanstack/react-query"

export const useProfile = () => {
   const { getProfile } = useProfileApi()
    return useQuery({
      queryKey: ["profile"],
      queryFn: getProfile,
    });
}