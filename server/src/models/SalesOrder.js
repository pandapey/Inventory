import mongoose from 'mongoose';

const soItem = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 }
}, { _id: false });

const soSchema = new mongoose.Schema({
  soNumber: { type: String, unique: true, index: true },
  customer: {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String
  },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [soItem],
  taxRate: { type: Number, default: 0 },
  subTotal: Number,
  taxAmount: Number,
  total: Number,
  status: { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

soSchema.pre('save', function(next) {
  if (!this.soNumber) this.soNumber = 'SO-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const sub = this.items.reduce((s, i) => {
    const lineDiscount = Math.min(i.discount || 0, i.quantity * i.price);
    return s + Math.max(0, i.quantity * i.price - lineDiscount);
  }, 0);
  this.subTotal = sub;
  this.taxAmount = sub * (Math.min(Math.max(this.taxRate || 0, 0), 100) / 100);
  this.total = sub + this.taxAmount;
  next();
});

export default mongoose.model('SalesOrder', soSchema);
