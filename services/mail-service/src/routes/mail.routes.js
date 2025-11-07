import express from 'express';
import { sendMail } from '../controllers/mail.controller.js';

const router = express.Router();

// POST /api/mail/send
router.post('/send', sendMail);

export default router;
