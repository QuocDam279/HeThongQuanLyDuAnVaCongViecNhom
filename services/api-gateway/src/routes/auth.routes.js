// gateway/src/routes/auth.routes.js
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../utils/serviceMap.js';

/**
 * 🔐 Proxy route cho Auth Service
 * - Tất cả các request bắt đầu bằng /auth → chuyển tiếp sang auth-service
 * - Không cần verifyToken vì đây là nơi login/register/refresh token
 */
export const authRoutes = (app) => {
  app.use(
    '/auth',
    createProxyMiddleware({
      target: services.auth,
      changeOrigin: true,
      pathRewrite: { '^/auth': '/api/auth' }, // khớp với route gốc trong auth-service
      onProxyReq: (proxyReq, req) => {
        // Log nhẹ để debug trong môi trường dev
        console.log(`➡️ [Auth] Proxying ${req.method} ${req.originalUrl} → ${services.auth}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Ghi log response status cho dễ theo dõi
        console.log(`✅ [Auth] Response ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
      },
      onError: (err, req, res) => {
        console.error(`❌ Auth service error: ${err.message}`);
        res.status(502).json({ message: 'Auth service unavailable' });
      },
    })
  );
};
