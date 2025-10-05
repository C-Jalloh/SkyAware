export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
}