import { Doctor } from "../models/Doctor.model.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { Article } from "../models/Articles.model.js";
import { sendSuccess, sendError } from "../utils/response.js";
import mongoose from "mongoose";

/**
 * @desc    Get all active doctors for patients
 * @route   GET /api/patient-data/doctors
 * @access  Public or Patient
 */
export const getActiveDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "active" })
      .select("fullName speciality avatar address clinicName rating yearOfExperience appointmentFee")
      .sort({ createdAt: -1 }) // Sort by highest rating
      .limit(10);

    sendSuccess(res, doctors, "تم جلب الأطباء بنجاح");
  } catch (error) {
    console.error("getActiveDoctors failed:", error);
    sendError(res, "حدث خطأ أثناء جلب الأطباء", 500);
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
      .sort({ createdAt : -1 })
      .limit(10);

    sendSuccess(res, pharmacies, "تم جلب الصيدليات بنجاح");
  } catch (error) {
    console.error("getActivePharmacies failed:", error);
    sendError(res, "حدث خطأ أثناء جلب الصيدليات", 500);
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
     console.error("getLatestArticles failed:", error);
     sendError(res, "حدث خطأ أثناء جلب المقالات", 500);
  }
};

/**
 * @desc    Get pharmacies having a specific medicine
 * @route   GET /api/patient/data/medicine/:medicineId/pharmacies
 * @access  Public
 */
export const getPharmaciesWithMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { lat, lng } = req.query;

    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      return sendError(res, "معرف الدواء غير صحيح", 400);
    }

    const medId = new mongoose.Types.ObjectId(medicineId);
    let pipeline = [];

    // If coordinates are provided, use $geoNear to calculate distance
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        pipeline.push({
          $geoNear: {
            near: { type: "Point", coordinates: [parsedLng, parsedLat] },
            distanceField: "distanceMeters",
            spherical: true,
            query: {
              status: "active",
              "medicines.medicine": medId,
              "medicines.isAvailable": true
            }
          }
        });
      }
    }

    // If no geoNear was added (no lat/lng), add a standard match
    if (pipeline.length === 0) {
      pipeline.push({
        $match: {
          status: "active",
          "medicines.medicine": medId,
          "medicines.isAvailable": true
        }
      });
    }

    pipeline.push(
      {
        $unwind: "$medicines"
      },
      {
        $match: {
          "medicines.medicine": medId,
          "medicines.isAvailable": true
        }
      },
      {
        $project: {
          id: "$_id",
          name: "$pharmacyName",
          price: "$medicines.price",
          currency: { $literal: "ر.ي" },
          isOpen24Hours: 1,
          weeklySchedule: 1,
          address: 1,
          avatar: 1,
          location: 1,
          phone: 1,
          rating: 1,
          distanceKm: {
             $cond: {
                if: { $type: "$distanceMeters" },
                then: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] },
                else: null
             }
          }
        }
      }
    );

    const pharmacies = await Pharmacy.aggregate(pipeline);

    const dayOfWeek = new Date().getDay();
    const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" }); 
    
    const mappedPharmacies = pharmacies.map(pharmacy => {
      let isOpen = pharmacy.isOpen24Hours;
      let closingTime = undefined;

      if (!isOpen && pharmacy.weeklySchedule && pharmacy.weeklySchedule.length > 0) {
        let localDayNumber = (dayOfWeek + 1) % 7; 
        
        const todaySchedule = pharmacy.weeklySchedule.find(s => s.dayNumber === localDayNumber);
        if (todaySchedule && todaySchedule.isOpen) {
          if (todaySchedule.is24Hours) {
            isOpen = true;
          } else if (todaySchedule.openTime && todaySchedule.closeTime) {
            if (currentTimeStr >= todaySchedule.openTime && currentTimeStr < todaySchedule.closeTime) {
              isOpen = true;
              closingTime = todaySchedule.closeTime;
            }
          }
        }
      }

      return {
        id: pharmacy.id,
        name: pharmacy.name,
        price: pharmacy.price,
        currency: pharmacy.currency,
        isOpen: isOpen,
        closingTime: closingTime,
        address: pharmacy.address ? `${pharmacy.address.city || ''} - ${pharmacy.address.area || ''} - ${pharmacy.address.street || ''}`.replace(/ -  - /g, '').trim() : "العنوان غير متوفر",
        distanceKm: pharmacy.distanceKm || 0,
        image: pharmacy.avatar || undefined,
        location: pharmacy.location,
        phone: pharmacy.phone,
        rating: pharmacy.rating
      };
    });

    sendSuccess(res, mappedPharmacies, "تم جلب الصيدليات بنجاح");
  } catch (error) {
    console.error("getPharmaciesWithMedicine failed:", error);
    sendError(res, "حدث خطأ أثناء جلب الصيدليات", 500);
  }
};

