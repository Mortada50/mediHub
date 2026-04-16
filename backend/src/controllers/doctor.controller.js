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
      city,
      area,
      street,
      phone,
    };
    
    let doctor = await Doctor.findById(mongoId);
    
    if(!doctor) return sendError(res, "هذا الطبيب غير موجود", 404);
    // replace bettwen pending and rejected in if condiation
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
   await doctor.save();
   
    sendSuccess(res, doctor, "تم تعديل بيانات الطبيب بنجاح")
   
  } catch (error) {
    sendError(res, "خطاء في تعديل بيانات الطبيب" ,error);
  }
};
