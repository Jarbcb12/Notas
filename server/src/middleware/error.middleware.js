function errorMiddleware(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Error interno del servidor"
  });
}

module.exports = errorMiddleware;
