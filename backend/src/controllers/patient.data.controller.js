import { Doctor } from "../models/Doctor.model.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { Article } from "../models/Articles.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @desc    Get all active doctors for patients
 * @route   GET /api/patient-data/doctors
 * @access  Public or Patient
 */
export const getActiveDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "active" })
      .select("fullName speciality avatar address clinicName rating yearOfExperience appointmentFee")
      .sort({ "rating.average": -1 }) // Sort by highest rating
      .limit(20);

    sendSuccess(res, doctors, "تم جلب الأطباء بنجاح");
  } catch (error) {
    sendError(res, error.message || "حدث خطأ أثناء جلب الأطباء");
  }
};

/**
 * @desc    Get all active pharmacies for patients
 * @route   GET /api/patient-data/pharmacies
 * @access  Public or Patient
 */
export const getActivePharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ status: "active" })
      .select("pharmacyName avatar address isOpen24Hours weeklySchedule rating")
      .sort({ "rating.average": -1 })
      .limit(20);

    sendSuccess(res, pharmacies, "تم جلب الصيدليات بنجاح");
  } catch (error) {
    sendError(res, error.message || "حدث خطأ أثناء جلب الصيدليات");
  }
};

/**
 * @desc    Get latest articles for patients home screen
 * @route   GET /api/patient/data/articles
 * @access  Public
 */
export const getLatestArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .select("title category authorName authorRole image createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    sendSuccess(res, articles, "تم جلب المقالات بنجاح");
  } catch (error) {
    sendError(res, error.message || "حدث خطأ أثناء جلب المقالات");
  }
};

