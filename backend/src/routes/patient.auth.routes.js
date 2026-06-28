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

// --- Google OAuth Proxy Callback ---
// This route helps bypass Google's restriction on custom schemes (like exp://)
// Google redirects here with the id_token in the URL hash fragment.
// This HTML page reads the hash and redirects back to the mobile app (passed in the state parameter).
router.get("/callback", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Redirecting...</title></head>
    <body>
      <script>
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const state = params.get("state");
        if (state) {
          window.location.href = decodeURIComponent(state) + "?" + hash;
        } else {
          document.body.innerHTML = "Authentication failed: No return URL provided.";
        }
      </script>
    </body>
    </html>
  `);
});

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return sendError(res, "رمز Google مطلوب", 400);
    }
    
    const ticket = await client.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    let patient = await Patient.findOne({ email });
    
    if (patient) {
      // Update googleId if not present but email matches
      if (!patient.googleId) {
        patient.googleId = googleId;
        patient.authProvider = "google";
        if (picture && !patient.avatar) {
          patient.avatar = picture;
        }
        await patient.save();
      }
    } else {
      // Create new patient
      patient = await Patient.create({
        googleId,
        email,
        fullName: name,
        authProvider: "google",
        avatar: picture,
      });
    }
    
    const token = generateToken(patient._id);
    
    sendSuccess(res, {
      token,
      profile: patient,
      role: "patient",
      status: patient.status,
    }, "تم تسجيل الدخول بنجاح");
    
  } catch (error) {
    console.error("Google auth error:", error);
    sendError(res, "فشل تسجيل الدخول بواسطة Google", 500);
  }
});

router.get("/me", requirePatientAuth, (req, res) => {
  sendSuccess(res, {
    role: req.userRole,
    status: req.patient.status,
    profile: req.patient,
  });
});

export default router;
