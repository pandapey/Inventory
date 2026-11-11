import { Router } from 'express';
import { createSupplier, listSuppliers, updateSupplier, supplierHistory, createPO, listPO, receivePO } from '../controllers/opsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { supplierSchemaJoi, poSchemaJoi } from '../utils/validators.js';

const r = Router();
r.use(protect);
r.post('/suppliers', authorize('super_admin','warehouse_manager'), validate(supplierSchemaJoi), createSupplier);
r.get('/suppliers', listSuppliers);
r.put('/suppliers/:id', authorize('super_admin','warehouse_manager'), updateSupplier);
r.get('/suppliers/:id/history', supplierHistory);
r.post('/purchase-orders', authorize('super_admin','warehouse_manager'), validate(poSchemaJoi), createPO);
r.get('/purchase-orders', listPO);
r.post('/purchase-orders/:id/receive', authorize('super_admin','warehouse_manager'), receivePO);
export default r;
