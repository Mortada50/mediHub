import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Patient } from "../models/Patient.model.js";
import { ENV } from "../config/env.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { requirePatientAuth } from "../middleware/patientAuth.middleware.js";

const router = express.Router();
const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

const generateToken = (mongoId) => {
  return jwt.sign({ mongoId, role: "patient" }, ENV.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ─── Step 1: Start Google OAuth (server-side Authorization Code Flow) ───
// Mobile opens: GET /api/patient/auth/google/start
// Backend redirects browser to Google consent page
router.get("/google/start", (req, res) => {
  const redirectUri = `${ENV.BACKEND_URL}/api/patient/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: ENV.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ─── Step 2: Google redirects here with `code` ───
// Backend exchanges code → gets user info → creates/finds Patient → redirects to mobile://auth?token=JWT
router.get("/google/callback", async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error || !code) {
      return res.redirect(`mobile://auth?error=${error || "auth_failed"}`);
    }

    const redirectUri = `${ENV.BACKEND_URL}/api/patient/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: ENV.GOOGLE_CLIENT_ID,
        client_secret: ENV.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.id_token) {
      console.error("Token exchange failed:", tokens);
      return res.redirect(`mobile://auth?error=token_exchange_failed`);
    }

    // Verify id_token and get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create patient
    let patient = await Patient.findOne({ email });

    if (patient) {
      if (!patient.googleId) {
        patient.googleId = googleId;
        patient.authProvider = "google";
        if (picture && !patient.avatar) patient.avatar = picture;
        await patient.save();
      }
    } else {
      patient = await Patient.create({
        googleId,
        email,
        fullName: name,
        authProvider: "google",
        avatar: picture,
      });
    }

    const token = generateToken(patient._id);

    // Redirect back to mobile app with the JWT
    res.redirect(`mobile://auth?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`mobile://auth?error=server_error`);
  }
});

// ─── Get current patient profile ───
router.get("/me", requirePatientAuth, (req, res) => {
  sendSuccess(res, {
    role: req.userRole,
    status: req.patient.status,
    profile: req.patient,
  });
});

// ─── Legacy: POST /google (kept for backward compat but no longer used) ───
router.post("/google", async (req, res) => {
  return sendError(res, "يرجى استخدام تدفق تسجيل الدخول الجديد", 400);
});

export default router;
