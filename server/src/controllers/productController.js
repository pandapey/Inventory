import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import ActivityLog from '../models/ActivityLog.js';
import StockMovement from '../models/StockMovement.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';
import { logActivity } from '../utils/tokens.js';

const PRODUCT_UPDATE_ALLOWED = ['name', 'barcode', 'description', 'category', 'brand', 'supplier', 'costPrice', 'sellingPrice', 'minStockLevel', 'images'];

export const createProduct = asyncHandler(async (req, res) => {
  const exists = await Product.findOne({ sku: req.body.sku });
  if (exists) throw new ApiError(400, 'SKU already exists');
  const product = await Product.create(req.body);
  await logActivity(ActivityLog, { user: req.user, action: 'product.create', entity: 'Product', entityId: product._id });
  res.status(201).json({ success: true, data: product });
});

export const listProducts = asyncHandler(async (req, res) => {
  const { search, category, brand, low, out, archived } = req.query;
  const filter = {};
  if (archived !== 'true') filter.isArchived = { $ne: true };
  else if (archived === 'true') filter.isArchived = true;
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (search) filter.$text = { $search: search };
  if (out === 'true') filter.stockQuantity = 0;
  if (low === 'true') filter.$expr = { $lte: ['$stockQuantity', '$minStockLevel'] };
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const q = Product.find(filter).sort('-createdAt').skip((page-1)*limit).limit(limit).populate('supplier');
  const [data, total] = await Promise.all([q, Product.countDocuments(filter)]);
  res.json({ success: true, data, meta: { total, page, limit, pages: Math.ceil(total/limit) } });
});

export const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('supplier');
  if (!p) throw new ApiError(404, 'Product not found');
  const stock = await Inventory.find({ product: p._id }).populate('warehouse');
  res.json({ success: true, data: p, stock });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updates = Object.fromEntries(PRODUCT_UPDATE_ALLOWED.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]]));
  const p = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!p) throw new ApiError(404, 'Product not found');
  await logActivity(ActivityLog, { user: req.user, action: 'product.update', entity: 'Product', entityId: p._id });
  res.json({ success: true, data: p });
});

export const archiveProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
  if (!p) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: p });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const linked = await Inventory.countDocuments({ product: req.params.id });
  const moves = await StockMovement.countDocuments({ product: req.params.id });
  if (linked > 0 || moves > 0) throw new ApiError(400, 'Cannot delete product with inventory history. Archive it instead.');
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw new ApiError(404, 'Product not found');
  res.json({ success: true, message: 'Deleted' });
});
