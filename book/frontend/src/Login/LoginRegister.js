import React, { useState } from "react";
import "../styles/LoginRegister.css";

const BASE_URL = "http://localhost:2211/api";

function LoginRegister({ onClose, isRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          role: 'user' // Mặc định role là user
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng ký thành công!");
        onClose();
      } else {
        alert(data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert("Đã xảy ra lỗi khi đăng ký");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login response:", data); // Thêm log để debug
        onLoginSuccess(data.user);
        
      } else {
        alert(data.message || "Sai thông tin đăng nhập");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đã xảy ra lỗi khi đăng nhập");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isRegister ? "Đăng Ký" : "Đăng Nhập"}</h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Tên"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">
            {isRegister ? "Đăng Ký" : "Đăng Nhập"}
          </button>
          <button type="button" onClick={onClose}>
            Đóng
          </button>
        </form>
      </div>
    </div>
  );
}
export default LoginRegister;                                                                    