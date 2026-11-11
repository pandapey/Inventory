import { Router } from 'express';
import { register, login, me, listUsers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimit.js';

const r = Router();
r.post('/register', authLimiter, validate(registerSchema), register);
r.post('/login', authLimiter, validate(loginSchema), login);
r.get('/me', protect, me);
r.get('/users', protect, authorize('super_admin'), listUsers);
export default r;
