import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: String,
  entityId: String,
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('ActivityLog', logSchema);
