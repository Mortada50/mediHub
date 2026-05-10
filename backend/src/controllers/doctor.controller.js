import { clerkClient } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Doctor } from "../models/Doctor.model.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

export const updateRegisterData = async (req, res) => {
  try {
    const { userRole, mongoId, userStatus, clerkUser } = req;
    let profile;

    let doctor = await Doctor.findById(mongoId);

    if (!doctor) return sendError(res, "هذا الطبيب غير موجود", 404);

    if (userStatus === "rejected") {
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

      profile.status = "pending";

      const { license } = req.body;

      if (!license) return sendError(res, "الترخيص الطبي مطلوب", 400);

      profile.license = license;

      await clerkClient.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { status: "pending" },
      });
    } else {
      return sendError(res, "لا يمكنك تعديل البيانات", 403);
    }

    Object.assign(doctor, profile);
    // Ensure nested subdoc is marked modified
    doctor.address = { ...doctor.address?.toObject?.(), ...profile.address };
    await doctor.save();

    sendSuccess(res, doctor, "تم تعديل بيانات الطبيب بنجاح");
  } catch (error) {
    console.error("updateregister error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    sendError(res, "خطأ في تعديل بيانات الطبيب", 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { mongoId, userStatus } = req;
    const { fullName, qualifications, bio, experienceYears, avatarUrl } =
      req.body;

    if (!fullName) return sendError(res, "الاسم مطلوب", 400);

    let profile;

    let doctor = await Doctor.findById(mongoId);

    if (!doctor) return sendError(res, "هذا الطبيب غير موجود", 404);

    if (userStatus !== "active")
      return sendError(res, "لا يمكنك تعديل البيانات", 403);

    const avatar = req?.file?.path ? req?.file?.path : avatarUrl;

    if (req?.file?.path || avatarUrl === "null") {
      if (doctor?.avatar) {
        await deleteFromCloudinary(doctor?.avatar);
      }
    }

    await Doctor.findByIdAndUpdate(
      mongoId,
      {
        fullName,
        qualifications,
        bio,
        yearOfExperience: experienceYears,
        avatar: avatar !== "null" ? avatar : null,
      },
      { runValidators: true, new: true },
    );

    return sendSuccess(res, {}, "تم تحديث بياناتك", 200);
  } catch (error) {
    console.error("updateregister error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    sendError(res, "خطأ في تعديل بيانات الطبيب", 500);
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { mongoId } = req;
    const { clinicName, phone, city, area, street, lat, lng } = req.body;

    if (!mongoId || !clinicName || !phone || !city || !area || !street)
      return sendError(res, "يجب ملئ جميع الحقول المطلوبة", 400);

    const doctor = await Doctor.findById(mongoId);

    if (!doctor) return sendError(res, "لم يتم العثور على هذا الطبيب", 404);

    const clinicUpdatedData = {
      clinicName,
      phone,
      address: { city, area, street },
    };

    if (lat && lng) {
      clinicUpdatedData.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    await Doctor.findByIdAndUpdate(mongoId, clinicUpdatedData, {
      runValidators: true,
    });

    sendSuccess(res, {}, "تم تحديث بيانات العيادة بنجاح", 200);
  } catch (error) {
    console.log(error);

    sendError(res, "خطأ في تعديل بيانات العيادة", 500);
  }
};

export const updateAppointmentSetting = async (req, res) => {
  try {
    const { mongoId } = req;
    const { sessionDuration, price } = req.body;

    if (!sessionDuration || !price)
      return sedErrror(res, "يرجى إدخال جميع الحقول المطلوبة", 400);

    const doctor = await Doctor.findById(mongoId);

    if (!doctor) return sendError(res, "هذا الطبيب غير موجود", 404);

    doctor.appointmentDuration = Number(sessionDuration);
    doctor.appointmentFee = Number(price);

    await doctor.save()

    sendSuccess(res, {}, "تم تحديث إعدادات المواعيد بنجاح", 200)

  } catch (error) {
    console.log(error);
    sendError(res, "خطأ في تحديث إعدادات المواعيد", 500);
  }
};
