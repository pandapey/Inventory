import jwt from 'jsonwebtoken';
export const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
export const logActivity = async (ActivityLog, { user, action, entity, entityId, meta }) => {
  try { await ActivityLog.create({ user: user?._id, action, entity, entityId: String(entityId || ''), meta }); } catch {}
};
