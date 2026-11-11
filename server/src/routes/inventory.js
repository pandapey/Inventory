import { Router } from 'express';
import { stockMove, history, warehouseStock } from '../controllers/inventoryController.js';
import { createWarehouse, listWarehouses, dashboard, salesReport, inventoryReport } from '../controllers/opsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { stockMoveSchema, warehouseSchemaJoi } from '../utils/validators.js';

const r = Router();
r.use(protect);
r.post('/move', authorize('super_admin','warehouse_manager','employee'), validate(stockMoveSchema), stockMove);
r.get('/history', history);
r.get('/warehouse/:warehouseId', warehouseStock);
r.post('/warehouses', authorize('super_admin','warehouse_manager'), validate(warehouseSchemaJoi), createWarehouse);
r.get('/warehouses', listWarehouses);
r.get('/dashboard', dashboard);
r.get('/reports/sales', authorize('super_admin','sales_manager','warehouse_manager'), salesReport);
r.get('/reports/inventory', authorize('super_admin','warehouse_manager'), inventoryReport);
export default r;
