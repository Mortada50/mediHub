import { sendError, sendSuccess } from "../utils/response.js";
import { Medicine } from "../models/Medicine.model.js";
import {deleteFromCloudinary} from "../config/cloudinary.js"
import mongoose from "mongoose";
import { Pharmacy } from "../models/Pharmacy.model.js";

export const getAllMedicines = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const medicines = await Medicine.aggregate([
      {
        $lookup: {
          from: "pharmacies",
          localField: "_id",
          foreignField: " medicines.medicine",
          as: "pharmacies",
        },
      },
      {
        $addFields: {
          pharmacyCount: { $size: "$pharmacies" },
        },
      },
      {
        $facet: {
          medicines: [{ $sort: { createdAt: -1 } }],
          totalMedicines: [{ $count: "count" }],
          newMedicinesThisMonth: [
            {
              $match: {
                createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
              },
            },
            { $count: "count" },
          ],
          numberOfMedicinesRequiringPrescription: [
            {
              $match: {
                requiresPrescription: { $in: [true] },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const totalMedicines = medicines[0].totalMedicines[0]?.count || 0;
    const newMedicinesThisMonth =
      medicines[0].newMedicinesThisMonth[0]?.count || 0;
    const numberOfMedicinesRequiringPrescription =
      medicines[0].numberOfMedicinesRequiringPrescription[0]?.count || 0;
    const medicinesRequiringPrescriptionPercentage =
      totalMedicines > 0
        ? Math.round(
            (numberOfMedicinesRequiringPrescription / totalMedicines) * 100,
          )
        : 0;
    const medicinesList = medicines[0].medicines;
    return sendSuccess(
      res,
      {
        totalMedicines,
        newMedicinesThisMonth,
        numberOfMedicinesRequiringPrescription,
        medicinesRequiringPrescriptionPercentage,
        medicinesList,
      },
      "تم جلب الأدوية بنجاح",
    );
  } catch (error) {
    console.log(error);
    return sendError(res, "حدث خطأ أثناء جلب الأدوية", 500, error.message);
  }
};

export const addNewMedicine = async (req, res) => {
  try {
    const imageUrls = req.files.map((file) => file.path);
    const {
      ageGroupType,
      arabicName,
      category,
      concentration,
      contraindications,
      countryOfManufacture,
      description,
      englishName,
      genericName,
      manufacturer,
      maxAge,
      minAge,
      registrationNumber,
      requiresPrescription,
      sideEffects,
      storageConditions,
      type,
      warnings,
    } = req.body;
    if (ageGroupType === "نطاق" && (!minAge || !maxAge)) {
      return sendError(
        res,
        "يجب تحديد العمر الأدنى والأقصى للفئة العمرية من نوع النطاق",
        400,
      );
    }
    if (ageGroupType === "حد أدنى" && !minAge) {
      return sendError(
        res,
        "يجب تحديد العمر الأدنى  للفئة العمرية من نوع ",
        400,
      );
    }
    if (
      !arabicName ||
      !category ||
      !type ||
      !concentration ||
      !countryOfManufacture ||
      !manufacturer ||
      !registrationNumber ||
      !imageUrls.length
    ) {
      return sendError(res, "الرجاء ملء جميع الحقول المطلوبة", 400);
    }
    const ageGroup = {
      type: ageGroupType,
      minAge: ageGroupType !== "جميع الأعمار" ? Number(minAge) : undefined,

      maxAge: ageGroupType === "نطاق" ? Number(maxAge) : undefined,
    };

    const newMedicine = new Medicine({
      arabicName,
      category,
      concentration,
      contraindications,
      countryOfManufacture,
      description,
      englishName,
      genericName,
      manufacturer,
      ageGroup,
      registrationNumber,
      requiresPrescription,
      sideEffects,
      storageConditions,
      type,
      warnings,
      images: imageUrls,
    });
    await newMedicine.save();

    return sendSuccess(res, "تم إضافة الدواء بنجاح", newMedicine);
  } catch (error) {
    const msg =
      error.code === 11000
        ? "يوجد دواء آخر بنفس رقم التسجيل"
        : "حدث خطأ أثناء إضافة الدواء";
    sendError(res, msg, 500, error.message);
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const imageUrls = req.files?.map((file) => file.path) || [];
  
    const {
      _id,
      ageGroupType,
      arabicName,
      category,
      concentration,
      contraindications,
      countryOfManufacture,
      description,
      englishName,
      genericName,
      manufacturer,
      maxAge,
      minAge,
      registrationNumber,
      requiresPrescription,
      sideEffects,
      storageConditions,
      type,
      warnings,
      imagesUrl
    } = req.body;
    if (ageGroupType === "نطاق" && (!minAge || !maxAge)) {
      return sendError(
        res,
        "يجب تحديد العمر الأدنى والأقصى للفئة العمرية من نوع النطاق",
        400,
      );
    }
    if (ageGroupType === "حد أدنى" && !minAge) {
      return sendError(
        res,
        "يجب تحديد العمر الأدنى  للفئة العمرية من نوع ",
        400,
      );
    }

    if(!_id) return sendError(res, "معرف دواء غير صالح", 400) 

      const oldImages = Array.isArray(imagesUrl)
        ? imagesUrl
        : imagesUrl
          ? imagesUrl.split(",")
          : [];

     const allImages = [...(oldImages ?? []), ...(imageUrls ?? [])];

    if (
      !arabicName ||
      !category ||
      !type ||
      !concentration ||
      !countryOfManufacture ||
      !manufacturer ||
      !registrationNumber ||
      !allImages.length
    ) {
      return sendError(res, "الرجاء ملء جميع الحقول المطلوبة", 400);
    }
    const ageGroup = {
      type: ageGroupType,
      minAge: ageGroupType !== "جميع الأعمار" ? Number(minAge) : undefined,

      maxAge: ageGroupType === "نطاق" ? Number(maxAge) : undefined,
    };
   
    let medicine = await Medicine.findById(_id);

    if(!medicine){
      return sendError(res, "هذا الدواء غير موجود", 404)
    }
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      _id,
      {
        arabicName,
        category,
        concentration,
        contraindications,
        countryOfManufacture,
        description,
        englishName,
        genericName,
        manufacturer,
        ageGroup,
        registrationNumber,
        requiresPrescription,
        sideEffects,
        storageConditions,
        type,
        warnings,
        images: allImages,
      },
      { new: true, runValidators: true },
    );

    return sendSuccess(res, "تم تعديل الدواء بنجاح", updatedMedicine);
  } catch (error) {
    const msg =
      error.code === 11000
        ? "يوجد دواء آخر بنفس رقم التسجيل"
        : "حدث خطأ أثناء تعديل الدواء";
    sendError(res, msg, 500, error.message);
    console.log(error);
    
  }
}

export const deleteMedicine = async (req, res) => {

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const {medicineId} = req.params;
    
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, "هذا الدواء غير موجود", 404);
    }

    const images = medicine.images;


    await Medicine.findByIdAndDelete(medicineId, {session});

    await Pharmacy.updateMany(
      {"medicines.medicine": medicineId},
      {
        $pull: {
          medicines: {medicine: medicineId}
        }
      },
      {session}
    );

    await session.commitTransaction();
    session.endSession();

     if (images.length > 0) {
       await deleteFromCloudinary(images);
     }

    sendSuccess(res, {}, "تم حذف الدواء بنجاح", 200);
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    sendError(res, "حدث خطاء غير متوقع اثناء حذف الدواء", 500, error.message);
    console.log(error);
  }
}
