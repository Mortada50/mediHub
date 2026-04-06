export const sendSuccess = (
  res,
  data = {},
  message = "تمت العملية بنجاح",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  message = "حدث خطأ ما في الخادم",
  statusCode = 500,
  errors = null,
) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

export const sendPaginated = (res, data, total, page, limit) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 1, 1);
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
       page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit),
    },
  });
};
