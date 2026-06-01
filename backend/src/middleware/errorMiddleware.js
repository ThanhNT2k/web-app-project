function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message || 'Internal server error',
  });
}

module.exports = {
  asyncHandler,
  errorHandler,
};