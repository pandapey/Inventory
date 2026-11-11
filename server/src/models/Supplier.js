import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  email: String,
  phone: String,
  address: String,
  taxId: String,
  paymentTerms: String,
  isActive: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
