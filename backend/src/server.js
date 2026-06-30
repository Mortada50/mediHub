import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { corsMiddleware } from "./config/cors.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { initSocket } from "./socket/socket.handler.js";

// ───── Routes ─────
import webhookRoutes from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.routes.js";
import patientAuthRoutes from "./routes/patient.auth.routes.js";
import patientDataRoutes from "./routes/patient.data.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import articlesRoutes from "./routes/articles.routes.js";
import locationRoutes from "./routes/location.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import leavesRoutes from "./routes/leaves.routes.js";
import chatRoutes    from "./routes/chat.routes.js";      
import favoriteRoutes from "./routes/favorite.routes.js";

const app = express();
const httpServer = createServer(app);                    
// ── Socket.IO ──
const io = new Server(httpServer, {
  cors: {
    origin: [
      ENV.DOCTOR_DASHBOARD_URL,
      ENV.PHARMACY_DASHBOARD_URL,
      ENV.ADMIN_DASHBOARD_URL,
      ENV.PATIENT_APP_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout:  60000,
  pingInterval: 25000,
});

initSocket(io);

app.set("io", io);
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
app.use("/api/patient/auth", patientAuthRoutes);
app.use("/api/patient/data", patientDataRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/leaves", leavesRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Hello mediHub" });
});

// ───── Error Handlers ─────
app.use(notFound);
app.use(errorHandler);


httpServer.listen(ENV.PORT, () => {
  console.log(`Server start on port: ${ENV.PORT}`);
});
