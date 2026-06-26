import { clerkClient } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// استخرج أول رسالة خطأ نظيفة من كائن ValidationError بدون مسار الحقل
const getValidationMessage = (error) => {
  if (error?.errors) {
    const firstKey = Object.keys(error.errors)[0];
    if (firstKey) return error.errors[firstKey].message;
  }
  return error.message;
};
export const updateProfile = async (req, res) => {
  try {
    const { userRole, mongoId, userStatus, clerkUser } = req;
    let profile;

    const { fullName, gender, pharmacyName, city, area, street, phone } =
      req.body;

    if (
      !fullName ||
      !gender ||
      !pharmacyName ||
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
      pharmacyName,
      phone,
      address: { city, area, street },
    };

    let pharmacy = await Pharmacy.findById(mongoId);

    if (!pharmacy) return sendError(res, "هذه الصيدلية غير موجودة", 404);

    if (userStatus === "rejected") {
      profile.status = "pending";

      const { license } = req.body;

      if (!license) return sendError(res, "الترخيص  مطلوب", 400);

      profile.license = license;

      await clerkClient.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { status: "pending" },
      });
    } else {
      console.log(userStatus);
    }

    Object.assign(pharmacy, profile);
    // Ensure nested subdoc is marked modified
    pharmacy.address = {
      ...pharmacy.address?.toObject?.(),
      ...profile.address,
    };
    await pharmacy.save();

    sendSuccess(res, pharmacy, "تم تعديل بيانات الصيدلية بنجاح");
  } catch (error) {
    console.error("updateProfile error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    sendError(res, "خطأ في تعديل بيانات الصيدلية", 500);
  }
};

export const updateManagerProfile = async (req, res) => {
  try {
    const { mongoId, userStatus } = req;
    const { fullName, avatarUrl } = req.body;

    if (!fullName) return sendError(res, "الاسم مطلوب", 400);

    let profile;

    let pharmacy = await Pharmacy.findById(mongoId);

    if (!pharmacy) return sendError(res, "هذه الصيدلية غير موجودة", 404);

    if (userStatus !== "active")
      return sendError(res, "لا يمكنك تعديل البيانات", 403);

    const avatar = req?.file?.path ? req?.file?.path : avatarUrl;

    const previousAvatar = pharmacy?.avatar;
    const updateData = { fullName };
    if (req?.file?.path) updateData.avatar = req.file.path;
    else if (avatarUrl === "null") updateData.avatar = null;
    else if (typeof avatarUrl === "string") updateData.avatar = avatarUrl;

    const updated = await Pharmacy.findByIdAndUpdate(mongoId, updateData, {
      runValidators: true,
      new: true,
    });

    if (updated && previousAvatar && updated.avatar !== previousAvatar) {
      await deleteFromCloudinary(previousAvatar);
    }

    return sendSuccess(res, {}, "تم تحديث بياناتك", 200);
  } catch (error) {
    console.error("updateregister error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    sendError(res, "خطأ في تعديل بيانات الصيدلية", 500);
  }
};

export const updatePharmacy = async (req, res) => {
  try {
    const { mongoId } = req;
    const { city, area, street, lat, lng, bio, pharmacyName, phone } = req.body;

    if (!mongoId || !pharmacyName || !phone || !city || !area || !street)
      return sendError(res, "يجب ملئ جميع الحقول المطلوبة", 400);

    const pharmacy = await Pharmacy.findById(mongoId);

    if (!pharmacy) return sendError(res, "لم يتم العثور على هذه الصيدلية", 404);

    const pharmacyUpdatedData = {
      pharmacyName,
      phone,
      address: { city, area, street },
    };
    if (bio !== undefined) pharmacyUpdatedData.bio = bio;

    if ((lat == null) !== (lng == null)) {
      return sendError(res, "يجب إرسال خط العرض والطول معًا", 400);
    }

    if (lat != null && lng != null) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);
      if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
        return sendError(res, "إحداثيات غير صالحة", 400);
      }
      pharmacyUpdatedData.location = {
        type: "Point",
        coordinates: [parsedLng, parsedLat],
      };
    }

    await Pharmacy.findByIdAndUpdate(mongoId, pharmacyUpdatedData, {
      runValidators: true,
    });

    sendSuccess(res, {}, "تم تحديث بيانات الصيدلية بنجاح", 200);
  } catch (error) {
    if (error?.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    sendError(res, "خطأ في تعديل بيانات الصيدلية", 500);
  }
};

export const addMedicineToPharmacy = async (req, res) => {
  try {
    const { mongoId } = req;
    const { medicineId, price } = req.body;

    if (!medicineId || price == null) {
      return sendError(res, "معرف الدواء والسعر مطلوبان", 400);
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return sendError(res, "السعر غير صالح", 400);
    }

    const pharmacy = await Pharmacy.findById(mongoId);

    if (!pharmacy) {
      return sendError(res, "لم يتم العثور على الصيدلية", 404);
    }

    // Check if the medicine is already added
    const alreadyExists = pharmacy.medicines.some(
      (m) => m.medicine.toString() === medicineId
    );

    if (alreadyExists) {
      return sendError(res, "هذا الدواء مضاف بالفعل في صيدليتك", 400);
    }

    pharmacy.medicines.push({
      medicine: medicineId,
      price: Number(price),
      isAvailable: true,
    });

    await pharmacy.save();

    sendSuccess(res, {}, "تمت إضافة الدواء إلى صيدليتك بنجاح", 200);
  } catch (error) {
    console.error("addMedicineToPharmacy error:", error);
    sendError(res, "حدث خطأ أثناء إضافة الدواء", 500);
  }
};

export const getMyMedicines = async (req, res) => {
  try {
    const { mongoId } = req;
    // Populate the medicine details inside the pharmacy's medicines array
    const pharmacy = await Pharmacy.findById(mongoId).populate("medicines.medicine");
    
    if (!pharmacy) return sendError(res, "لم يتم العثور على الصيدلية", 404);

    sendSuccess(res, pharmacy.medicines, "تم جلب الأدوية بنجاح", 200);
  } catch (error) {
    console.error("getMyMedicines error:", error);
    sendError(res, "حدث خطأ أثناء جلب الأدوية", 500);
  }
};

export const deleteMedicineFromPharmacy = async (req, res) => {
  try {
    const { mongoId } = req;
    const { medicineId } = req.params;

    const pharmacy = await Pharmacy.findOneAndUpdate(
      { _id: mongoId, "medicines.medicine": medicineId },
      { $pull: { medicines: { medicine: medicineId } } },
      { new: true }
    );

    if (!pharmacy) return sendError(res, "الدواء غير موجود في قائمتك", 404);

    sendSuccess(res, {}, "تم حذف الدواء بنجاح", 200);
  } catch (error) {
    console.error("deleteMedicineFromPharmacy error:", error);
    sendError(res, "حدث خطأ أثناء حذف الدواء", 500);
  }
};

export const updateMedicinePrice = async (req, res) => {
  try {
    const { mongoId } = req;
    const { medicineId } = req.params;
    const { price } = req.body;

    if (price == null) return sendError(res, "السعر مطلوب", 400);

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return sendError(res, "السعر غير صالح", 400);
    }

    const pharmacy = await Pharmacy.findOneAndUpdate(
      { _id: mongoId, "medicines.medicine": medicineId },
      { $set: { "medicines.$.price": parsedPrice } },
      { new: true }
    );

    if (!pharmacy) return sendError(res, "الدواء غير موجود في قائمتك", 404);

    sendSuccess(res, {}, "تم تحديث سعر الدواء بنجاح", 200);
  } catch (error) {
    console.error("updateMedicinePrice error:", error);
    sendError(res, "حدث خطأ أثناء تحديث سعر الدواء", 500);
  }
};

export const getMySchedule = async (req, res) => {
  try {
    const { mongoId } = req;
    const pharmacy = await Pharmacy.findById(mongoId).select("weeklySchedule isOpen24Hours");
    if (!pharmacy) return sendError(res, "لم يتم العثور على الصيدلية", 404);

    sendSuccess(res, {
      weeklySchedule: pharmacy.weeklySchedule,
      isOpen24Hours: pharmacy.isOpen24Hours,
    }, "تم جلب الجدول بنجاح", 200);
  } catch (error) {
    console.error("getMySchedule error:", error);
    sendError(res, "حدث خطأ أثناء جلب الجدول", 500);
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { mongoId } = req;
    const { weeklySchedule, isOpen24Hours } = req.body;

    const updateData = {};
    if (Array.isArray(weeklySchedule)) updateData.weeklySchedule = weeklySchedule;
    if (typeof isOpen24Hours === "boolean") updateData.isOpen24Hours = isOpen24Hours;

    const pharmacy = await Pharmacy.findById(mongoId);
    if (!pharmacy) return sendError(res, "لم يتم العثور على الصيدلية", 404);

    Object.assign(pharmacy, updateData);
    await pharmacy.save();

    sendSuccess(res, {}, "تم تحديث الجدول بنجاح", 200);
  } catch (error) {
    console.error("updateSchedule error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, getValidationMessage(error), 400);
    }
    sendError(res, "حدث خطأ أثناء تحديث الجدول", 500);
  }
};

export const addDayToSchedule = async (req, res) => {
  try {
    const { mongoId } = req;
    const { day, dayNumber, isOpen, is24Hours, openTime, closeTime } = req.body;

    if (!day || dayNumber == null) {
      return sendError(res, "اسم اليوم ورقمه مطلوبان", 400);
    }

    const pharmacy = await Pharmacy.findById(mongoId);
    if (!pharmacy) return sendError(res, "لم يتم العثور على الصيدلية", 404);

    const alreadyExists = pharmacy.weeklySchedule.some((d) => d.day === day);
    if (alreadyExists) {
      return sendError(res, "هذا اليوم مضاف بالفعل إلى الجدول", 400);
    }

    pharmacy.weeklySchedule.push({ day, dayNumber, isOpen, is24Hours, openTime, closeTime });
    await pharmacy.save();

    sendSuccess(res, {}, "تمت إضافة اليوم بنجاح", 200);
  } catch (error) {
    console.error("addDayToSchedule error:", error);
    if (error?.name === "ValidationError") {
      return sendError(res, getValidationMessage(error), 400);
    }
    sendError(res, "حدث خطأ أثناء إضافة اليوم", 500);
  }
};
