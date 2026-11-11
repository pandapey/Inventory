import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import Notification from '../models/Notification.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';
import { emitStockUpdate } from '../sockets/inventorySocket.js';

async function syncProductStock(productId) {
  const agg = await Inventory.aggregate([{ $match: { product: productId } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
  const total = agg[0]?.total || 0;
  await Product.findByIdAndUpdate(productId, { stockQuantity: total });
  return total;
}

async function checkAlerts(product, total) {
  // Throttle: don't spam a notification if one for the same product+state exists in last 6h
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  if (total === 0) {
    const recent = await Notification.findOne({ product: product._id, type: 'out_of_stock', createdAt: { $gte: sixHoursAgo } });
    if (!recent) await Notification.create({ type: 'out_of_stock', title: `Out of stock: ${product.name}`, message: `SKU ${product.sku} is out of stock`, product: product._id });
  } else if (total <= product.minStockLevel) {
    const recent = await Notification.findOne({ product: product._id, type: 'low_stock', createdAt: { $gte: sixHoursAgo } });
    if (!recent) await Notification.create({ type: 'low_stock', title: `Low stock: ${product.name}`, message: `${total} left (min ${product.minStockLevel})`, product: product._id });
  }
}

export const stockMove = asyncHandler(async (req, res) => {
  const { product: productId, warehouse, type, quantity, reason, toWarehouse } = req.body;
  if (!Number.isInteger(quantity)) throw new ApiError(400, 'Quantity must be an integer');
  if (type === 'adjustment') {
    if (quantity < 0) throw new ApiError(400, 'Adjustment quantity must be >= 0');
  } else if (quantity <= 0) {
    throw new ApiError(400, 'Quantity must be a positive integer');
  }
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  if (type === 'transfer') {
    if (!toWarehouse) throw new ApiError(400, 'toWarehouse required for transfer');
    if (String(toWarehouse) === String(warehouse)) throw new ApiError(400, 'Source and destination warehouses must differ');
    // Atomic guard: only decrement when enough stock exists. No upsert on decrement
    // so we never create negative / junk docs.
    const from = await Inventory.findOneAndUpdate(
      { product: productId, warehouse, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!from) throw new ApiError(400, 'Insufficient stock for transfer');
    await Inventory.findOneAndUpdate({ product: productId, warehouse: toWarehouse }, { $inc: { quantity } }, { new: true, upsert: true });
    await StockMovement.create({ product: productId, warehouse, fromWarehouse: warehouse, toWarehouse, type, quantity, reason, refType: 'transfer', createdBy: req.user._id });
  } else if (type === 'in') {
    await Inventory.findOneAndUpdate({ product: productId, warehouse }, { $inc: { quantity } }, { new: true, upsert: true });
    await StockMovement.create({ product: productId, warehouse, type, quantity, reason, refType: 'manual', createdBy: req.user._id });
  } else if (type === 'out') {
    const inv = await Inventory.findOneAndUpdate(
      { product: productId, warehouse, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!inv) throw new ApiError(400, 'Insufficient stock');
    await StockMovement.create({ product: productId, warehouse, type, quantity, reason, refType: 'manual', createdBy: req.user._id });
  } else if (type === 'adjustment') {
    await Inventory.findOneAndUpdate({ product: productId, warehouse }, { $set: { quantity } }, { new: true, upsert: true });
    await StockMovement.create({ product: productId, warehouse, type, quantity, reason, refType: 'manual', createdBy: req.user._id });
  }

  const total = await syncProductStock(product._id);
  const fresh = await Product.findById(productId);
  await checkAlerts(fresh, total);
  emitStockUpdate({ product: productId, total });
  res.json({ success: true, total });
});

export const history = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.product) filter.product = req.query.product;
  if (req.query.warehouse) filter.warehouse = req.query.warehouse;
  if (req.query.type) filter.type = req.query.type;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const [data, total] = await Promise.all([
    StockMovement.find(filter).populate('product warehouse createdBy', 'name sku email role').sort('-createdAt').skip((page-1)*limit).limit(limit),
    StockMovement.countDocuments(filter)
  ]);
  res.json({ success: true, data, meta: { total, page, limit, pages: Math.ceil(total/limit) } });
});

export const warehouseStock = asyncHandler(async (req, res) => {
  const data = await Inventory.find({ warehouse: req.params.warehouseId }).populate('product warehouse');
  res.json({ success: true, data });
});
