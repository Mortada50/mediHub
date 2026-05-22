import { sendError, sendSuccess } from "../utils/response.js";
import { Doctor } from "../models/Doctor.model.js";
import { Leave } from "../models/Leave.model.js";

export const getWeeklySchedule = async (req, res) => {
  try {
    const { mongoId } = req;

    const today = new Date();
    const dayOfWeek = (today.getDay() + 1) % 7; // 0=سبت
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const doctor = await Doctor.findById(mongoId).select("weeklySchedule");
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const leaves = await Leave.find({
      doctorId: mongoId,
      status: { $ne: "cancelled" },
      $or: [
        // إجازة يوم واحد ضمن الأسبوع
        { leaveType: "single", date: { $gte: weekStart, $lte: weekEnd } },
        // إجازة نطاق تتقاطع مع الأسبوع
        {
          leaveType: "range",
          startDate: { $lte: weekEnd },
          endDate: { $gte: weekStart },
        },
      ],
    });

    const DAYS = [
      { name: "السبت", short: "سب", dayNumber: 0 },
      { name: "الأحد", short: "أح", dayNumber: 1 },
      { name: "الإثنين", short: "ثن", dayNumber: 2 },
      { name: "الثلاثاء", short: "ثل", dayNumber: 3 },
      { name: "الأربعاء", short: "أر", dayNumber: 4 },
      { name: "الخميس", short: "خم", dayNumber: 5 },
      { name: "الجمعة", short: "جم", dayNumber: 6 },
    ];

    const weekDays = DAYS.map((d) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + d.dayNumber);
      const dateStr = toDateStr(dayDate);

      const leaveData = isDateOnLeave(dateStr, leaves);
      const isToday = toDateStr(today) === dateStr;

      const scheduleDay = doctor.weeklySchedule.find(
        (s) => s.dayNumber === d.dayNumber,
      );

      return {
        ...d,
        date: dayDate.getDate(),
        isToday,
        isOnLeave: !!leaveData,
        isActive: scheduleDay?.isActive ?? false,
      };
    });

    return sendSuccess(
      res,
      { weeklySchedule: doctor.weeklySchedule, weekDays },
      "تم جلب الجدول بنجاح",
    );
  } catch (error) {
    console.error("getWeeklySchedule error:", error);

    return sendError(res, "خطأ في جلب الجدول الأسبوعي", 500);
  }
};

export const toggleDay = async (req, res) => {
  try {
    const { mongoId } = req;
    const { dayNumber } = req.params;
    const dayNum = Number(dayNumber);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return sendError(res, "رقم اليوم غير صالح (0-6)", 400);
    }

    const doctor = await Doctor.findById(mongoId);
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const dayIndex = doctor.weeklySchedule.findIndex(
      (d) => d.dayNumber === dayNum,
    );

    if (dayIndex === -1) {
      const { name } = req.body;
      if (!name) return sendError(res, "اسم اليوم مطلوب", 400);

      doctor.weeklySchedule = [
        ...doctor.weeklySchedule,
        { day: name, dayNumber: dayNum, sessions: [] },
      ];
    } else {
      doctor.weeklySchedule[dayIndex].isActive =
        !doctor.weeklySchedule[dayIndex].isActive;
    }

    await doctor.save();

    return sendSuccess(
      res,
      { weeklySchedule: doctor.weeklySchedule },
      "تم تحديث حالة اليوم",
    );
  } catch (error) {
    console.error("toggleDay error:", error);
    return sendError(res, "خطأ في تحديث حالة اليوم", 500);
  }
};

export const addSession = async (req, res) => {
  try {
    const { mongoId } = req;
    const { dayNumber } = req.params;
    const { type, startTime, endTime } = req.body;
    const dayNum = Number(dayNumber);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return sendError(res, "رقم اليوم غير صالح (0-6)", 400);
    }

    if (dayNum === 6) {
      return sendError(res, "يوم الجمعة عطلة ولا يمكن إضافة جلسات له", 400);
    }

    const validationError = validateSessionData({ type, startTime, endTime });
    if (validationError) return sendError(res, validationError, 400);

    const doctor = await Doctor.findById(mongoId);
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const dayIndex = doctor.weeklySchedule.findIndex(
      (d) => d.dayNumber === dayNum,
    );

    if (dayIndex === -1) {
      return sendError(res, "اليوم غير موجود في الجدول", 404);
    }

    const day = doctor.weeklySchedule[dayIndex];

    // التحقق من عدد الجلسات (حد أقصى 2)
    if (day.sessions.length >= 2) {
      return sendError(
        res,
        "لا يمكن إضافة أكثر من جلستين في اليوم الواحد",
        400,
      );
    }

    // التحقق من عدم تكرار نوع الجلسة
    const typeExists = day.sessions.some((s) => s.type === type);
    if (typeExists) {
      return sendError(
        res,
        `فترة ${type === "صباحا" ? "الصباحية" : "المسائية"} موجودة مسبقاً`,
        400,
      );
    }

    // overlap
    const overlapError = checkOverlap({ startTime, endTime }, day.sessions);
    if (overlapError) return sendError(res, overlapError, 400);

    day.sessions.push({ type, startTime, endTime, isActive: true });
    await doctor.save();

    const addedSession = day.sessions[day.sessions.length - 1];

    return sendSuccess(
      res,
      { session: addedSession },
      "تم إضافة الجلسة بنجاح",
      201,
    );
  } catch (error) {
    console.error("addSession error:", error);
    return sendError(res, "خطأ في إضافة الجلسة", 500);
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { mongoId } = req;
    const { dayNumber, sessionId } = req.params;
    const dayNum = Number(dayNumber);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return sendError(res, "رقم اليوم غير صالح", 400);
    }

    const doctor = await Doctor.findById(mongoId);
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const dayIndex = doctor.weeklySchedule.findIndex(
      (d) => d.dayNumber === dayNum,
    );
    if (dayIndex === -1)
      return sendError(res, "اليوم غير موجود في الجدول", 404);

    const day = doctor.weeklySchedule[dayIndex];
    const sessionExists = day.sessions.some(
      (s) => s._id.toString() === sessionId,
    );

    if (!sessionExists) return sendError(res, "الجلسة غير موجودة", 404);

    day.sessions = day.sessions.filter((s) => s._id.toString() !== sessionId);

    await doctor.save();

    return sendSuccess(res, {}, "تم حذف الجلسة بنجاح");
  } catch (error) {
    console.error("deleteSession error:", error);
    return sendError(res, "خطأ في حذف الجلسة", 500);
  }
};

export const clearDaySessions = async (req, res) => {
  try {
    const { mongoId } = req;
    const { dayNumber } = req.params;
    const dayNum = Number(dayNumber);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return sendError(res, "رقم اليوم غير صالح (0-6)", 400);
    }

    const doctor = await Doctor.findById(mongoId);
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const dayIndex = doctor.weeklySchedule.findIndex(
      (d) => d.dayNumber === dayNum,
    );

    if (dayIndex === -1) {
      return sendError(res, "اليوم غير موجود في الجدول", 404);
    }

    if (doctor.weeklySchedule[dayIndex].sessions.length === 0) {
      return sendError(res, "لا توجد جلسات لحذفها في هذا اليوم", 400);
    }

    doctor.weeklySchedule[dayIndex].sessions = [];
    await doctor.save();

    return sendSuccess(res, {}, "تم حذف جميع جلسات اليوم بنجاح");
  } catch (error) {
    console.error("clearDaySessions error:", error);
    return sendError(res, "خطأ في حذف جلسات اليوم", 500);
  }
};

export const toggleSession = async (req, res) => {
  try {
    const { mongoId } = req;
    const { dayNumber, sessionId } = req.params;
    const dayNum = Number(dayNumber);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return sendError(res, "رقم اليوم غير صالح", 400);
    }

    const doctor = await Doctor.findById(mongoId);
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const dayIndex = doctor.weeklySchedule.findIndex(
      (d) => d.dayNumber === dayNum,
    );
    if (dayIndex === -1)
      return sendError(res, "اليوم غير موجود في الجدول", 404);

    const day = doctor.weeklySchedule[dayIndex];
    const sessionIndex = day.sessions.findIndex(
      (s) => s._id.toString() === sessionId,
    );

    if (sessionIndex === -1) return sendError(res, "الجلسة غير موجودة", 404);

    day.sessions[sessionIndex].isActive = !day.sessions[sessionIndex].isActive;
    await doctor.save();

    return sendSuccess(
      res,
      { session: day.sessions[sessionIndex] },
      `تم ${day.sessions[sessionIndex].isActive ? "تفعيل" : "تعطيل"} الجلسة بنجاح`,
    );
  } catch (error) {
    console.error("toggleSession error:", error);
    return sendError(res, "خطأ في تحديث حالة الجلسة", 500);
  }
};

export const updateSession = async (req, res) => {
  try {
    const { mongoId } = req;
    const { dayNumber, sessionId } = req.params;
    const { startTime, endTime } = req.body;
    const dayNum = Number(dayNumber);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return sendError(res, "رقم اليوم غير صالح", 400);
    }

    if (!startTime || !endTime) {
      return sendError(res, "وقت البداية والنهاية مطلوبان", 400);
    }

    const doctor = await Doctor.findById(mongoId);
    if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

    const dayIndex = doctor.weeklySchedule.findIndex(
      (d) => d.dayNumber === dayNum,
    );
    if (dayIndex === -1)
      return sendError(res, "اليوم غير موجود في الجدول", 404);

    const day = doctor.weeklySchedule[dayIndex];
    const sessionIndex = day.sessions.findIndex(
      (s) => s._id.toString() === sessionId,
    );
    if (sessionIndex === -1) return sendError(res, "الجلسة غير موجودة", 404);

    const session = day.sessions[sessionIndex];

    // التحقق من صحة الأوقات مع نوع الجلسة الحالي
    const validationError = validateSessionData({
      type: session.type,
      startTime,
      endTime,
    });
    if (validationError) return sendError(res, validationError, 400);

    // التحقق من التداخل مع الجلسات الأخرى (باستثناء الجلسة الحالية)
    const otherSessions = day.sessions.filter(
      (s) => s._id.toString() !== sessionId,
    );
    const overlapError = checkOverlap({ startTime, endTime }, otherSessions);
    if (overlapError) return sendError(res, overlapError, 400);

    day.sessions[sessionIndex].startTime = startTime;
    day.sessions[sessionIndex].endTime = endTime;

    await doctor.save();

    return sendSuccess(
      res,
      { session: day.sessions[sessionIndex] },
      "تم تعديل الجلسة بنجاح",
    );
  } catch (error) {
    console.error("updateSession error:", error);
    return sendError(res, "خطأ في تعديل الجلسة", 500);
  }
};


// helper functions
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const SESSION_BOUNDS = {
  صباحا: { startMin: 0, startMax: 11 * 60 + 30, endMax: 15 * 60 },
  مساء: { startMin: 12 * 60, startMax: 23 * 60 + 30, endMax: 24 * 60 },
};

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

function validateSessionData({ type, startTime, endTime }) {
  if (!type || !["صباحا", "مساء"].includes(type)) {
    return "نوع الجلسة يجب أن يكون صباحاً أو مساءً";
  }

  if (!startTime || !endTime) {
    return "وقت البداية والنهاية مطلوبان";
  }

  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    return "صيغة الوقت غير صحيحة (HH:MM)";
  }

  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  if (endMins <= startMins) {
    return "وقت الانتهاء يجب أن يكون بعد وقت البداية";
  }

  const bounds = SESSION_BOUNDS[type];

  if (startMins < bounds.startMin || startMins > bounds.startMax) {
    return type === "صباحا"
      ? "بداية الفترة الصباحية يجب أن تكون بين 0:00 و 11:30"
      : "بداية الفترة المسائية يجب أن تكون بين 12:00 و 23:30";
  }

  if (endMins > bounds.endMax) {
    return type === "صباحا"
      ? "نهاية الفترة الصباحية لا يمكن أن تتجاوز 15:00"
      : "نهاية الفترة المسائية لا يمكن أن تتجاوز 24:00";
  }

  return null;
}

function checkOverlap(newSession, existingSessions) {
  const newStart = timeToMinutes(newSession.startTime);
  const newEnd = timeToMinutes(newSession.endTime);

  for (const s of existingSessions) {
    const sStart = timeToMinutes(s.startTime);
    const sEnd = timeToMinutes(s.endTime);
    if (newStart < sEnd && sStart < newEnd) {
      return `تتداخل مع الفترة ${s.type === "صباحا" ? "الصباحية" : "المسائية"} (${s.startTime} - ${s.endTime})`;
    }
  }
  return null;
}

function toDateStr(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
// ════════════════════════════════════════════════════════════════
// HELPER: يتحقق إذا كان تاريخ معين يقع ضمن إجازة
// ════════════════════════════════════════════════════════════════
function isDateOnLeave(dateStr, leaves) {
  for (const leave of leaves) {
    if (leave.status === "cancelled") continue;

    if (leave.leaveType === "single") {
      if (toDateStr(leave.date) === dateStr) return leave;
    } else if (leave.leaveType === "range") {
      const start = toDateStr(leave.startDate);
      const end = toDateStr(leave.endDate);
      if (dateStr >= start && dateStr <= end) return leave;
    }
  }
  return null;
}

