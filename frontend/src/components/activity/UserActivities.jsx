// src/components/UserActivitiesTimeline.jsx
import { useEffect, useState, useRef } from 'react';
import { getUserActivities } from '../../services/activityService';
import {
  Clock,
  Plus,
  Edit,
  Trash,
  Check,
  User,
  MessageCircle,
  Repeat,
  Archive,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const activityTypeMap = {
  task: 'Công việc',
  project: 'Dự án',
  team: 'Nhóm'
};

const typeColors = {
  task: 'bg-blue-100 text-blue-800',
  project: 'bg-green-100 text-green-800',
  team: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

const getActionIcon = (action, type) => {
  if (!action) return '📝';
  const a = action.toLowerCase();
  const iconProps = { className: 'w-5 h-5' };

  if (a.includes('tạo công việc') || a.includes('tạo dự án') || a.includes('tạo nhóm')) return <Plus {...iconProps} />;
  if (a.includes('cập nhật công việc') || a.includes('cập nhật tiến độ')) return <Edit {...iconProps} />;
  if (a.includes('xóa')) return <Trash {...iconProps} />;
  if (a.includes('hoàn thành')) return <Check {...iconProps} />;
  if (a.includes('thêm')) return <User {...iconProps} />;
  if (a.includes('bình luận')) return <MessageCircle {...iconProps} />;
  if (a.includes('di chuyển')) return <Repeat {...iconProps} />;
  if (a.includes('lưu trữ')) return <Archive {...iconProps} />;

  return '📝';
};

const UserActivitiesTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const LIMIT = 50;

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id;
    } catch {
      return null;
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Người dùng chưa đăng nhập');

      const params = {
        related_type: filter === 'all' ? null : filter,
        page: currentPage,
        limit: LIMIT
      };
      
      const response = await getUserActivities(userId, params);

      if (response.success) {
        setActivities(response.data);
        // Backend trả về 'pages' thay vì 'totalPages'
        setTotalPages(response.pagination?.pages || 1);
        setTotalActivities(response.pagination?.total || response.data.length);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLock = useRef(false);
  const fetchDebounce = useRef(null);

  const safeFetchActivities = () => {
    if (fetchLock.current) return;

    fetchLock.current = true;
    fetchActivities().finally(() => {
      fetchLock.current = false;
    });
  };

  // Khi đổi filter → reset page và debounce fetch
  useEffect(() => {
    setCurrentPage(1);

    clearTimeout(fetchDebounce.current);
    fetchDebounce.current = setTimeout(() => {
      safeFetchActivities();
    }, 150);
  }, [filter]);

  // Khi đổi page → debounce fetch
  useEffect(() => {
    clearTimeout(fetchDebounce.current);
    fetchDebounce.current = setTimeout(() => {
      safeFetchActivities();
    }, 150);
  }, [currentPage]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Nhật ký hoạt động</h1>
      <p className="text-gray-500 mb-6">Timeline trực quan các hoạt động của bạn</p>

      {/* Filter */}
      <div className="flex gap-2 mb-8">
        {['all', 'task', 'project', 'team'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? 'Tất cả' : activityTypeMap[type]}
          </button>
        ))}
      </div>

      {/* Total count */}
      {!loading && !error && totalActivities > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{totalActivities}</span> hoạt động
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 font-medium">
          ❌ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-xl">📭 Chưa có hoạt động nào</div>
      )}

      {/* Timeline */}
      {!loading && !error && activities.length > 0 && (
        <>
          <div className="relative before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
            {activities.map(activity => {
              const type = activity.related_type || 'default';
              return (
                <div key={activity._id} className="relative flex items-start mb-8">
                  {/* Dot */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl ${typeColors[type]} shadow-md`}
                  >
                    {getActionIcon(activity.action, type)}
                  </div>

                  {/* Card */}
                  <div className="ml-6 bg-white p-4 rounded-xl shadow hover:shadow-lg transition-shadow w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{activity.action}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[type]}`}
                      >
                        {activityTypeMap[type] || 'Chưa xác định'}
                      </span>
                    </div>

                    {/* Related data */}
                    {activity.related_data && !activity.action.includes(
                      activity.related_data.name || activity.related_data.project_name || activity.related_data.team_name || activity.related_data.title
                    ) && (
                      <p className="text-gray-700 mb-1 truncate">
                        {activity.related_data.name ||
                        activity.related_data.project_name ||
                        activity.related_data.team_name ||
                        activity.related_data.title ||
                        'Chưa xác định'}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pb-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Trang trước
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  Trang <span className="font-bold text-blue-600">{currentPage}</span> / {totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Trang sau
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivitiesTimeline;