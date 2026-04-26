import { clerkClient, Clerk } from "@clerk/clerk-sdk-node";
import { sendError, sendSuccess } from "../utils/response.js";
import { Doctor } from "../models/Doctor.model.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { ENV } from "../config/env.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

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

    const { clerkUserId, license } = user;

    // Delete DB row first; orphan Clerk users are easier to reconcile than orphan DB rows.
    await Model.findOneAndDelete({ _id: userId });

    await clerkClient.users.deleteUser(clerkUserId);
    
    await deleteFromCloudinary(license);

    return sendSuccess(res, {}, "تم حذف المستخدم بنجاح", 200);
  } catch (error) {
    console.error(error);
    return sendError(res, "هناك خطأ", 500, error);
  }
}

export const getActiveSuspendedUsers = async (req, res) => {
  // todo: get doctor appointments & consultations count & rating
  try {
    const { role } = req.query;
    console.log(role);

    const Model = role === "doctor" ? Doctor : Pharmacy;
    const currentDate = new Date();
    const startofMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    
    const Data = await Model.aggregate([
      {
        $facet: {
          totalUsers: [
            { $match: { status: { $in: ["active", "suspended"] } } },
            { $count: "count" },
          ],
          activeUsers: [
            { $match: { status: "active" } },
            { $count: "count" },
          ],
          suspendedUsers: [
            { $match: { status: "suspended" } },
            { $count: "count" },
          ],

          newUsersThisMonth: [
            {
              $match: {
                status: { $in: ["active", "suspended"] },
                createdAt: { $gte: startofMonth, $lte: endOfMonth },
              },
            },
            { $count: "count" },
          ],
          users: [
            { $match: { status: { $in: ["suspended", "active"] } } },
            { $sort: { createdAt: -1 } },
          ],
        },
      },
    ]);

    const totalUser = Data[0].totalUsers[0]?.count || 0;
    const activeUser = Data[0].activeUsers[0]?.count || 0;
    const suspendedUser = Data[0].suspendedUsers[0]?.count || 0;
    const newUsersThisMonth = Data[0].newUsersThisMonth[0]?.count || 0;
    const userList = Data[0].users;

    // Percentage calculations
    const activePercentage =
      totalUser > 0 ? Math.round((activeUser / totalUser) * 100) : 0;
    const suspendedPercentage =
      totalUser > 0 ? Math.round((suspendedUser / totalUser) * 100) : 0;

    sendSuccess(res, {
      totalUser,
      activeUser,
      suspendedUser,
      newUsersThisMonth,
      activePercentage,
      suspendedPercentage,
      userList,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, "هناك خطأ", 500, error);
  }
}
