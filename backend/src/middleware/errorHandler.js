import { ENV } from "../config/env.js";

// ───── 404 Handler ─────
export const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ───── Global Error Handler ─────
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "حدث خطأ في الخادم";

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const fieldNames = {
      email: "البريد الإلكتروني",
      clerkUserId: "المستخدم",
      pharmacyName: "اسم الصيدلية",
    };
    message = `${fieldNames[field] || field} مستخدم بالفعل`;
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "معرّف غير صالح";
  }

  // CORS Error
  if (err.message?.includes("CORS blocked")) {
    statusCode = 403;
    message = "الوصول محظور من هذا المصدر";
  }

  if (ENV.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
};
