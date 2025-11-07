import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  task_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  is_read: { 
    type: Boolean, 
    default: false 
  },
  sent_at: {   // thời gian gửi mail
    type: Date
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Index để truy vấn nhanh theo user và trạng thái đọc
notificationSchema.index({ user_id: 1, is_read: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
