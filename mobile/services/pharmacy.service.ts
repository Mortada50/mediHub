import api from "../lib/axios";
import { Pharmacy } from "../components/PharmacyCard";

// ── Helper: determine if a pharmacy is open right now ──────────────────────
const isPharmacyOpenNow = (pharm: any): boolean => {
  if (pharm.isOpen24Hours) return true;

  const now = new Date();
  // JS getDay(): 0=Sun, 1=Mon, ... 6=Sat — matches MongoDB dayNumber
  const todayNum = now.getDay();
  const todaySchedule = (pharm.weeklySchedule ?? []).find(
    (s: any) => s.dayNumber === todayNum
  );

  if (!todaySchedule || !todaySchedule.isOpen) return false;
  if (todaySchedule.is24Hours) return true;

  // Compare current time with open/close times (HH:mm format)
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const current = now.getHours() * 60 + now.getMinutes();
  return (
    current >= toMinutes(todaySchedule.openTime) &&
    current <= toMinutes(todaySchedule.closeTime)
  );
};

export const pharmacyService = {
  fetchActivePharmacies: async (): Promise<Pharmacy[]> => {
    try {
      const response: any = await api.get("/api/patient/data/pharmacies");
      const data = response.data || [];

      return data.map((pharm: any) => ({
        id: pharm._id || pharm.id,
        name: pharm.pharmacyName || "صيدلية",
        isOpen: isPharmacyOpenNow(pharm),
        location: pharm.address?.city
          ? `${pharm.address.city}${pharm.address.street ? ` - ${pharm.address.street}` : ""}`
          : "موقع غير متوفر",
        image: pharm.avatar
          ? { uri: pharm.avatar }
          : require("../assets/images/pharmacy.png"),
      }));
    } catch (error) {
      console.error("Error fetching active pharmacies:", error);
      throw error;
    }
  },
};
