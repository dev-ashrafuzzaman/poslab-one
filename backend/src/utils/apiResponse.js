
export const successResponse = (
  res,
  {
    message = "Success",
    data = null,
    meta = null,
    statusCode = 200
  } = {}
) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res,
  {
    data = [],
    page = 1,
    limit = 10,
    total = 0,
    message = "Success"
  } = {}
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};


export const errorResponse = (
  res,
  {
    message = "Something went wrong",
    statusCode = 500,
    errors = null
  } = {}
) => {
  const response = {
    success: false,
    message
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};
