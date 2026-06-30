import { Favorite } from "../models/favoriteSchema.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Toggle Favorite (Add if not exists, remove if exists)
export const toggleFavorite = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const patientId = req.patient._id;

    const allowedTypes = ["Medicine", "Doctor", "Pharmacy", "Article"];

    if (!itemId || !itemType) {
      return sendError(res, "يجب تحديد العنصر ونوعه", 400);
    }

    if (!allowedTypes.includes(itemType)) {
      return sendError(res, "Invalid itemType", 400); 
    }

    const deleted = await Favorite.findOneAndDelete({
      user: patientId,
      item: itemId,
      itemType,
    });

    if (deleted) {
      return sendSuccess(res, { isFavorite: false }, "تم إزالة العنصر من المفضلة");
    }

    // إضافة المفضلة (upsert يمنع duplicate key عند الطلبات المتزامنة)
    await Favorite.findOneAndUpdate(
      { user: patientId, item: itemId, itemType },
      { user: patientId, item: itemId, itemType },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { isFavorite: true }, "تم إضافة العنصر إلى المفضلة");
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    return sendError(res, "حدث خطأ أثناء تحديث المفضلة", 500);
  }
};

// Get My Favorites
export const getMyFavorites = async (req, res) => {
  try {
    const patientId = req.patient._id;
    const { itemType } = req.query; // optional filter by type

    const query = { user: patientId };
    if (itemType) {
      query.itemType = itemType;
    }

    const favorites = await Favorite.find(query).select("item itemType -_id");
    return sendSuccess(res, favorites, "تم جلب المفضلة بنجاح");
  } catch (error) {
    console.error("Get Favorites Error:", error);
    return sendError(res, "حدث خطأ أثناء جلب المفضلة", 500, error.message);
  }
};
