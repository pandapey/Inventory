import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';
import { signToken } from '../utils/tokens.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new ApiError(400, 'Email already registered');
  // SECURITY: public registration can never escalate privileges.
  // First user becomes super_admin (bootstrap); everyone else is employee.
  // Managers must be promoted by an existing super_admin via user management.
  const count = await User.countDocuments();
  const user = await User.create({ name, email: normalizedEmail, password, role: count === 0 ? 'super_admin' : 'employee' });
  const token = signToken(user);
  res.status(201).json({ success: true, token, user: { id: user._id, name, email: normalizedEmail, role: user.role } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account disabled');
  const token = signToken(user);
  res.json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
});

export const me = asyncHandler(async (req, res) => { res.json({ success: true, user: req.user }); });
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, data: users });
});
