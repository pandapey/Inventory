import mongoose from 'mongoose';

const poItem = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, required: true, min: 1 }, costPrice: { type: Number, required: true, min: 0 }, received: { type: Number, default: 0 } }, { _id: false });

const poSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true, index: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [poItem],
  expectedDelivery: Date,
  status: { type: String, enum: ['draft','ordered','partial','received','cancelled'], default: 'draft', index: true },
  totalCost: { type: Number, default: 0 },
  invoiceUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

poSchema.pre('save', function(next) {
  if (!this.poNumber) this.poNumber = 'PO-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  this.totalCost = this.items.reduce((s, i) => s + i.quantity * i.costPrice, 0);
  next();
});

export default mongoose.model('PurchaseOrder', poSchema);
