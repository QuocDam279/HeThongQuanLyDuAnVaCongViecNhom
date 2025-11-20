import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (success || err) {
      const timer = setTimeout(() => {
        setSuccess("");
        setErr("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, err]);

  function validate() {
    if (!email) return "Email không được để trống.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Email không hợp lệ.";
    if (!password) return "Mật khẩu không được để trống.";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErr(v);
    setSuccess("");
    if (v) return;

    try {
      setLoading(true);

      // gọi API thật
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || data.error || "Đăng nhập thất bại.";

        if (response.status === 400) {
          if (msg.includes("Email")) {
            throw new Error("Email không tồn tại.");
          }
          if (msg.includes("mật khẩu")) {
            throw new Error("Sai mật khẩu.");
          }
          throw new Error(msg);
        }

        if (response.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        }

        throw new Error(msg);
      }

      // lưu token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("🎉 Đăng nhập thành công!");
      setTimeout(() => navigate("/dashboard"), 3500);
    } catch (err) {
      console.error("❌ Login error:", err);
      setErr(err.message || "Đã xảy ra lỗi khi đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="hero">
        <div className="card">
          <div className="brand">
            <div className="logo">QD</div>
            <div className="title">QuestDo</div>
          </div>

          <h2 className="heading">Chào mừng trở lại</h2>
          <p className="sub">Đăng nhập để tiếp tục vào không gian làm việc của bạn</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className={`field ${email ? "filled" : ""}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setErr("")}
                required
              />
              <span className="label-text">Email</span>
            </label>

            <label className={`field ${password ? "filled" : ""}`}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setErr("")}
                required
              />
              <span className="label-text">Mật khẩu</span>
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </label>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="register-link">
              <span>Chưa có tài khoản?</span>
              <Link to="/register">Đăng ký</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay thông báo */}
      <div className="message-overlay">
        {success && <div className="success-toast">{success}</div>}
        {err && <div className="error-toast">{err}</div>}
      </div>
    </div>
  );
}
