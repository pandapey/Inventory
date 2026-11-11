import { Router } from 'express';
import { createSO, listSO, updateSOStatus, invoicePDF } from '../controllers/opsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { soSchemaJoi } from '../utils/validators.js';

const r = Router();
r.use(protect);
r.post('/', authorize('super_admin','sales_manager','employee'), validate(soSchemaJoi), createSO);
r.get('/', listSO);
r.patch('/:id/status', authorize('super_admin','sales_manager','warehouse_manager'), updateSOStatus);
r.get('/:id/invoice.pdf', invoicePDF);
export default r;
