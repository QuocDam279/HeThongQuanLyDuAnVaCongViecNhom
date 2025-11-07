import transporter from '../utils/transporter.js';
import mailConfig from '../config/mailConfig.js';

/**
 * 📧 Gửi mail đơn giản
 * body: { to, subject, text, html }
 */
export const sendMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
    }

    const mailOptions = {
      from: mailConfig.from,
      to,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📤 Đã gửi mail tới ${to}`);

    res.json({ message: 'Gửi mail thành công' });
  } catch (error) {
    console.error('❌ Lỗi gửi mail:', error.message);
    res.status(500).json({ message: 'Gửi mail thất bại', error: error.message });
  }
};
