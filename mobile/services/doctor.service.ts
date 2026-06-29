import api from "../lib/axios";
import { Doctor } from "../components/DoctorCard";

export const doctorService = {
  fetchActiveDoctors: async (): Promise<Doctor[]> => {
    try {
      const response: any = await api.get("/api/patient/data/doctors");
      // The backend returns an object { success, message, data: [...] } and axios interceptor returns res.data
      const data = response.data || [];
      return data.map((doc: any) => ({
        id: doc._id || doc.id,
        name: doc.fullName || "طبيب مجهول",
        specialty: doc.speciality || "",
        location: doc.address?.city 
          ? `${doc.address.city} - ${doc.address.street || ""}`
          : "موقع غير متوفر",
        image: doc.avatar ? { uri: doc.avatar } : require("../assets/images/doctor.png"),
        rating: doc.rating?.average || 0,
        appointmentFee: doc.appointmentFee || 0,
      }));
    } catch (error) {
      console.error("Error fetching active doctors:", error);
      throw error;
    }
  },
};
