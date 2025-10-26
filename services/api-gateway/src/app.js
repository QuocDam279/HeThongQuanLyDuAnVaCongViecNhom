// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { registerRoutes } from './routes/index.js';

const app = express();

// Cấu hình middleware chung
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Đăng ký routes proxy
registerRoutes(app);

// Route test
app.get('/', (req, res) => {
  res.json({ message: '🚀 API Gateway is running!' });
});

export default app;
