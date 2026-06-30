import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ── Helper: use userId as key when authenticated, fall back to IP ──────────
const userOrIpKey = (req) => {
  const userId =
    req.auth?.userId ||
    req.user?._id?.toString() ||
    req.patientUser?._id?.toString();
  return userId ? `user_${userId}` : ipKeyGenerator(req);
};

// ───── General Limiter (keyed per user/IP) ─────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  keyGenerator: userOrIpKey,
  message: {
    success: false,
    message: "طلبات كثيرة جداً، يرجى المحاولة بعد قليل",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ───── Favorite Toggle Limiter (keyed per user/IP) ─────
// يسمح بـ 20 طلب كل 60 ثانية لكل مستخدم
export const favoriteLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 20,
  keyGenerator: userOrIpKey,
  message: {
    success: false,
    message: "طلبات كثيرة جداً على المفضلة، يرجى الانتظار قليلاً",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ───── Upload Limiter ─────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 5,
  keyGenerator: userOrIpKey,
  message: {
    success: false,
    message: "تجاوزت حد رفع الملفات، يرجى المحاولة لاحقاً",
  },
});
