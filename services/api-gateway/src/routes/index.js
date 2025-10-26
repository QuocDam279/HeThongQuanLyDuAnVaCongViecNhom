// src/routes/index.js
import { authRoutes } from './auth.routes.js';
import { teamRoutes } from './team.routes.js';

export const registerRoutes = (app) => {
  authRoutes(app);
  teamRoutes(app);
};
