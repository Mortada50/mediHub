import rateLimit from "express-rate-limit";

// ───── General Limiter ─────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: {
    success: false,
    message: "طلبات كثيرة جداً، يرجى المحاولة بعد قليل",
  },
  standardHeaders: true,
  legacyHeaders: false,
});



export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 5,
  message: {
    success: false,
    message: "تجاوزت حد رفع الملفات، يرجى المحاولة لاحقاً",
  },
});
