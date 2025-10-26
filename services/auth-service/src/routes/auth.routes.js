// services/auth-service/src/routes/auth.routes.js
import express from 'express';
import { register, login, getUsersInfo } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/users/info', getUsersInfo);

export default router;
