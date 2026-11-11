import mongoose from 'mongoose';

const notifSchema = new mongoose.Schema({
  type: { type: String, enum: ['low_stock','out_of_stock','order','purchase','system'], required: true },
  title: { type: String, required: true },
  message: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  isRead: { type: Boolean, default: false },
  role: String
}, { timestamps: true });

export default mongoose.model('Notification', notifSchema);
