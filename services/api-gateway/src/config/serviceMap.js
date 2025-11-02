// danh sách URL cho các service nội bộ (Docker network)
export const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001/api/auth',
  team: process.env.TEAM_SERVICE_URL || 'http://team-service:5002/api/teams'
};
