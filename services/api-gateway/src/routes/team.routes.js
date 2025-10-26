// gateway/src/routes/team.routes.js
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../utils/serviceMap.js';
import { verifyToken } from '../middleware/auth.middleware.js';

export const teamRoutes = (app) => {
  app.use(
    '/teams',
    verifyToken, // 🧠 Middleware kiểm tra JWT trước khi proxy
    createProxyMiddleware({
      target: services.team,
      changeOrigin: true,
      pathRewrite: { '^/teams': '/api/teams' },
      onProxyReq: (proxyReq, req) => {
        console.log(`➡️ Proxying [${req.method}] ${req.originalUrl} → ${services.team}`);
      },
      onError: (err, req, res) => {
        console.error(`❌ Team service error: ${err.message}`);
        res.status(502).json({ message: 'Team service unavailable' });
      },
    })
  );
};
