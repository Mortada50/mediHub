import api from "../lib/axios";

export type Medicine = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  dosage: string;
  requiresPrescription: boolean;
  image?: string;
};

export type MedicineDetails = Medicine & {
  genericName?: string;
  type?: string;
  concentration?: string;
  description?: string;
  sideEffects?: string;
  warnings?: string;
  contraindications?: string;
  storageConditions?: string;
  manufacturer?: string;
  countryOfManufacture?: string;
  registrationNumber?: string;
  ageGroup?: {
    type: string;
    minAge?: number;
    maxAge?: number;
  };
  images?: string[];
};

export const medicineService = {
  fetchMedicines: async (): Promise<Medicine[]> => {
    try {
      const response: any = await api.get("/api/medicines");
      const medicinesList = response.data?.medicinesList || [];

      return medicinesList.map((med: any) => ({
        id: med._id,
        nameAr: med.arabicName || "",
        nameEn: med.englishName || "",
        category: med.category || "أخرى",
        dosage: `${med.type || ""} ${med.concentration ? `- ${med.concentration}` : ""}`.trim(),
        requiresPrescription: med.requiresPrescription || false,
        image: med.images && med.images.length > 0 ? med.images[0] : undefined,
      }));
    } catch (error) {
      console.error("Error fetching medicines:", error);
      throw error;
    }
  },
  
  fetchMedicineById: async (id: string): Promise<MedicineDetails> => {
    try {
      const response: any = await api.get(`/api/medicines/${id}`);
      const med = response.data;
      
      if (!med) throw new Error("Medicine not found");
      
      return {
        id: med._id,
        nameAr: med.arabicName || "",
        nameEn: med.englishName || "",
        category: med.category || "أخرى",
        dosage: `${med.type || ""} ${med.concentration ? `- ${med.concentration}` : ""}`.trim(),
        requiresPrescription: med.requiresPrescription || false,
        image: med.images && med.images.length > 0 ? med.images[0] : undefined,
        images: med.images || [],
        type: med.type,
        concentration: med.concentration,
        genericName: med.genericName,
        description: med.description,
        sideEffects: med.sideEffects,
        warnings: med.warnings,
        contraindications: med.contraindications,
        storageConditions: med.storageConditions,
        manufacturer: med.manufacturer,
        countryOfManufacture: med.countryOfManufacture,
        registrationNumber: med.registrationNumber,
        ageGroup: med.ageGroup,
      };
    } catch (error) {
      console.error(`Error fetching medicine with id ${id}:`, error);
      throw error;
    }
  },
};
