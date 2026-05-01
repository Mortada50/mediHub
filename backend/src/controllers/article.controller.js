import { sendError, sendSuccess } from "../utils/response.js";
import { Admin } from "../models/Admin.model.js";
import { Doctor } from "../models/Doctor.model.js";
import { Article } from "../models/Articles.model.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

export const getAllArticles = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const Data = await Article.aggregate([
      {
        $facet: {
          totalArticles: [{ $count: "count" }],
          adminArticles: [
            { $match: { authorRole: "admin" } },
            { $count: "count" },
          ],
          doctorArticles: [
            { $match: { authorRole: "doctor" } },
            { $count: "count" },
          ],

          newArticlesThisMonth: [
            {
              $match: {
                createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
              },
            },
            { $count: "count" },
          ],
          articles: [{ $sort: { createdAt: -1 } }],
        },
      },
    ]);

    const totalArticles = Data[0].totalArticles[0]?.count || 0;
    const adminArticles = Data[0].adminArticles[0]?.count || 0;
    const doctorArticles = Data[0].doctorArticles[0]?.count || 0;
    const newArticlesThisMonth = Data[0].newArticlesThisMonth[0]?.count || 0;
    const articlesList = Data[0].articles;

    // Percentage calculations
    const adminArticlesPercentage =
      totalArticles > 0 ? Math.round((adminArticles / totalArticles) * 100) : 0;
    const doctorArticlesPercentage =
      totalArticles > 0
        ? Math.round((doctorArticles / totalArticles) * 100)
        : 0;

    sendSuccess(res, {
      totalArticles,
      adminArticles,
      doctorArticles,
      newArticlesThisMonth,
      adminArticlesPercentage,
      doctorArticlesPercentage,
      articlesList,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, "هناك خطأ", 500, error);
  }
};

export const addNewArticle = async (req, res) => {
  try {
    const { userRole, mongoId } = req;
    const { title, description, content, category, isFeatured } = req.body;

    if (!title || !description || !content || !category) {
      return sendError(res, "العنوان والوصف والتصنيف والمحتوى مطلوب", 400);
    }

    let authorName, authorSpecialty, authorAvatar;

    if (userRole === "doctor") {
      const doctor = await Doctor.findById(mongoId);
      if (!doctor) return sendError(res, "الطبيب غير موجود", 404);

      authorName = doctor.fullName;
      authorSpecialty = doctor.speciality;
      authorAvatar = doctor.avatar;
    } else if (userRole === "admin") {
      const admin = await Admin.findById(mongoId);
      if (!admin) return sendError(res, "المسؤل غير موجود", 404);

      authorName = admin.name;
      authorAvatar = admin.avatar;
    }

    const article = new Article({
      title,
      description,
      content,
      category,
      image: req?.file?.path || null,
      author: mongoId,
      authorRole: userRole,
      authorName,
      authorSpecialty,
      authorAvatar,
      isFeatured: isFeatured === "true",
    });

    await article.save();

    sendSuccess(res, {}, "تم إنشاء المقالة بنجاح", 200);
  } catch (error) {
    sendError(res, "حدث خطأ اثناء انشاء المقالة", 500, error?.message);
    console.log(error);
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { userRole, mongoId } = req;
    const {
      _id,
      title,
      description,
      content,
      category,
      isFeatured,
      imagePreview,
    } = req.body;

    if (!title || !description || !content || !category) {
      return sendError(res, "العنوان والوصف والتصنيف والمحتوى مطلوب", 400);
    }

    const article = await Article.findById(_id);

    if (!article) return sendError(res, "هذه المقالة غير موجودة", 404);

    console.log(req?.file?.path, "preview", imagePreview);

    let imageUrl = article?.image;
    if (req?.file?.path || imagePreview === "null") {
      if (article?.image) {
        await deleteFromCloudinary(article?.image);
        imageUrl = req?.file?.path || null;
      }
      imageUrl = req?.file?.path || null;
    }

    if (mongoId !== article.author.toString())
      return senError(res, "ليس لديك صلاحية لتعديل هذا المقال", 401);

    const updatedArticle = await Article.findByIdAndUpdate(
      _id,
      {
        title,
        description,
        content,
        category,
        image: imageUrl,
        isFeatured: isFeatured === "true",
      },
      { new: true },
    );

    sendSuccess(res, updatedArticle, "تم التحديث بنجاح", 200);
  } catch (error) {
    sendError(res, "حدث خطأ اثناء تعديل المقالة", 500, error?.message);
    console.log(error);
  }
};

export const toggleIsFeaturStatus = async (req, res) => {
  try {
    const { articleId } = req.params;
    if (!articleId) return sendError(res, "معرف المقالة مطلوب", 400);

    const article = await Article.findById(articleId);
    if (!article) {
      return sendError(res, "هذه المقالة غير موجودة", 404);
    }
    article.isFeatured = !article.isFeatured;
    await article.save();
    sendSuccess(res, {}, "تم تحديث المقاله بنجاح", 200);
  } catch (error) {
    console.log(error);
    sendError(res, "حدث خطا اثناء تحديث حاله المقاله", 500);
  }
};

export const deleteArticle = async (req, res) => {
  
  try {

    const { articleId } = req.params;

    const { role, mongoId } = req;

    if (!articleId) {
      return sendError(res, "معرف المقالة مطلوب ", 400);
    }

    const article = await Article.findById(articleId);

    const image = article?.image;

    if (!article) return sendError(res, "هذه المقالة غير موجودة", 404);

    if (role === "doctor" && mongoId !== article.author)
      return senError(res, "انت غير مخول لحذف هذه المقالة", 401);

    await Article.findByIdAndDelete(articleId);

    if (image) {
      await deleteFromCloudinary(image);
    }

    sendSuccess(res, {}, "تم حذف المقالة بنجاح", 200);
    
  } catch (error) {
    sendError(res, "حدث خطا اثناء حذف المقاله", 500);
    console.log(error);
  }
};
