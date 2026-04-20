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

    if (!doctors && !pharmacies) {
      return sendSuccess(res, {}, "لا توجد بيانات", 404);
    }

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

    if (!userId || !status || !role)
      return sendError(res, "بيانات ناقصة", 400);

    const Moadel = role === "doctor" ? Doctor : Pharmacy;

    let user = await Moadel.findById(userId);

    if (!user) {
      return sendSuccess(res, {}, "المستخدم غير موجود", 404);
    }

    const clerkUserId = user.clerkUserId;
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { status },
    });

    user.status = status;

    await user.save();

    sendSuccess(res, user, "تم تحديث حالة المستخدم", 200);
  } catch (error) {
    console.log(error);
    sendError(res, "هناك خطاء", error);
  }
};

export const removeRejectedUser = async (req, res) => {
try {
  const { userId } = req.params;
  const  {role}  = req.body;

  const secretKey = ENV.CLERK_SECRET_KEY; 

  if(!secretKey) {
    throw new Error("clerk secret key no found")
  }

  

  if(!userId || !role) return sendError(res, "خطاء في الحذف", 400);

  const Model = role === "doctor" ? Doctor : Pharmacy;

  const user = await Model.findById(userId);

  if(!user) return sendSuccess(res, {}, "المستخدم غير موجود", 404);

  const clerkUserId = user.clerkUserId;


  const clerk = new Clerk({secretKey});

  await clerk.users.deleteUser(clerkUserId);

  await Model.findOneAndDelete({_id: userId});

  sendSuccess(res, {}, "تم حذف المستخدم بنجاح", 200);

} catch (error) {
  console.log(error);
  sendError(res, "هناك خطاء", error);
}
}
