export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = err.errors || undefined;

  // Mongoose duplicate key (sku, poNumber, soNumber, warehouse.code, email)
  if (err?.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }
  // Mongoose validation
  if (err?.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => e.message);
  }
  // Bad ObjectId
  if (err?.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path || 'id'}`;
  }
  // JWT
  if (err?.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired, please sign in again';
  }

  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ success: false, message, errors });
};

export const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
