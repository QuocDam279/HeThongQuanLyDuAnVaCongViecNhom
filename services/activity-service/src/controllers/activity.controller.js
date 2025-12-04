// controllers/activityController.js
import ActivityLog from '../models/ActivityLog.js';
import http from '../utils/httpClient.js';

export const createActivityLog = async (req, res) => {
  try {
    const { user_id, action, related_id, related_type } = req.body;

    if (!user_id || !action || !related_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, action, related_type'
      });
    }

    if (!['task', 'project', 'team'].includes(related_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid related_type. Must be: task, project, or team'
      });
    }

    const activityLog = await ActivityLog.create({
      user_id,
      action,
      related_id,
      related_type
    });

    res.status(201).json({
      success: true,
      message: 'Activity log created successfully',
      data: activityLog
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity log',
      error: error.message
    });
  }
};

export const getUserActivities = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, page = 1, related_type } = req.query;

    const query = { user_id };
    if (related_type) query.related_type = related_type;

    // Lấy activities
    const activities = await ActivityLog.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Tạo map chứa tất cả related_id theo type
    const grouped = activities.reduce((acc, activity) => {
      if (activity.related_id) {
        const type = activity.related_type;
        if (!acc[type]) acc[type] = new Set();
        acc[type].add(activity.related_id.toString());
      }
      return acc;
    }, {});

    // Fetch batch dữ liệu cho từng type
    const relatedDataMap = {};
    for (const [type, idSet] of Object.entries(grouped)) {
      try {
        const ids = Array.from(idSet);
        const response = await http[type].get(`/batch?ids=${ids.join(',')}`);
        const dataList = response.data?.data || [];
        relatedDataMap[type] = {};
        dataList.forEach(item => {
          const itemId = (item._id || item.id).toString();
          relatedDataMap[type][itemId] = item;
        });
      } catch (error) {
        console.error(`Failed to fetch ${type} data:`, error.message);
        relatedDataMap[type] = {};
      }
    }

    // Attach related_data cho activities
    const enrichedActivities = activities.map(activity => {
      const relatedData =
        activity.related_id && relatedDataMap[activity.related_type]
          ? relatedDataMap[activity.related_type][activity.related_id.toString()] || null
          : null;

      // Chuẩn hóa tên hiển thị để frontend không cần sửa
      let displayName = 'Chưa xác định';
      if (relatedData) {
        displayName =
          relatedData.name ||
          relatedData.title ||
          relatedData.project_name ||
          relatedData.team_name ||
          'Chưa xác định';
      }

      return {
        ...activity,
        related_data: { ...relatedData, displayName }
      };
    });

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: enrichedActivities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error.message
    });
  }
};

export const getRelatedActivities = async (req, res) => {
  try {
    const { related_id, related_type } = req.params;
    const { limit = 50, page = 1 } = req.query;

    if (!['task', 'project', 'team'].includes(related_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid related_type'
      });
    }

    const activities = await ActivityLog.find({ related_id, related_type })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user_id', 'name email')
      .lean();

    const total = await ActivityLog.countDocuments({ related_id, related_type });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching related activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related activities',
      error: error.message
    });
  }
};

export const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;

    const activityLog = await ActivityLog.findByIdAndDelete(id);

    if (!activityLog) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity log',
      error: error.message
    });
  }
};