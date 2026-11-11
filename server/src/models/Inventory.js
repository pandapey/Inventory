import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
  quantity: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });
export default mongoose.model('Inventory', inventorySchema);
