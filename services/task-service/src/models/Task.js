import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  project_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  task_name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String 
  },
  assigned_to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  start_date: { 
    type: Date 
  },
  due_date: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Review', 'Done'], 
    default: 'To Do' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  progress: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// ✅ Tự động cập nhật `updated_at` khi chỉnh sửa
taskSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// ✅ Index giúp tăng tốc truy vấn (theo project, người được giao, task cha)
taskSchema.index({ project_id: 1 });
taskSchema.index({ assigned_to: 1 });

export default mongoose.models.Task || mongoose.model('Task', taskSchema);

