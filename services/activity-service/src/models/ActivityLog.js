// models/ActivityLog.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true
  },
  related_type: {
    type: String,
    enum: ['task', 'project', 'team'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for better performance
activityLogSchema.index({ user_id: 1, created_at: -1 });
activityLogSchema.index({ related_id: 1, related_type: 1 });

// TTL index - tự động xóa logs cũ hơn 90 ngày (7776000 giây)
activityLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);