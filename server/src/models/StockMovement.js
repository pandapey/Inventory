import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  type: { type: String, enum: ['in','out','adjustment','transfer'], required: true, index: true },
  quantity: { type: Number, required: true },
  reason: String,
  refType: { type: String, enum: ['purchase','sale','manual','transfer'] },
  refId: mongoose.Schema.Types.ObjectId,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('StockMovement', movementSchema);
