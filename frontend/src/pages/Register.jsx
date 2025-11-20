import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";

function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Email không hợp lệ.");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const API_URL = import.meta.env.VITE_API_URL;

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || data.error || "Yêu cầu không hợp lệ.";

        if (response.status === 400) {
          if (msg.includes("Email")) {
            throw new Error("Email đã được sử dụng. Vui lòng chọn email khác.");
          }
          if (msg.includes("role")) {
            throw new Error("Vai trò không hợp lệ.");
          }
          if (msg.includes("Thiếu thông tin")) {
            throw new Error("Thiếu thông tin bắt buộc từ phía server.");
          }
          throw new Error(msg);
        }

        if (response.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        }

        throw new Error(msg);
      }

      setSuccess("Đăng ký thành công! Chào mừng bạn đến với QuestDo.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3500);
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <div className="hero">
        <div className="card">
          <div className="brand">
            <div className="logo">QD</div>
            <div className="title">QuestDo</div>
          </div>

          <h2 className="heading">Tạo tài khoản mới</h2>
          <p className="sub">Điền thông tin để bắt đầu hành trình của bạn</p>

          <form className="form" onSubmit={handleSubmit}>
            <label className={`field ${form.full_name ? "filled" : ""}`}>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
              <span className="label-text">Họ và tên</span>
            </label>

            <label className={`field ${form.email ? "filled" : ""}`}>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <span className="label-text">Email</span>
            </label>

            <label className={`field ${form.password ? "filled" : ""}`}>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span className="label-text">Mật khẩu</span>
            </label>

            <label className={`field ${form.confirmPassword ? "filled" : ""}`}>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <span className="label-text">Xác nhận mật khẩu</span>
            </label>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <div className="register-link">
              <span>Đã có tài khoản?</span>
              <Link to="/login">Đăng nhập</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay thông báo */}
      <div className="message-overlay">
        {success && <div className="success-toast">{success}</div>}
        {error && <div className="error-toast">{error}</div>}
      </div>
    </div>
  );
}

export default Register;