// src/utils/serviceMap.js
export const services = {
  auth: 'http://auth_service:5001',   // tên container của auth-service trong docker-compose
  team: 'http://team_service:5002',   // tên container của team-service
  // thêm các service khác sau này nếu có
};
