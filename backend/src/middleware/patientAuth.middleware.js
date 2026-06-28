import jwt from "jsonwebtoken";
import { Patient } from "../models/Patient.model.js";
import { ENV } from "../config/env.js";
import { sendError } from "../utils/response.js";

export const requirePatientAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return sendError(res, "غير مصادق، يرجى تسجيل الدخول", 401);
    }
    
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const patient = await Patient.findById(decoded.mongoId);
    
    if (!patient) {
      return sendError(res, "المريض غير موجود", 404);
    }
    
    if (patient.status === "suspended") {
      return sendError(res, "تم تعليق حسابك، يرجى التواصل مع الدعم", 403);
    }
    
    req.patient = patient;
    req.mongoId = patient._id;
    req.userRole = "patient";
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً", 401);
    }
    return sendError(res, "غير مصادق، رمز غير صالح", 401);
  }
};
