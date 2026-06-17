import { clerkClient } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { deleteFromCloudinary } from "../config/cloudinary.js"
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

    if (req?.file?.path || avatarUrl === "null") {
      if (pharmacy?.avatar) {
        await deleteFromCloudinary(pharmacy?.avatar);
      }
    }

    await Pharmacy.findByIdAndUpdate(
      mongoId,
      {
        fullName,
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
      bio: bio || ""
    };

    if (lat && lng) {
      pharmacyUpdatedData.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    await Pharmacy.findByIdAndUpdate(mongoId, pharmacyUpdatedData, {
      runValidators: true,
    });

    sendSuccess(res, {}, "تم تحديث بيانات الصيدلية بنجاح", 200);
  } catch (error) {
    console.log(error);

    sendError(res, "خطأ في تعديل بيانات الصيدلية", 500);
  }
};
