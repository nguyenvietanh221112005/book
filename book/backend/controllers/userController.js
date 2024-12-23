const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({ 
      message: "Đăng ký thành công",
      userId 
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Thêm log để debug
    console.log("Login attempt:", { email });
    
    // Lấy thông tin user từ database
    const user = await userModel.getUserByEmail(email);
    
    // Log để kiểm tra user có được tìm thấy không
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    // Log kết quả so sánh mật khẩu
    console.log("Password comparison result:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Loại bỏ password trước khi gửi response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

module.exports = { registerUser, loginUser };