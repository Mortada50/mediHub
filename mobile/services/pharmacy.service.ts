import api from "../lib/axios";
import { Pharmacy } from "../components/PharmacyCard";

// ── Helper: determine if a pharmacy is open right now ──────────────────────
const isPharmacyOpenNow = (pharm: any): boolean => {
  if (pharm.isOpen24Hours) return true;

  const now = new Date();
  // JS getDay(): 0=Sun, 1=Mon, ... 6=Sat
  // Backend dayNumber: 0=Sat, 1=Sun, 2=Mon, ... 6=Fri
  const jsDay = now.getDay();
  const todayNum = (jsDay + 1) % 7;
  const schedules = pharm.weeklySchedule ?? [];
  const yesterdayNum = (todayNum + 6) % 7;
  const todaySchedule = schedules.find((s: any) => s.dayNumber === todayNum);
  const yesterdaySchedule = schedules.find((s: any) => s.dayNumber === yesterdayNum);


  // Compare current time with open/close times (HH:mm format)
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const current = now.getHours() * 60 + now.getMinutes();
  const matches = (schedule: any, fromPreviousDay = false) => {
    if (!schedule || !schedule.isOpen) return false;
    if (schedule.is24Hours) return true;

    const open = toMinutes(schedule.openTime);
    const close = toMinutes(schedule.closeTime);

    if (close < open) {
      return fromPreviousDay ? current <= close : current >= open;
    }

    return current >= open && current <= close;
  };

  return matches(todaySchedule) || matches(yesterdaySchedule, true);
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
