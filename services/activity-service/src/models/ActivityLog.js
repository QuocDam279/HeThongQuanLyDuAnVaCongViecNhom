import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
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

activityLogSchema.index({ user_id: 1 });
activityLogSchema.index({ related_id: 1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
