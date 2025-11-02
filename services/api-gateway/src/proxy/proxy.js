import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/serviceMap.js';

/**
 * Proxy trung gian cho các service:
 * - /api/auth  → AUTH_SERVICE_URL
 * - /api/teams → TEAM_SERVICE_URL
 *
 * Gateway forward đầy đủ headers, Authorization và body tới downstream service.
 * Đã fix lỗi: "Cannot POST /api/auth/api/auth/register"
 * do lặp prefix /api/auth.
 */

// Hàm phụ để forward body nếu express.json() đã đọc trước
const forwardBody = (proxyReq, req) => {
  if (!req.body || !Object.keys(req.body).length) return;
  const bodyData = JSON.stringify(req.body);
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
};

// ----------------------------
// AUTH PROXY
// ----------------------------
export const authProxy = createProxyMiddleware({
  target: services.auth,            // ví dụ: http://auth-service:5001/api/auth
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/auth': ''                // ✅ Xóa prefix '/api/auth' khi forward
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[AUTH PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach auth service',
        error: err.message
      });
    }
  }
});

// ----------------------------
// TEAM PROXY
// ----------------------------
export const teamProxy = createProxyMiddleware({
  target: services.team,            // ví dụ: http://team-service:5002/api/teams
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/teams': ''               // ✅ Xóa prefix '/api/teams' khi forward
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[TEAM PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach team service',
        error: err.message
      });
    }
  }
});
