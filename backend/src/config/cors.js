import cors from "cors";
import { ENV } from "./env.js";

const allowedOrigins = [ 
 ENV.ADMIN_DASHBOARD_URL,
 ENV.DOCTOR_DASHBOARD_URL,
 ENV.PHARMACY_DASHBOARD_URL,
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // السماح للطلبات بدون origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
