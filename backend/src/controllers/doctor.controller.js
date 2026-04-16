import { clerkClient } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Doctor } from "../models/Doctor.model.js";
export const updateProfile = async (req, res) => {
  try {
    const { userRole, mongoId, userStatus, clerkUser } = req;
    let profile;

    const {
      fullName,
      gender,
      speciality,
      qualifications,
      clinicName,
      city,
      area,
      street,
      phone,
    } = req.body;

    if (
      !fullName ||
      !gender ||
      !speciality ||
      !qualifications ||
      !clinicName ||
      !city ||
      !area ||
      !street ||
      !phone
    ) {
      return sendError(res, "يجب ملء جميع الحقول المطلوبة", 400);
    }
    profile = {
      fullName,
      gender,
      speciality,
      qualifications,
      clinicName,
      phone,
      address: { city, area, street },
    };

    let doctor = await Doctor.findById(mongoId);

    if (!doctor) return sendError(res, "هذا الطبيب غير موجود", 404);

    if (userStatus === "rejected") {
      
      profile.status = "pending";

      const { license } = req.body;

      if (!license) return sendError(res, "الترخيص الطبي مطلوب", 400);

      profile.license = license;

      await clerkClient.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { status: "pending" },
      });
    } else {
      console.log(userStatus);
    }

    Object.assign(doctor, profile);
    // Ensure nested subdoc is marked modified
    doctor.address = { ...doctor.address?.toObject?.(), ...profile.address };
    await doctor.save();

    sendSuccess(res, doctor, "تم تعديل بيانات الطبيب بنجاح");
  } catch (error) {
    console.error("updateProfile error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    sendError(res, "خطأ في تعديل بيانات الطبيب", 500);
  }
};
