import { clerkClient } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
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
