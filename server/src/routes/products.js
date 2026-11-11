import { Router } from 'express';
import { createProduct, listProducts, getProduct, updateProduct, archiveProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchemaJoi } from '../utils/validators.js';

const r = Router();
r.use(protect);
r.get('/', listProducts);
r.get('/:id', getProduct);
r.post('/', authorize('super_admin','warehouse_manager'), validate(productSchemaJoi), createProduct);
r.put('/:id', authorize('super_admin','warehouse_manager'), updateProduct);
r.post('/:id/archive', authorize('super_admin','warehouse_manager'), archiveProduct);
r.delete('/:id', authorize('super_admin'), deleteProduct);
export default r;
