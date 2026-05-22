import { sendError, sendSuccess } from "../utils/response.js";
import { Leave } from "../models/Leave.model.js";

export const getLeaves = async (req, res) => {
  try {
    const { mongoId } = req;

    const leaves = await Leave.find({ doctorId: mongoId }).sort({ createdAt: -1 });

    return sendSuccess(res, { leaves }, "تم جلب الإجازات بنجاح");
  
} catch (error) {
    console.error("getLeaves error:", error);
    return sendError(res, "خطأ في جلب الإجازات", 500);
  }
};

export const addLeave = async (req, res) => {
  try {
    const { mongoId } = req;
    const { leaveType, date, startDate, endDate, reason } = req.body;
    console.log(leaveType, date, startDate, endDate, reason);


    if (!leaveType || !["single", "range"].includes(leaveType)) {
      return sendError(res, "نوع الإجازة غير صالح (single أو range)", 400);
    }

    if (leaveType === "single" && !date) {
      return sendError(res, "تاريخ الإجازة مطلوب", 400);
    }

    if (leaveType === "range" && (!startDate || !endDate)) {
      return sendError(res, "تاريخ البداية والنهاية مطلوبان", 400);
    }

    if (leaveType === "range") {
      if (new Date(endDate) < new Date(startDate)) {
        return sendError(
          res,
          "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
          400,
        );
      }
    }

    const overlapError = await checkLeaveOverlap(mongoId, {
      leaveType,
      date,
      startDate,
      endDate,
    });
    if (overlapError) return sendError(res, overlapError, 400);

    const leave = new Leave({
      doctorId: mongoId,
      leaveType,
      date: leaveType === "single" ? new Date(date) : null,
      startDate: leaveType === "range" ? new Date(startDate) : null,
      endDate: leaveType === "range" ? new Date(endDate) : null,
      reason: reason || "",
    });

    await leave.save();

    return sendSuccess(res, { leave }, "تم إضافة الإجازة بنجاح", 201);
  } catch (error) {
    console.error("addLeave error:", error);
    if (error.name === "ValidationError") {
      return sendError(res, error.message, 400);
    }
    return sendError(res, "خطأ في إضافة الإجازة", 500);
  }
};

export const deleteLeave = async (req, res) => {
  try {
    const { mongoId } = req;
    const { leaveId } = req.params;
    console.log(leaveId);
    const leave = await Leave.findOne({ _id: leaveId, doctorId: mongoId });
    if (!leave) return sendError(res, "الإجازة غير موجودة", 404);

    if (!["cancelled", "ended"].includes(leave.status)) {
      return sendError(res, "يمكن حذف الإجازات الملغاة أو المنتهية فقط", 400);
    }

    await Leave.findByIdAndDelete(leaveId);

    return sendSuccess(res, {}, "تم حذف الإجازة بنجاح");
  } catch (error) {
    console.error("deleteLeave error:", error);
    return sendError(res, "خطأ في حذف الإجازة", 500);
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { mongoId } = req;
    const  { leaveId }  = req.params;

    const leave = await Leave.findOne({ _id: leaveId, doctorId: mongoId });
    if (!leave) return sendError(res, "الإجازة غير موجودة", 404);

    if (leave.status === "cancelled") {
      return sendError(res, "الإجازة ملغاة مسبقاً", 400);
    }

    if (leave.status === "ended") {
      return sendError(res, "لا يمكن إلغاء إجازة منتهية", 400);
    }

    leave.status = "cancelled";
    await leave.save({ validateBeforeSave: false });

    return sendSuccess(res, { leave }, "تم إلغاء الإجازة بنجاح");
  } catch (error) {
    console.error("cancelLeave error:", error);
    return sendError(res, "خطأ في إلغاء الإجازة", 500);
  }
};


// Helper function to check for overlapping leaves
async function checkLeaveOverlap(doctorId, newLeave, excludeId = null) {
  const { leaveType, date, startDate, endDate } = newLeave;

  const effectiveStart =
    leaveType === "single" ? new Date(date) : new Date(startDate);
  const effectiveEnd =
    leaveType === "single" ? new Date(date) : new Date(endDate);

  effectiveStart.setHours(0, 0, 0, 0);
  effectiveEnd.setHours(23, 59, 59, 999);

  const filter = {
    doctorId,
    status: { $nin: ["cancelled", "ended"] },
    $or: [
      {
        leaveType: "single",
        date: { $gte: effectiveStart, $lte: effectiveEnd },
      },
      {
        leaveType: "range",
        startDate: { $lte: effectiveEnd },
        endDate: { $gte: effectiveStart },
      },
    ],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const conflict = await Leave.findOne(filter);
  if (conflict) {
    return `تتداخل مع إجازة موجودة (${conflict.dateLabel})`;
  }

  return null;
}
