// src/services/activityService.js
const API_URL = `${import.meta.env.VITE_API_URL}/activity-logs`;

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Hàm chuẩn gọi API có token
async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi API Activity Service");
  return data;
}

// ========================
// 🟦 ACTIVITY LOG API
// ========================

// Tạo activity log mới
export function createActivityLog({ user_id, action, related_id, related_type }) {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify({ user_id, action, related_id, related_type }),
  });
}

// Lấy activities theo user
export function getUserActivities(userId, params = {}) {
  const { limit = 50, page = 1, related_type } = params;
  
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    ...(related_type && { related_type }),
  });

  return apiRequest(`${API_URL}/user/${userId}?${queryParams}`, {
    method: "GET",
  });
}

// Lấy activities theo entity liên quan (task/project/team)
export function getRelatedActivities(relatedType, relatedId, params = {}) {
  const { limit = 50, page = 1 } = params;
  
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });

  return apiRequest(`${API_URL}/${relatedType}/${relatedId}?${queryParams}`, {
    method: "GET",
  });
}

// Xóa activity log
export function deleteActivityLog(activityId) {
  return apiRequest(`${API_URL}/${activityId}`, {
    method: "DELETE",
  });
}

// ========================
// 🎯 HELPER FUNCTIONS
// ========================

// Lấy activities của task cụ thể
export function getTaskActivities(taskId, params = {}) {
  return getRelatedActivities("task", taskId, params);
}

// Lấy activities của project cụ thể
export function getProjectActivities(projectId, params = {}) {
  return getRelatedActivities("project", projectId, params);
}

// Lấy activities của team cụ thể
export function getTeamActivities(teamId, params = {}) {
  return getRelatedActivities("team", teamId, params);
}

// Lấy activities của user hiện tại (lấy user_id từ token hoặc context)
export function getMyActivities(params = {}) {
  // Giả sử bạn có hàm getUserIdFromToken() để decode token
  const userId = getUserIdFromToken();
  return getUserActivities(userId, params);
}

// Helper: Decode user_id từ token (cần implement JWT decode)
function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT (phần payload là base64 giữa 2 dấu chấm)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || payload.id;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}