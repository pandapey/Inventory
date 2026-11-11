import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  barcode: { type: String, index: true },
  description: String,
  category: { type: String, required: true, index: true },
  brand: String,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  minStockLevel: { type: Number, default: 10 },
  isArchived: { type: Boolean, default: false, index: true },
  images: [{ url: String, publicId: String }],
  // denormalized total stock across warehouses for fast dashboard; source of truth is Inventory collection
  stockQuantity: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ name: 'text', sku: 'text', barcode: 'text', category: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
