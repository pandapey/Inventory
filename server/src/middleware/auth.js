import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/helpers.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) throw new ApiError(401, 'Not authorized');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) throw new ApiError(401, 'User inactive');
    next();
  } catch {
    throw new ApiError(401, 'Token invalid');
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new ApiError(403, 'Forbidden: insufficient role');
  next();
};
