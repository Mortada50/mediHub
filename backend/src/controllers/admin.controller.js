import { clerkClient, Clerk } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Doctor } from "../models/Doctor.model.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { ENV } from "../config/env.js";
import { errorHandler } from "../middleware/errorHandler.js";

export const getPendingRejectedUsers = async (req, res) => {
  try {
    const [doctors, pharmacies] = await Promise.all([
      Doctor.find({ status: { $in: ["pending", "rejected"] } }).sort({
        createdAt: -1,
        updatedAt: -1,
      }),
      Pharmacy.find({ status: { $in: ["pending", "rejected"] } }).sort({
        createdAt: -1,
        updatedAt: -1,
      }),
    ]);



    const users = [...doctors, ...pharmacies];

    sendSuccess(res, { users });

  } catch (error) {
    sendError(res, "حدث خطاء في استرجاع طلبات الانظمام", 500, error);
  }
};

export const updateDocPharmApprovelStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;

    const ALLOWED_STATUS = ["rejected", "active", "suspended"];
    const ALLOWED_ROLE   = ["doctor", "pharmacy"];
    if (!userId || !ALLOWED_STATUS.includes(status) || !ALLOWED_ROLE.includes(role)) {
      return sendError(res, "بيانات ناقصة أو غير صالحة", 400);
    }

    const Model = role === "doctor" ? Doctor : Pharmacy;
    const user = await Model.findById(userId);
    if (!user) return sendError(res, "المستخدم غير موجود", 404);

    // DB first, Clerk second — easier to compensate on failure.
    user.status = status;
    await user.save();

    await clerkClient.users.updateUserMetadata(user.clerkUserId, {
      publicMetadata: { status },
    });

    return sendSuccess(res, user, "تم تحديث حالة المستخدم", 200);
  } catch (error) {
    console.error(error);
    return sendError(res, "هناك خطأ", 500, error);
  }
};

export const removeRejectedUser = async (req, res) => {
try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || !["doctor", "pharmacy"].includes(role)) {
      return sendError(res, "خطأ في الحذف", 400);
    }

    const Model = role === "doctor" ? Doctor : Pharmacy;
    const user = await Model.findById(userId);
    if (!user) return sendError(res, "المستخدم غير موجود", 404);

    const { clerkUserId } = user;

    // Delete DB row first; orphan Clerk users are easier to reconcile than orphan DB rows.
    await Model.findOneAndDelete({ _id: userId });
    await clerkClient.users.deleteUser(clerkUserId);

    return sendSuccess(res, {}, "تم حذف المستخدم بنجاح", 200);
  } catch (error) {
    console.error(error);
    return sendError(res, "هناك خطأ", 500, error);
  }
}
