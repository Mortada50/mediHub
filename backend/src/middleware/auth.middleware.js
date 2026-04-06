import { ClerkExpressRequireAuth, clerkClient } from "@clerk/clerk-sdk-node";
import { STATUS } from "../utils/constants.js";
import { sendError } from "../utils/response.js";

// ───── Middleware 1: check authentication with Clerk ─────
export const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res) => {
    return sendError(res, "غير مصادق، يرجى تسجيل الدخول", 401);
  },
});

// ───── Middleware 2: load user data from Clerk and attach to req ─────
export const loadUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const clerkUser = await clerkClient.users.getUser(userId);

    req.clerkUser = clerkUser;
    req.userRole = clerkUser.publicMetadata?.role;
    req.userStatus = clerkUser.publicMetadata?.status;
    req.mongoId = clerkUser.publicMetadata?.mongoId;

    next();
  } catch (error) {
    return sendError(res, "تعذر تحميل بيانات المستخدم", 401);
  }
};

// ───── Middleware 3: verify user has required role(s) ─────
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return sendError(res, "لم يتم تحديد صلاحية المستخدم", 403);
    }

    if (!allowedRoles.includes(req.userRole)) {
      return sendError(
        res,
        `غير مصرح لك، هذه العملية متاحة فقط لـ: ${allowedRoles.join(" أو ")}`,
        403,
      );
    }

    next();
  };
};

// ───── Middleware 4: verify user account status (active, pending, rejected, suspended) ─────
export const requireActiveStatus = (req, res, next) => {
  const { userStatus, userRole } = req;

  if (userRole === "patient" || userRole === "admin") return next();

  if (userStatus === STATUS.PENDING) {
    return sendError(
      res,
      "حسابك قيد المراجعة من قِبل الإدارة، يرجى الانتظار",
      403,
    );
  }

  if (userStatus === STATUS.REJECTED) {
    return sendError(res, "تم رفض طلب تسجيلك، يرجى التواصل مع الدعم", 403);
  }

  if (userStatus === STATUS.SUSPENDED) {
    return sendError(res, "تم تعليق حسابك، يرجى التواصل مع الدعم", 403);
  }

  if (userStatus !== STATUS.ACTIVE) {
    return sendError(res, "حسابك غير مفعّل", 403);
  }

  next();
};

// ───── Middleware combined: Auth + Role + Status ─────
export const protect = (...roles) => [
  requireAuth,
  loadUser,
  requireRole(...roles),
  requireActiveStatus,
];
