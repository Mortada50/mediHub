import dotenv from "dotenv";

dotenv.config();
export const ENV = {
  PORT: process.env.PORT,
  DOCTOR_DASHBOARD_URL: process.env.DOCTOR_DASHBOARD_URL,
  PHARMACY_DASHBOARD_URL: process.env.PHARMACY_DASHBOARD_URL,
  ADMIN_DASHBOARD_URL: process.env.ADMIN_DASHBOARD_URL,
  PATIENT_APP_URL: process.env.PATIENT_APP_URL,
  DB_URI: process.env.DB_URI,
};
