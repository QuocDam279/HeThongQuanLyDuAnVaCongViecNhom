// api-gateway/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware xác thực JWT cho API Gateway
 * - Kiểm tra token từ header "Authorization"
 * - Giải mã JWT
 * - Gắn thông tin user vào header để chuyển sang các service khác
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: '❌ Thiếu Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '❌ Không có token trong header' });
  }

  try {
    // Giải mã token bằng secret của Gateway
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin user vào req để các route khác có thể dùng (nếu cần)
    req.user = decoded;

    // ✨ Truyền thông tin người dùng sang các service phía sau
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;

    // Cho phép request đi tiếp đến proxy middleware
    next();
  } catch (error) {
    console.error('❌ Lỗi xác thực token:', error.message);
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
