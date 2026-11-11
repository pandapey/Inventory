import Warehouse from '../models/Warehouse.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import SalesOrder from '../models/SalesOrder.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { ApiError, asyncHandler, toCSV } from '../utils/helpers.js';
import { emitStockUpdate } from '../sockets/inventorySocket.js';
import { buildInvoicePDF } from '../utils/pdf.js';

// Warehouses
const WAREHOUSE_ALLOWED = ['name', 'code', 'address', 'city', 'isActive', 'manager'];
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
export const createWarehouse = asyncHandler(async (req, res) => {
  const w = await Warehouse.create(pick(req.body, WAREHOUSE_ALLOWED));
  res.status(201).json({ success: true, data: w });
});
export const listWarehouses = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Warehouse.find().sort('name') });
});

// Suppliers
const SUPPLIER_ALLOWED = ['name', 'email', 'phone', 'address', 'taxId', 'paymentTerms', 'isActive', 'notes'];
export const createSupplier = asyncHandler(async (req, res) => {
  const s = await Supplier.create(pick(req.body, SUPPLIER_ALLOWED));
  res.status(201).json({ success: true, data: s });
});
export const listSuppliers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 20;
  const filter = req.query.search ? { name: new RegExp(req.query.search, 'i') } : {};
  const [data, total] = await Promise.all([Supplier.find(filter).skip((page-1)*limit).limit(limit).sort('-createdAt'), Supplier.countDocuments(filter)]);
  res.json({ success: true, data, meta: { total, page, limit, pages: Math.ceil(total/limit) } });
});
export const updateSupplier = asyncHandler(async (req, res) => {
  const s = await Supplier.findByIdAndUpdate(req.params.id, pick(req.body, SUPPLIER_ALLOWED), { new: true, runValidators: true });
  if (!s) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, data: s });
});
export const supplierHistory = asyncHandler(async (req, res) => {
  const pos = await PurchaseOrder.find({ supplier: req.params.id }).populate('warehouse').sort('-createdAt').limit(50);
  res.json({ success: true, data: pos });
});

// Purchase Orders
export const createPO = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: po });
});
export const listPO = asyncHandler(async (req, res) => {
  const filter = {}; if (req.query.status) filter.status = req.query.status;
  const data = await PurchaseOrder.find(filter).populate('supplier warehouse items.product').sort('-createdAt').limit(100);
  res.json({ success: true, data });
});
export const receivePO = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) throw new ApiError(404, 'PO not found');
  if (po.status === 'received') throw new ApiError(400, 'Purchase order already received');
  if (po.status === 'cancelled') throw new ApiError(400, 'Cannot receive a cancelled purchase order');
  // receive all remaining
  let receivedAny = false;
  for (const item of po.items) {
    const qty = item.quantity - item.received;
    if (qty <= 0) continue;
    receivedAny = true;
    await Inventory.findOneAndUpdate({ product: item.product, warehouse: po.warehouse }, { $inc: { quantity: qty } }, { upsert: true, new: true });
    await StockMovement.create({ product: item.product, warehouse: po.warehouse, type: 'in', quantity: qty, refType: 'purchase', refId: po._id, createdBy: req.user._id });
    item.received = item.quantity;
    const agg = await Inventory.aggregate([{ $match: { product: item.product } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
    await Product.findByIdAndUpdate(item.product, { stockQuantity: agg[0]?.total || 0 });
    emitStockUpdate({ product: item.product });
  }
  if (!receivedAny) throw new ApiError(400, 'Nothing to receive');
  po.status = 'received';
  await po.save();
  res.json({ success: true, data: po });
});

// Sales Orders
const VALID_TRANSITIONS = { pending: ['confirmed','cancelled'], confirmed: ['processing','cancelled'], processing: ['shipped','cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };
export const createSO = asyncHandler(async (req, res) => {
  const so = await SalesOrder.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: so });
});
export const listSO = asyncHandler(async (req, res) => {
  const filter = {}; if (req.query.status) filter.status = req.query.status;
  const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 20;
  const [data, total] = await Promise.all([
    SalesOrder.find(filter).populate('items.product warehouse').sort('-createdAt').skip((page-1)*limit).limit(limit),
    SalesOrder.countDocuments(filter)
  ]);
  res.json({ success: true, data, meta: { total, page, limit, pages: Math.ceil(total/limit) } });
});
export const updateSOStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !Object.values(VALID_TRANSITIONS).flat().concat(Object.keys(VALID_TRANSITIONS)).includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }
  const so = await SalesOrder.findById(req.params.id);
  if (!so) throw new ApiError(404, 'Order not found');
  if (!VALID_TRANSITIONS[so.status]?.includes(status)) throw new ApiError(400, `Cannot transition ${so.status} -> ${status}`);
  // on shipped: pre-check all lines first, then deduct atomically to avoid partial deducts
  if (status === 'shipped') {
    for (const item of so.items) {
      const inv = await Inventory.findOne({ product: item.product, warehouse: so.warehouse });
      if (!inv || inv.quantity < item.quantity) throw new ApiError(400, `Insufficient stock for ${item.product}`);
    }
    for (const item of so.items) {
      const inv = await Inventory.findOneAndUpdate(
        { product: item.product, warehouse: so.warehouse, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
      if (!inv) throw new ApiError(400, `Insufficient stock for ${item.product} (concurrent update)`);
      await StockMovement.create({ product: item.product, warehouse: so.warehouse, type: 'out', quantity: item.quantity, refType: 'sale', refId: so._id, createdBy: req.user._id });
      const agg = await Inventory.aggregate([{ $match: { product: item.product } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
      await Product.findByIdAndUpdate(item.product, { stockQuantity: agg[0]?.total || 0 });
    }
  }
  so.status = status;
  await so.save();
  res.json({ success: true, data: so });
});
export const invoicePDF = asyncHandler(async (req, res) => {
  const so = await SalesOrder.findById(req.params.id).populate('items.product');
  if (!so) throw new ApiError(404, 'Order not found');
  buildInvoicePDF(so, res);
});

// Dashboard
export const dashboard = asyncHandler(async (req, res) => {
  const [totalProducts, valueAgg, lowStock, outOfStock] = await Promise.all([
    Product.countDocuments({ isArchived: { $ne: true } }),
    Product.aggregate([
      { $match: { isArchived: { $ne: true } } },
      { $group: { _id: null, total: { $sum: { $multiply: [{ $ifNull: ['$stockQuantity', 0] }, { $ifNull: ['$costPrice', 0] }] } } } }
    ]),
    Product.countDocuments({ isArchived: { $ne: true }, $expr: { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$minStockLevel'] }] } }),
    Product.countDocuments({ isArchived: { $ne: true }, stockQuantity: 0 })
  ]);
  const totalValue = valueAgg[0]?.total || 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const todaysOrders = await SalesOrder.countDocuments({ createdAt: { $gte: today } });
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthly = await SalesOrder.aggregate([{ $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, sales: { $sum: '$total' }, count: { $sum: 1 } } }]);
  const monthlySales = monthly[0]?.sales || 0;
  const purchaseAgg = await PurchaseOrder.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, cost: { $sum: '$totalCost' } } }]);
  const purchaseCosts = purchaseAgg[0]?.cost || 0;
  res.json({ success: true, data: { totalProducts, totalValue, lowStock, outOfStock, todaysOrders, monthlySales, purchaseCosts, profitEst: monthlySales - purchaseCosts, monthlyOrders: monthly[0]?.count || 0 } });
});

// Reports
export const salesReport = asyncHandler(async (req, res) => {
  const match = {};
  if (req.query.from || req.query.to) match.createdAt = { ...(req.query.from ? { $gte: new Date(req.query.from) } : {}), ...(req.query.to ? { $lte: new Date(req.query.to) } : {}) };
  const data = await SalesOrder.find(match).populate('items.product').sort('-createdAt').limit(500);
  if (req.query.format === 'csv') {
    const rows = data.map(o => ({ number: o.soNumber, date: o.createdAt.toISOString(), status: o.status, total: o.total }));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales.csv');
    return res.send(toCSV(rows));
  }
  res.json({ success: true, data });
});
export const inventoryReport = asyncHandler(async (req, res) => {
  const data = await Product.find().select('name sku category brand costPrice sellingPrice stockQuantity minStockLevel').sort('name').limit(1000);
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    return res.send(toCSV(data.map(d => d.toObject())));
  }
  res.json({ success: true, data });
});
