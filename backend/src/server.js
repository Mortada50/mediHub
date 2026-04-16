import express from "express";
import morgan from "morgan";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { corsMiddleware } from "./config/cors.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// ───── Routes ─────
import webhookRoutes from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

const app = express();
app.set("trust proxy", 1);

// ───── Connect Database ─────
connectDB();

// ───── Webhook Route ─────
app.use("/api/webhooks", webhookRoutes);

// ───── Body Parsers ─────
app.use(express.json({ limit: "10mb" }));

// ───── Security Middleware ─────
app.use(corsMiddleware);

// ───── Logger ─────
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ───── Rate Limiting ─────
app.use("/api", generalLimiter);

// ───── API Routes ─────
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/doctor", doctorRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Hello mediHub" });
});

// ───── Error Handlers ─────
app.use(notFound);
app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`Server start on port: ${ENV.PORT}`);
});
